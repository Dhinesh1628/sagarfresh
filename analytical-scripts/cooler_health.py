import argparse
import json

from compliance_scan import HIGH, LOW, SENSOR_MAX, SENSOR_MIN   # same 0-4°C rule as the compliance script
from scan_common import IST, load_data, parse_time

# ---- Stage rules (change these numbers if the rule changes) ----
# A cooler's "failed deliveries" = deliveries where any reading went below 0°C or above 4°C.
DISCARD_AT = 4    # 4 or more failed deliveries  -> DISCARD
CRITICAL_AT = 3   # 3 failed deliveries          -> CRITICAL (one more and it must be discarded)
NORMAL_AT = 1     # 1-2 failed deliveries        -> NORMAL (keep using, but watch)
                  # 0 failed deliveries          -> GOOD


def stage_for(failed):
    if failed >= DISCARD_AT:
        return "DISCARD"
    if failed >= CRITICAL_AT:
        return "CRITICAL"
    if failed >= NORMAL_AT:
        return "NORMAL"
    return "GOOD"


def out_of_range_readings(order):
    """Readings of this delivery that went below LOW or above HIGH (broken-sensor values ignored)."""
    logs = order.get("tempLog") or order.get("temperatureLog") or []
    bad = []
    for r in logs:
        t = r.get("temp")
        if isinstance(t, (int, float)) and SENSOR_MIN <= t <= SENSOR_MAX and (t < LOW or t > HIGH):
            bad.append({"time": r.get("time"), "temp": t,
                        "direction": "BELOW" if t < LOW else "ABOVE"})
    return bad


def get_cooler_health(data=None):
    data = data or load_data()
    coolers = {c["id"]: {"coolerId": c["id"], "qrCode": c.get("qrCode"),
                         "deliveries": 0, "failed": []}
               for c in data.get("coolers", [])}

    orders = sorted(data.get("orders", []), key=lambda o: parse_time(o["createdAt"]))
    for o in orders:
        cid = o.get("coolerId")
        if not cid or str(o.get("orderStatus", "")).upper() != "DELIVERED":
            continue          # only completed deliveries are counted
        entry = coolers.setdefault(cid, {"coolerId": cid, "qrCode": None,
                                         "deliveries": 0, "failed": []})
        entry["deliveries"] += 1
        bad = out_of_range_readings(o)
        if bad:
            when = parse_time(o.get("deliveredAt") or o["createdAt"]).astimezone(IST)
            entry["failed"].append({"orderId": o["id"],
                                    "deliveryDate": when.strftime("%d %b %Y"),
                                    "outOfRange": bad})

    result = []
    for e in coolers.values():
        n = len(e["failed"])
        e["failedDeliveries"] = n
        e["stage"] = stage_for(n)
        e["failedAbove"] = sum(1 for f in e["failed"] if any(x["direction"] == "ABOVE" for x in f["outOfRange"]))
        e["failedBelow"] = sum(1 for f in e["failed"] if any(x["direction"] == "BELOW" for x in f["outOfRange"]))
        result.append(e)
    result.sort(key=lambda e: (-e["failedDeliveries"], e["coolerId"]))

    return {
        "rule": {"requiredMin": LOW, "requiredMax": HIGH, "normalAt": NORMAL_AT,
                 "criticalAt": CRITICAL_AT, "discardAt": DISCARD_AT},
        "summary": {"coolersChecked": len(result),
                    **{s: sum(1 for e in result if e["stage"] == s)
                       for s in ("DISCARD", "CRITICAL", "NORMAL", "GOOD")}},
        "coolers": result,
    }


def _readings_text(items, limit=4):
    parts = [f"{x['time']} ({x['temp']}°C)" for x in items[:limit]]
    if len(items) > limit:
        parts.append(f"+{len(items) - limit} more")
    return ", ".join(parts)


def print_boxes(names, width=72):
    """Print each name inside its own box, several boxes per row."""
    rows, row, used = [], [], 0
    for n in names:
        w = len(n) + 4                       # name + padding + borders
        if row and used + w + 1 > width:
            rows.append(row)
            row, used = [], 0
        row.append(n)
        used += w + 1
    if row:
        rows.append(row)
    for row in rows:
        print(" ".join("┌" + "─" * (len(n) + 2) + "┐" for n in row))
        print(" ".join("│ " + n + " │" for n in row))
        print(" ".join("└" + "─" * (len(n) + 2) + "┘" for n in row))


def print_health(r):
    s = r["summary"]
    print("\n" + "=" * 72)
    print("  COOLER HEALTH REPORT")
    print("=" * 72)
    print(f"Coolers checked: {s['coolersChecked']}   |   DISCARD: {s['DISCARD']}   "
          f"CRITICAL: {s['CRITICAL']}   NORMAL: {s['NORMAL']}   GOOD: {s['GOOD']}")

    advice = {"DISCARD": f"ACTION: Discard this cooler. It failed {DISCARD_AT} or more deliveries.",
              "CRITICAL": "ACTION: One more failed delivery and this cooler must be discarded.",
              "NORMAL": "ACTION: Keep using it, but watch it."}
    bad = [e for e in r["coolers"] if e["stage"] != "GOOD"]
    if not bad:
        print("\nNo cooler has gone out of temperature in any delivery.")
    for e in bad:
        print("\n" + "-" * 72)
        print(f"{e['coolerId']}   STAGE: {e['stage']}")
        print("-" * 72)
        print(f"Why: went out of temperature in {e['failedDeliveries']} of {e['deliveries']} "
              f"deliveries (above {HIGH}°C in {e['failedAbove']}, below {LOW}°C in {e['failedBelow']}).")
        print(advice[e["stage"]])
        print("Failed deliveries:")
        for f in e["failed"]:
            above = [x for x in f["outOfRange"] if x["direction"] == "ABOVE"]
            below = [x for x in f["outOfRange"] if x["direction"] == "BELOW"]
            print(f"  - Order {f['orderId']}, delivered on {f['deliveryDate']}")
            if above:
                print(f"      Went ABOVE {HIGH}°C at: {_readings_text(above)}")
            if below:
                print(f"      Went BELOW {LOW}°C at: {_readings_text(below)}")

    good = [e["coolerId"] for e in r["coolers"] if e["stage"] == "GOOD"]
    if good:
        print("\n" + "-" * 72)
        print(f"GOOD ({len(good)}):")
        print_boxes(good)
    print("=" * 72 + "\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Cooler health report: which coolers keep failing the 0-4°C check")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--data", help="path to data.json")
    a = ap.parse_args()
    report = get_cooler_health(load_data(a.data))
    if a.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print_health(report)
