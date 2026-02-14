# Alice Blue Integration Troubleshooting

## Common Issues

### Login Fails / No Session ID

- Verify **User ID** is your Alice Blue Client ID (not email or phone).
- Verify **App Code (API Key)** and **App Secret** from Alice Blue portal.
- Ensure API access is enabled in your Alice Blue account settings.

### Holdings or Positions Empty

- Ensure you are logged in successfully.
- Confirm you actually have holdings/positions in the account.
- Retry after a fresh login (sessions can expire).

### API Errors or HTML Responses

- Alice Blue endpoints may have changed.
- Confirm the API base URL in `app/src/lib/aliceblue-client.ts`.
- If needed, override with `ALICEBLUE_API_BASE` or `ALICEBLUE_AUTH_BASE`.

## Useful Checks

- Check the browser console and server logs for detailed error messages.
- Confirm API access is enabled and subscription is active.
- Verify you have whitelisted IP if your account requires it.

## Notes

The app uses the auth-code + checksum flow:
- Redirect to Alice Blue with `appcode`
- Receive `authCode` and `userId`
- Compute checksum = `SHA256(userId + authCode + apiSecret)`
- Call `POST /open-api/od/v1/vendor/getUserDetails`

If Alice Blue changes their endpoints, update the auth endpoints and payload fields in `app/src/lib/aliceblue-client.ts`
or override with:
- `ALICEBLUE_API_BASE`
- `ALICEBLUE_AUTH_BASE`
