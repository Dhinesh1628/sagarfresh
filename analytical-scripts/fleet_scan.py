import argparse
import json
from datetime import datetime, timezone
from statistics import mean, median

from scan_common import find_cooler, load_data, parse_time, show_time


def get_fleet_details(qr, data=None):
    """Refund decision + this cooler's average/median return time + recovery rate."""
    data = data or load_data()
    cooler = find_cooler(data, qr)
    if cooler is None:
        return {"found": False, "qr": qr}

    cid = cooler["id"]
    limit = cooler.get("maxHoldingHours", 36)
    deposit = cooler.get("depositAmount", 250)

    orders = sorted((o for o in data.get("orders", []) if o.get("coolerId") == cid),
                    key=lambda o: parse_time(o["createdAt"]))
    returns = [r for r in data.get("coolerReturns", []) if r.get("coolerId") == cid]

    # One "trip" per DELIVERED order. Start = deliveredAt if the app saves it, else order time.
    trips = []
    for o in orders:
        if str(o.get("orderStatus", "")).upper() != "DELIVERED":
            continue
        trips.append({
            "orderId": o["id"],
            "start": parse_time(o.get("deliveredAt") or o["createdAt"]),
            "returnedAt": None,
            "refund": None,
            "flag": bool(o.get("coolerReturned")),
            "updatedAt": o.get("updatedAt"),
        })

    # Attach each return record to the latest trip that started before it
    loose_returns = []
    for r in returns:
        t = parse_time(r.get("completedAt") or r["requestDate"])
        earlier = [tr for tr in trips if tr["start"] <= t]
        if earlier:
            earlier[-1]["returnedAt"] = t
            earlier[-1]["refund"] = r
        else:
            loose_returns.append(r)

    # Orders flagged coolerReturned=true without a return record: use the order's last update time
    for tr in trips:
        if tr["returnedAt"] is None and tr["flag"] and tr["updatedAt"]:
            tr["returnedAt"] = parse_time(tr["updatedAt"])
        tr["hours"] = ((tr["returnedAt"] - tr["start"]).total_seconds() / 3600
                       if tr["returnedAt"] else None)

    out = {
        "found": True, "coolerId": cid, "qrCode": cooler.get("qrCode"),
        "model": cooler.get("model"), "coolerStatus": cooler.get("status"),
        "hub": cooler.get("assignedHub"), "limitHours": limit, "depositAmount": deposit,
    }

    # ---- refund decision ----
    latest = orders[-1] if orders else None
    if latest is None:
        decision = {"status": "NO_ORDER", "reason": "No order has used this cooler yet."}
    elif str(latest.get("orderStatus", "")).upper() != "DELIVERED":
        decision = {"status": "NOT_DELIVERED_YET",
                    "reason": f"Order {latest['id']} has not been delivered yet "
                              f"(status: {latest.get('status')})."}
    else:
        tr = trips[-1]
        out["thisDelivery"] = {
            "orderId": tr["orderId"], "deliveredAt": show_time(tr["start"]),
            "returnedAt": show_time(tr["returnedAt"]) if tr["returnedAt"] else None,
        }
        if tr["returnedAt"]:
            h = tr["hours"]
            ok = h <= limit
            decision = {
                "status": "ELIGIBLE" if ok else "NOT_ELIGIBLE", "hoursKept": round(h, 1),
                "refundAmount": deposit if ok else 0,
                "reason": (f"Returned in {h:.1f} hours. The limit is {limit} hours." if ok else
                           f"Returned in {h:.1f} hours, {h - limit:.1f} hours past the "
                           f"{limit}-hour limit."),
            }
            if tr["refund"]:
                decision["refundRecorded"] = (
                    f"Return {tr['refund'].get('id')} is already marked "
                    f"'{tr['refund'].get('status')}' (Rs. {tr['refund'].get('refundAmount', 0)}).")
        else:
            h = (datetime.now(timezone.utc) - tr["start"]).total_seconds() / 3600
            decision = {
                "status": "WAIT", "hoursSinceDelivery": round(h, 1),
                "ifReturnedNow": "ELIGIBLE" if h <= limit else "NOT_ELIGIBLE",
                "reason": (f"The cooler has not been returned. If it is returned now "
                           f"({h:.1f} hours after delivery) it would be "
                           f"{'ELIGIBLE' if h <= limit else 'NOT ELIGIBLE'} for the "
                           f"Rs. {deposit} refund (limit {limit} hours)."),
            }
    out["decision"] = decision

    # ---- this cooler's own history ----
    hours = [t["hours"] for t in trips if t["hours"] is not None]
    out["history"] = {
        "deliveries": len(trips), "returned": len(hours),
        "averageReturnHours": round(mean(hours), 1) if hours else None,
        "medianReturnHours": round(median(hours), 1) if hours else None,
        "recoveryRatePct": round(len(hours) / len(trips) * 100) if trips else None,
        "returnsWithoutOrder": [
            {"id": r.get("id"), "status": r.get("status"), "refundAmount": r.get("refundAmount"),
             "when": show_time(parse_time(r.get("completedAt") or r["requestDate"]))}
            for r in loose_returns],
    }
    return out


def print_fleet(r):
    if not r["found"]:
        print(f"\nNo cooler found for QR code '{r['qr']}'. Please scan again.\n")
        return
    d, h = r["decision"], r["history"]
    labels = {"ELIGIBLE": f"ELIGIBLE - refund Rs. {r['depositAmount']}",
              "NOT_ELIGIBLE": "NOT ELIGIBLE", "WAIT": "WAIT - cooler not returned yet",
              "NOT_DELIVERED_YET": "NOT APPLICABLE - order not delivered yet",
              "NO_ORDER": "NOT APPLICABLE - cooler not used yet"}
    print("\n" + "=" * 64)
    print(f"  COOLER {r['coolerId']}  ({r['coolerStatus']})")
    print("=" * 64)
    print(f"REFUND DECISION:  {labels[d['status']]}")
    print(f"Why: {d['reason']}")
    if d.get("refundRecorded"):
        print(f"Note: {d['refundRecorded']}")
    if "thisDelivery" in r:
        t = r["thisDelivery"]
        print("\nTHIS DELIVERY")
        print(f"  Order:       {t['orderId']}")
        print(f"  Delivered:   {t['deliveredAt']}")
        print(f"  Returned:    {t['returnedAt'] or 'Not yet'}")
    word = "delivery" if h["deliveries"] == 1 else "deliveries"
    print(f"\nTHIS COOLER'S HISTORY ({h['deliveries']} {word} so far)")
    if h["deliveries"] == 0:
        print("  No deliveries recorded yet.")
    else:
        if h["returned"]:
            print(f"  Average return time:  {h['averageReturnHours']} hours")
            print("     (Usually this cooler comes back about this long after delivery.)")
            print(f"  Median return time:   {h['medianReturnHours']} hours")
            print("     (Half of its returns were faster than this, half slower.)")
        else:
            print("  No returns recorded yet, so no average can be shown.")
        print(f"  Recovery rate:        {h['recoveryRatePct']}%")
        print(f"     ({h['returned']} of {h['deliveries']} deliveries of this cooler have come back.)")
        if h["deliveries"] < 3:
            print("  Note: only a few deliveries so far, so treat these numbers as rough.")
    for x in h["returnsWithoutOrder"]:
        print(f"  Return {x['id']} ({x['status']}, Rs. {x['refundAmount']}, {x['when']}) "
              f"has no matching delivery order.")
    print("=" * 64 + "\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Cooler fleet details for a scanned QR code")
    ap.add_argument("qr", nargs="?", help="QR code text. Leave out to type codes one by one.")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--data", help="path to data.json")
    a = ap.parse_args()
    data = load_data(a.data)
    if a.qr:
        res = get_fleet_details(a.qr, data)
        if a.json:
            print(json.dumps(res, indent=2))
        else:
            print_fleet(res)
    else:
        print("Type or scan a cooler QR code (example: GOMEAT-BOX-BLR-417).")
        print("Press Enter on an empty line to stop.")
        while True:
            code = input("\nQR code: ")
            if not code.strip():
                break
            print_fleet(get_fleet_details(code, data))