import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { saveAliceBlueSettings, getAliceBlueSettings } from "@/lib/store";
import type { AliceBlueSettings } from "@/lib/brokers/types";

export async function GET() {
  try {
    const userId = await requireUserId();
    const settings = getAliceBlueSettings(userId);

    if (!settings) {
      return NextResponse.json(
        { error: "No settings found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: settings.userId,
      hasApiKey: !!settings.apiKey,
      hasApiSecret: !!settings.apiSecret,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    
    const { userId: abUserId, apiKey, apiSecret } = body;

    if (!abUserId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing required fields: userId, apiKey, apiSecret" },
        { status: 400 }
      );
    }

    const settings: AliceBlueSettings = {
      userId: abUserId,
      apiKey,
      apiSecret,
    };

    saveAliceBlueSettings(userId, settings);

    return NextResponse.json({
      status: "ok",
      message: "Alice Blue settings saved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
