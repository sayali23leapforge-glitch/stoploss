import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSession, getKotakSettings } from "@/lib/store";
import { fetchScripPaths } from "@/lib/kotak-client";

export async function GET() {
  try {
    const userId = await requireUserId();
    const settings = getKotakSettings(userId);
    const session = getKotakSession(userId);
    if (!settings || !session) {
      return NextResponse.json(
        { error: "Authenticate with Kotak first." },
        { status: 401 }
      );
    }

    const response = await fetchScripPaths(
      session.baseUrl,
      settings.accessToken
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch scrip master paths." },
      { status: 500 }
    );
  }
}
