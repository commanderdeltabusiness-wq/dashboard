# Bot Integration Guide

This file contains everything you need to connect your 3 bots to the dashboard.
Keep it private — it contains your API keys.

---

## Your Bot API Keys

| Bot       | ID | API Key                                      |
|-----------|----|----------------------------------------------|
| Sentinel  | 1  | `bk_81a947667d4b4759be37e0dd5f517a41`        |
| Herald    | 2  | `bk_fe5724e52c1b46e5831aaa294be293a5`        |
| Archivist | 3  | `bk_8ef8e332fbfa4946867a87df92b5da48`        |

> You can also view and copy each key from the bot's detail page in the dashboard.

---

## How to Send a Ping

Your bot must call this endpoint regularly (e.g. every 60 seconds) to keep its
status and metrics up to date on the dashboard.

```
POST https://<your-domain>/api/bots/<BOT_ID>/ping
X-API-Key: <YOUR_API_KEY>
Content-Type: application/json
```

### Payload

```json
{
  "status": "online",
  "messagesProcessed": 142857,
  "commandsHandled": 8341,
  "errorsToday": 2
}
```

| Field               | Type    | Required | Description                              |
|---------------------|---------|----------|------------------------------------------|
| `status`            | string  | Yes      | `online`, `offline`, `error`, `starting` |
| `messagesProcessed` | integer | No       | Total messages processed (all time)      |
| `commandsHandled`   | integer | No       | Total commands handled (all time)        |
| `errorsToday`       | integer | No       | Error count for today                    |

---

## Code Examples

### Python

```python
import requests
import time

BOT_ID = 1  # Change per bot
API_KEY = "bk_81a947667d4b4759be37e0dd5f517a41"  # Change per bot
BASE_URL = "https://<your-domain>/api"

def ping_dashboard(status="online", messages=0, commands=0, errors=0):
    resp = requests.post(
        f"{BASE_URL}/bots/{BOT_ID}/ping",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json={
            "status": status,
            "messagesProcessed": messages,
            "commandsHandled": commands,
            "errorsToday": errors,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()

# Call this in your bot's main loop
while True:
    try:
        ping_dashboard(status="online", messages=1000, commands=50, errors=0)
    except Exception as e:
        print(f"Dashboard ping failed: {e}")
    time.sleep(60)
```

---

### Node.js / TypeScript

```typescript
const BOT_ID = 1; // Change per bot
const API_KEY = "bk_81a947667d4b4759be37e0dd5f517a41"; // Change per bot
const BASE_URL = "https://<your-domain>/api";

async function pingDashboard(opts: {
  status: "online" | "offline" | "error" | "starting";
  messagesProcessed?: number;
  commandsHandled?: number;
  errorsToday?: number;
}) {
  const res = await fetch(`${BASE_URL}/bots/${BOT_ID}/ping`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`Ping failed: ${res.status}`);
  return res.json();
}

// Call this in your bot's main loop
setInterval(async () => {
  try {
    await pingDashboard({ status: "online", messagesProcessed: 1000 });
  } catch (err) {
    console.error("Dashboard ping failed:", err);
  }
}, 60_000);
```

---

### Shell / curl

```bash
# Sentinel
curl -X POST https://<your-domain>/api/bots/1/ping \
  -H "X-API-Key: bk_81a947667d4b4759be37e0dd5f517a41" \
  -H "Content-Type: application/json" \
  -d '{"status":"online","messagesProcessed":142857,"commandsHandled":8341,"errorsToday":2}'

# Herald
curl -X POST https://<your-domain>/api/bots/2/ping \
  -H "X-API-Key: bk_fe5724e52c1b46e5831aaa294be293a5" \
  -H "Content-Type: application/json" \
  -d '{"status":"online","messagesProcessed":58293,"commandsHandled":3102,"errorsToday":0}'

# Archivist
curl -X POST https://<your-domain>/api/bots/3/ping \
  -H "X-API-Key: bk_8ef8e332fbfa4946867a87df92b5da48" \
  -H "Content-Type: application/json" \
  -d '{"status":"online","messagesProcessed":201934,"commandsHandled":0,"errorsToday":0}'
```

---

## Status Values

| Value      | Dashboard shows       | Use when                             |
|------------|-----------------------|--------------------------------------|
| `online`   | Green — ONLINE        | Bot is running normally              |
| `offline`  | Gray — OFFLINE        | Bot is shut down cleanly             |
| `error`    | Red — ERROR           | Bot hit an unrecoverable error       |
| `starting` | Yellow — STARTING     | Bot is initializing / warming up     |

## Error Responses

| Code | Meaning                                      |
|------|----------------------------------------------|
| 401  | Missing or wrong `X-API-Key` header          |
| 404  | Bot ID does not exist                        |
| 400  | Malformed JSON or invalid `status` value     |

---

## Tips

- Replace `<your-domain>` with your Replit app domain once deployed.
- Ping every **30–60 seconds** for live status. Longer intervals mean stale "Last Seen" times.
- Always send `errorsToday` so the dashboard error count stays accurate.
- If your bot crashes, send `status: "error"` in a try/finally or process exit hook.
