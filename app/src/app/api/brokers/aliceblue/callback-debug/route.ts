import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Log ALL query parameters received
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });

  console.log('[Alice Blue Callback Debug] Received parameters from Alice Blue:', {
    fullUrl: request.url,
    allParams,
    timestamp: new Date().toISOString(),
  });

  // Return a simple HTML page showing what was received
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Alice Blue Callback Debug</title>
      <style>
        body { font-family: monospace; margin: 20px; background: #0f172a; color: #fff; }
        h1 { color: #10b981; }
        pre { background: #1e293b; padding: 15px; border-radius: 8px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>✓ Alice Blue Callback Received</h1>
      <p>All parameters sent by Alice Blue:</p>
      <pre>${JSON.stringify(allParams, null, 2)}</pre>
      <p>Full URL:</p>
      <pre>${request.url}</pre>
      <hr />
      <p><strong>Next step:</strong> Check the browser console and server logs to see what parameters Alice Blue sent.</p>
      <p>Use these parameter names in the callback handler.</p>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
