# Alice Blue EMA-Based Stop Loss Service

A Next.js application that integrates with Alice Blue to provide EMA-based stop-loss calculations and order placement.

## Features

- Alice Blue authentication and session management
- Holdings and positions fetch
- EMA 10 / EMA 20 calculations
- Suggested stop-loss prices (EMA - 0.6%)
- Stop-loss order placement (SL-M)

## Prerequisites

- Node.js 20+
- Alice Blue trading account
- Alice Blue App Code (API Key) and App Secret

## Install & Run

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:3000`.

## Setup

1. Go to **Integrations**.
2. In **Alice Blue API Settings**, fill:
   - User ID (Client ID)
   - App Code (API Key)
   - App Secret
3. Click **Save Settings**.
4. Click **Login to Alice Blue** to redirect and authenticate.
5. Navigate to **Alice Blue** page and click **Refresh Data**.

## Authentication Flow (Auth Code + Checksum)

The app uses the Alice Blue redirect login flow:
1. Redirect to `https://ant.aliceblueonline.com/?appcode=APP_CODE`
2. Alice Blue redirects back with `authCode` and `userId`
3. App computes checksum = `SHA256(userId + authCode + apiSecret)`
4. App calls `POST https://ant.aliceblueonline.com/open-api/od/v1/vendor/getUserDetails`
5. `userSession` is stored and used for subsequent API calls

Session IDs are stored in memory and used for all subsequent API calls.

If Alice Blue changes base URLs or paths, set:
- `ALICEBLUE_API_BASE`
- `ALICEBLUE_AUTH_BASE`

## API Routes

- `POST /api/brokers/aliceblue/settings` - Save credentials
- `GET /api/brokers/aliceblue/login` - Redirect to Alice Blue login
- `GET /api/brokers/aliceblue/callback` - Handle auth code and create session
- `GET /api/brokers/aliceblue/holdings` - Fetch holdings
- `GET /api/brokers/aliceblue/positions` - Fetch positions
- `POST /api/brokers/aliceblue/orders/place-stoploss` - Place SL-M order

## Security Notes

- Credentials are stored in memory (dev only).
- Do not commit credentials to source control.
- Use HTTPS and secure storage in production.

## Troubleshooting

If login fails:
- Verify User ID, App Code, and App Secret
- Confirm 2FA format required by your account (Year of Birth or TOTP)
- Check API access is enabled in Alice Blue portal

If you need updated endpoints or payloads, consult the v2 Alice Blue API docs or Postman collection.
