import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSession, getAliceBlueSettings } from "@/lib/store";

export async function GET() {
  try {
    const userId = await requireUserId();
    const session = getAliceBlueSession(userId);
    const settings = getAliceBlueSettings(userId);

    return NextResponse.json({
      status: "ok",
      authenticated: !!session,
      hasSettings: !!settings,
      session: session ? {
        userId: session.userId,
        hasAccessToken: !!session.accessToken,
      } : null,
      settings: settings ? {
        userId: settings.userId,
        hasApiKey: !!settings.apiKey,
        hasApiSecret: !!settings.apiSecret,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
