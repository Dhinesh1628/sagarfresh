import json
import pandas as pd

# ---------- load data ----------
orders = pd.DataFrame(json.load(open("data/orders.json")))
coolers = pd.DataFrame(json.load(open("data/coolers.json")))
returns = pd.DataFrame(json.load(open("data/coolerreturns.json")))

trips = orders[["orderId", "coolerId", "deliveredAt"]].merge(
    returns[["orderId", "returnedAt"]], on="orderId", how="left")
trips["deliveredAt"] = pd.to_datetime(trips["deliveredAt"], format="ISO8601")
trips["returnedAt"] = pd.to_datetime(trips["returnedAt"], format="ISO8601")
trips["hours_out"] = (trips["returnedAt"] - trips["deliveredAt"]).dt.total_seconds() / 3600


def fmt_time(t):
    return t.strftime("%d %b %Y, %I:%M %p")


def scan(qr):
    cooler_id = qr.strip().upper().replace("SAGAR-", "")
    match = coolers[coolers["id"] == cooler_id]
    if match.empty:
        print(f"\nNo cooler found for QR code '{qr}'. Please scan again.\n")
        return
    cooler = match.iloc[0]
    limit = cooler["maxHoldingHours"]
    deposit = cooler["depositAmount"]

    history = trips[trips["coolerId"] == cooler_id].sort_values("deliveredAt")
    print()
    print("=" * 60)
    print(f"  COOLER {cooler_id}")
    print("=" * 60)

    if history.empty:
        print("This cooler has not been sent out on any order yet.")
        print("=" * 60)
        return

    trip = history.iloc[-1]

    # ---- 1. the decision first ----
    if pd.isna(trip["returnedAt"]):
        print("REFUND DECISION:  WAIT - cooler not returned yet")
        print(f"Why: The Rs. {deposit} deposit is refunded only after the cooler is")
        print(f"     returned within {limit} hours of delivery.")
    elif trip["hours_out"] <= limit:
        print(f"REFUND DECISION:  ELIGIBLE - refund Rs. {deposit}")
        print(f"Why: Returned in {trip['hours_out']:.1f} hours. The limit is {limit} hours.")
    else:
        print("REFUND DECISION:  NOT ELIGIBLE")
        print(f"Why: Returned in {trip['hours_out']:.1f} hours, which is "
              f"{trip['hours_out'] - limit:.1f} hours past the {limit}-hour limit.")

    # ---- 2. this trip ----
    print("\nTHIS DELIVERY")
    print(f"  Order:       {trip['orderId']}")
    print(f"  Delivered:   {fmt_time(trip['deliveredAt'])}")
    if pd.isna(trip["returnedAt"]):
        print("  Returned:    Not yet")
    else:
        print(f"  Returned:    {fmt_time(trip['returnedAt'])}")

    # ---- 3. this cooler's own history ----
    total = len(history)
    back = int(history["returnedAt"].notna().sum())
    print(f"\nTHIS COOLER'S HISTORY ({total} deliveries so far)")
    if back == 0:
        print("  No returns recorded yet, so no average can be shown.")
    else:
        avg = history["hours_out"].mean()
        med = history["hours_out"].median()
        print(f"  Average return time:  {avg:.1f} hours")
        print("     (Usually this cooler comes back about this long after delivery.)")
        print(f"  Median return time:   {med:.1f} hours")
        print("     (Half of its returns were faster than this, half slower.)")
    print(f"  Recovery rate:        {back / total * 100:.0f}%")
    print(f"     ({back} of {total} deliveries of this cooler have come back.)")
    if total < 3:
        print("  Note: only a few deliveries so far, so treat these numbers as rough.")
    print("=" * 60)
    print()


print("Type or scan a cooler QR code (example: SAGAR-BOX-BLR-912).")
print("Press Enter on an empty line to stop.")
while True:
    code = input("\nQR code: ")
    if not code.strip():
        break
    scan(code)