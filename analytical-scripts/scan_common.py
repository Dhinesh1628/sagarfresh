import json
import os
from datetime import datetime, timedelta, timezone

IST = timezone(timedelta(hours=5, minutes=30))

# Where to look for data.json if --data is not given
_HERE = os.path.dirname(os.path.abspath(__file__))
_NAMES = ["data.json", "../data.json", "backend/data.json", "../backend/data.json",
          "server/data.json", "../server/data.json"]


def load_data(path=None):
    if path:
        candidates = [path]
    else:
        candidates = [os.path.join(base, n) for base in (os.getcwd(), _HERE) for n in _NAMES]
    for p in candidates:
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                return json.load(f)
    raise SystemExit("Could not find data.json. Run again with:  --data PATH\\TO\\data.json")


def parse_time(s):
    dt = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def show_time(dt):
    return dt.astimezone(IST).strftime("%d %b %Y, %I:%M %p IST")


def find_cooler(data, qr):
    """Match the scanned text against qrCode, coolerCode or id. Any prefix works."""
    q = qr.strip().upper()
    for c in data.get("coolers", []):
        keys = {str(c.get(k, "")).upper() for k in ("qrCode", "coolerCode", "id")}
        if q in keys:
            return c
    if "BOX-" in q:
        tail = q[q.index("BOX-"):]
        for c in data.get("coolers", []):
            if str(c.get("id", "")).upper() == tail:
                return c
    return None