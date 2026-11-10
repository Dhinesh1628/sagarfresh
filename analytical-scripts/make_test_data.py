import json
import os
import random
from datetime import datetime, timedelta

random.seed(42)
os.makedirs("data", exist_ok=True)

ZONES = ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar"]
NUM_COOLERS = 40
NUM_ORDERS = 220
START = datetime(2026, 9, 1, 8, 0)

coolers = []
for i in range(NUM_COOLERS):
    coolers.append({
        "id": f"BOX-BLR-{900 + i}",
        "model": "ThermalVault 18L - Reusable EPP Cold-Gel Box",
        "status": "at_hub",
        "cyclesUsed": 0,
        "depositAmount": 250,
        "maxHoldingHours": 36,
        "assignedHub": "Bengaluru Regional Hub Depot",
    })

orders, returns = [], []
last_trip = {}

for n in range(NUM_ORDERS):
    order_id = f"ORD-{1000 + n}"
    delivered_at = START + timedelta(hours=n * 7 + random.randint(0, 5))
    zone = random.choice(ZONES)
    cooler = random.choice(coolers)

    bad_trip = random.random() < 0.20
    readings = []
    t0 = delivered_at - timedelta(hours=3)
    for k in range(13):
        temp = round(random.uniform(0.5, 3.7), 1)
        if bad_trip and k >= 6:
            temp = round(random.uniform(4.2, 8.5), 1)
        r = random.random()
        if r < 0.01:
            temp = -999
        elif r < 0.02:
            temp = None
        readings.append({
            "temp": temp,
            "recordedAt": (t0 + timedelta(minutes=15 * k)).isoformat(),
        })

    orders.append({
        "orderId": order_id,
        "deliveryZone": zone,
        "coolerId": cooler["id"],
        "status": "delivered",
        "deliveredAt": delivered_at.isoformat(),
        "temperatureLogs": readings,
    })

    cooler["cyclesUsed"] += 1
    if random.random() < 0.78:
        hours_out = max(6, random.gauss(30, 12))
        returned_at = delivered_at + timedelta(hours=hours_out)
        late = hours_out > 36
        status = random.choices(
            ["refunded", "forfeited"], weights=[92, 8] if not late else [60, 40]
        )[0]
        returns.append({
            "orderId": order_id,
            "coolerId": cooler["id"],
            "requestedAt": (returned_at - timedelta(hours=1)).isoformat(),
            "returnedAt": returned_at.isoformat(),
            "refundAmount": 250 if status == "refunded" else 0,
            "refundStatus": status,
        })
        last_trip[cooler["id"]] = "returned"
    elif random.random() < 0.3:
        returns.append({
            "orderId": order_id,
            "coolerId": cooler["id"],
            "requestedAt": (delivered_at + timedelta(hours=20)).isoformat(),
            "returnedAt": None,
            "refundAmount": 0,
            "refundStatus": "pending",
        })
        last_trip[cooler["id"]] = "out"
    else:
        last_trip[cooler["id"]] = "out"

for c in coolers:
    c["status"] = "with_customer" if last_trip.get(c["id"]) == "out" else "at_hub"

for name, docs in [("orders", orders), ("coolers", coolers), ("coolerreturns", returns)]:
    with open(f"data/{name}.json", "w", encoding="utf-8") as f:
        json.dump(docs, f, indent=2)
    print(f"Created data/{name}.json  ({len(docs)} records)")