import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSession } from "@/lib/store";

export async function GET() {
  try {
    const userId = await requireUserId();
    const session = getAliceBlueSession(userId);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const API_BASE = "https://ant.aliceblueonline.com/open-api/od/";
    const token = session.accessToken;

    // Try different possible endpoint paths
    const endpoints = [
      { path: "positionAndHoldings/holdings", method: "GET" },
      { path: "portfolio/holdings", method: "GET" },
      { path: "holdings", method: "GET" },
      { path: "v2/portfolio/holdings", method: "GET" },
      { path: "positionAndHoldings/holdings/", method: "GET" },
      { path: "portfolio/v1/holdings", method: "GET" },
    ];

    const results = {} as Record<string, any>;

    for (const endpoint of endpoints) {
      try {
        const url = `${API_BASE}${endpoint.path}`;
        console.log(`[AliceBlue Debug] Testing endpoint: ${url}`);

        const response = await fetch(url, {
          method: endpoint.method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        let data: any;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        results[endpoint.path] = {
          status: response.status,
          contentType,
          data: typeof data === "string" ? data.substring(0, 100) : data,
          success: response.status === 200,
        };

        console.log(`[AliceBlue Debug] ${endpoint.path}: ${response.status}`, data);
      } catch (error) {
        results[endpoint.path] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return NextResponse.json({
      message: "Endpoint test results - check which one has status 200",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
