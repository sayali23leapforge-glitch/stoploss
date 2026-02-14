import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSession } from "@/lib/store";

export async function GET() {
  try {
    const userId = await requireUserId();
    const session = getAliceBlueSession(userId);

    if (session && session.accessToken) {
      console.log('[AliceBlue Check Session] Session found for userId:', userId);
      return NextResponse.json({ hasSession: true });
    }

    console.log('[AliceBlue Check Session] No session found for userId:', userId);
    return NextResponse.json({ hasSession: false });
  } catch (error) {
    console.error('[AliceBlue Check Session] Error:', error);
    return NextResponse.json({ hasSession: false });
  }
}
