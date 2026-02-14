import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSettings, saveKotakSession } from "@/lib/store";
import { tradeApiLogin, tradeApiValidate } from "@/lib/kotak-client";

export async function POST() {
  try {
    const userId = await requireUserId();
    const settings = getKotakSettings(userId);
    if (!settings) {
      return NextResponse.json(
        { error: "Missing Kotak settings." },
        { status: 400 }
      );
    }

    if (!settings.accessToken || !settings.mobileNumber || !settings.ucc || !settings.mpin || !settings.totp) {
      return NextResponse.json(
        { error: "Missing required Kotak fields: accessToken, mobileNumber, ucc, mpin, totp." },
        { status: 400 }
      );
    }

    const login = await tradeApiLogin(settings);
    if (!login.data?.token || !login.data.sid) {
      return NextResponse.json(
        { error: "Kotak login failed", details: login },
        { status: 401 }
      );
    }

    const validate = await tradeApiValidate(
      settings,
      login.data.token,
      login.data.sid
    );

    if (!validate.data?.token || !validate.data.sid || !validate.data.baseUrl) {
      return NextResponse.json(
        { error: "Kotak validate failed", details: validate },
        { status: 401 }
      );
    }

    saveKotakSession(userId, {
      token: validate.data.token,
      sid: validate.data.sid,
      baseUrl: validate.data.baseUrl,
      kType: validate.data.kType,
    });

    return NextResponse.json({
      status: "ok",
      baseUrl: validate.data.baseUrl,
      kType: validate.data.kType,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
