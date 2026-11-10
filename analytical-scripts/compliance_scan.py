import argparse
import json

from scan_common import find_cooler, load_data, parse_time, show_time

LOW, HIGH = 0, 4                  # required range in °C
SENSOR_MIN, SENSOR_MAX = -30, 60  # outside this = broken sensor, ignored


def get_temperature_check(qr, data=None):
    """Required range, the readings of the cooler's latest order, and a CORRECT/DEFECTIVE verdict."""
    data = data or load_data()
    cooler = find_cooler(data, qr)
    if cooler is None:
        return {"found": False, "qr": qr}

    cid = cooler["id"]
    orders = sorted((o for o in data.get("orders", []) if o.get("coolerId") == cid),
                    key=lambda o: parse_time(o["createdAt"]))
    out = {"found": True, "coolerId": cid, "requiredMin": LOW, "requiredMax": HIGH}
    if not orders:
        out["verdict"] = {"status": "NO_ORDER", "reason": "No order has used this cooler yet."}
        return out

    order = orders[-1]
    out["order"] = {"orderId": order["id"], "orderStatus": order.get("status"),
                    "delivered": str(order.get("orderStatus", "")).upper() == "DELIVERED",
                    "orderedAt": show_time(parse_time(order["createdAt"]))}

    logs = order.get("tempLog") or order.get("temperatureLog") or []
    readings, ignored = [], 0
    for r in logs:
        t = r.get("temp")
        if isinstance(t, (int, float)) and SENSOR_MIN <= t <= SENSOR_MAX:
            readings.append({"time": r.get("time"), "temp": t, "event": r.get("event", "")})
        else:
            ignored += 1
    if not readings:
        out["verdict"] = {"status": "NO_READINGS",
                          "reason": "No valid temperature readings were recorded for this delivery."}
        return out

    for r in readings:
        r["status"] = "TOO LOW" if r["temp"] < LOW else "TOO HIGH" if r["temp"] > HIGH else "OK"
    temps = [r["temp"] for r in readings]
    out["readings"] = readings
    out["ignoredReadings"] = ignored
    out["summary"] = {"lowest": min(temps), "highest": max(temps),
                      "average": round(sum(temps) / len(temps), 1)}

    below = [r for r in readings if r["status"] == "TOO LOW"]
    above = [r for r in readings if r["status"] == "TOO HIGH"]
    n = len(readings)
    if not below and not above:
        every = "The only reading" if n == 1 else f"All {n} readings"
        out["verdict"] = {"status": "CORRECT",
                          "reason": f"{every} stayed between {LOW}°C and {HIGH}°C."}
    else:
        reasons = []
        if below:
            low = min(below, key=lambda r: r["temp"])
            reasons.append(f"{len(below)} of {n} readings were below {LOW}°C. "
                           f"The lowest was {low['temp']}°C at {low['time']}.")
        if above:
            hi = max(above, key=lambda r: r["temp"])
            reasons.append(f"{len(above)} of {n} readings were above {HIGH}°C. "
                           f"The highest was {hi['temp']}°C at {hi['time']}. "
                           f"It first went above {HIGH}°C at {above[0]['time']}.")
        kind = ("DEFECTIVE - WENT BOTH BELOW AND ABOVE THE TEMPERATURE" if below and above else
                "DEFECTIVE - STAYED BELOW THE TEMPERATURE" if below else
                "DEFECTIVE - STAYED ABOVE THE TEMPERATURE")
        out["verdict"] = {"status": "DEFECTIVE", "title": kind, "reasons": reasons}
    return out


def print_check(r):
    if not r["found"]:
        print(f"\nNo cooler found for QR code '{r['qr']}'. Please scan again.\n")
        return
    print("\n" + "=" * 70)
    print(f"  COOLER {r['coolerId']} - TEMPERATURE CHECK")
    print("=" * 70)
    v = r["verdict"]
    if "order" not in r:
        print(v["reason"] + "\n" + "=" * 70 + "\n")
        return
    o = r["order"]
    print(f"Order: {o['orderId']}   Status: {o['orderStatus']}   Ordered: {o['orderedAt']}")
    if not o["delivered"]:
        print("Note: this order has not been delivered yet, so these are the readings so far.")
    print("\nREQUIRED TEMPERATURE")
    print(f"  The cooler must stay between {LOW}°C and {HIGH}°C for the whole delivery.")
    if "readings" not in r:
        print("\n" + v["reason"] + "\n" + "=" * 70 + "\n")
        return
    print("\nTEMPERATURE DURING DELIVERY")
    print("  Time    Temp      Status     What happened")
    for x in r["readings"]:
        ev = x["event"] if len(x["event"]) <= 40 else x["event"][:37] + "..."
        print(f"  {x['time']:<7} {x['temp']:>5.1f}°C   {x['status']:<9}  {ev}")
    s = r["summary"]
    print(f"\n  Lowest: {s['lowest']}°C   Highest: {s['highest']}°C   Average: {s['average']}°C")
    note = f"{len(r['readings'])} readings used"
    if r["ignoredReadings"]:
        note += f", {r['ignoredReadings']} ignored (no value or impossible value)"
    print(f"  ({note})\n")
    if v["status"] == "CORRECT":
        print("RESULT: CORRECT")
        print(f"  Reason: {v['reason']}")
    else:
        print(f"RESULT: {v['title']}")
        for line in v["reasons"]:
            print(f"  Reason: {line}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Temperature check for a scanned cooler QR code")
    ap.add_argument("qr", nargs="?", help="QR code text. Leave out to type codes one by one.")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--data", help="path to data.json")
    a = ap.parse_args()
    data = load_data(a.data)
    if a.qr:
        res = get_temperature_check(a.qr, data)
        if a.json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print_check(res)
    else:
        print("Type or scan a cooler QR code (example: GOMEAT-BOX-BLR-417).")
        print("Press Enter on an empty line to stop.")
        while True:
            code = input("\nQR code: ")
            if not code.strip():
                break
            print_check(get_temperature_check(code, data))