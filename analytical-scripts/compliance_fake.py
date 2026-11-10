import json
from datetime import datetime

LOW, HIGH = 0, 4                  # the cooler must stay between these temperatures (°C)
SENSOR_MIN, SENSOR_MAX = -30, 60  # readings outside this are broken-sensor values, ignored

orders = json.load(open("data/orders.json"))


def fmt_date(s):
    return datetime.fromisoformat(s).strftime("%d %b %Y, %I:%M %p")


def fmt_clock(s):
    return datetime.fromisoformat(s).strftime("%I:%M %p")


def check(qr):
    cooler_id = qr.strip().upper().replace("SAGAR-", "")
    mine = [o for o in orders if o["coolerId"] == cooler_id]
    if not mine:
        print(f"\nNo deliveries found for QR code '{qr}'. Please scan again.\n")
        return

    order = max(mine, key=lambda o: datetime.fromisoformat(o["deliveredAt"]))

    all_logs = order["temperatureLogs"]
    readings = [(r["recordedAt"], r["temp"]) for r in all_logs
                if r["temp"] is not None and SENSOR_MIN <= r["temp"] <= SENSOR_MAX]
    ignored = len(all_logs) - len(readings)

    print()
    print("=" * 62)
    print(f"  COOLER {cooler_id} - TEMPERATURE CHECK")
    print("=" * 62)
    print(f"Order: {order['orderId']}     Delivered: {fmt_date(order['deliveredAt'])}")

    # ---- 1. what temperature is required ----
    print("\nREQUIRED TEMPERATURE")
    print(f"  The cooler must stay between {LOW}°C and {HIGH}°C for the whole delivery.")

    if not readings:
        print("\nNo valid temperature readings were recorded for this delivery.")
        print("=" * 62)
        return

    # ---- 2. what temperature it actually stayed at ----
    print("\nTEMPERATURE DURING DELIVERY")
    print("  Time         Temp      Status")
    for t, temp in readings:
        if temp < LOW:
            status = "TOO LOW"
        elif temp > HIGH:
            status = "TOO HIGH"
        else:
            status = "OK"
        print(f"  {fmt_clock(t):<12} {temp:>5.1f}°C   {status}")

    temps = [temp for _, temp in readings]
    print(f"\n  Lowest: {min(temps):.1f}°C   Highest: {max(temps):.1f}°C   "
          f"Average: {sum(temps) / len(temps):.1f}°C")
    note = f"{len(readings)} readings used"
    if ignored:
        note += f", {ignored} ignored (sensor gave no value or an impossible value)"
    print(f"  ({note})")

    # ---- 3. the verdict ----
    below = [(t, x) for t, x in readings if x < LOW]
    above = [(t, x) for t, x in readings if x > HIGH]

    print()
    if not below and not above:
        print("RESULT: CORRECT")
        print(f"  Reason: all {len(readings)} readings stayed between {LOW}°C and {HIGH}°C.")
    else:
        if below and above:
            title = "DEFECTIVE - WENT BOTH BELOW AND ABOVE THE TEMPERATURE"
        elif below:
            title = "DEFECTIVE - STAYED BELOW THE TEMPERATURE"
        else:
            title = "DEFECTIVE - STAYED ABOVE THE TEMPERATURE"
        print(f"RESULT: {title}")
        if below:
            low_t, low_v = min(below, key=lambda p: p[1])
            print(f"  Reason: {len(below)} of {len(readings)} readings were below {LOW}°C. "
                  f"The lowest was {low_v:.1f}°C at {fmt_clock(low_t)}.")
        if above:
            high_t, high_v = max(above, key=lambda p: p[1])
            print(f"  Reason: {len(above)} of {len(readings)} readings were above {HIGH}°C. "
                  f"The highest was {high_v:.1f}°C at {fmt_clock(high_t)}. "
                  f"It first went above {HIGH}°C at {fmt_clock(above[0][0])}.")
    print("=" * 62)
    print()


print("Type or scan a cooler QR code (example: SAGAR-BOX-BLR-912).")
print("Press Enter on an empty line to stop.")
while True:
    code = input("\nQR code: ")
    if not code.strip():
        break
    check(code)