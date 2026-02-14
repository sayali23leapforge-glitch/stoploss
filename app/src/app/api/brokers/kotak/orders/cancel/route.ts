import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSession, getKotakSettings } from "@/lib/store";
import { cancelOrder } from "@/lib/kotak-client";

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { jData, orderType } = body ?? {};

  if (!jData) {
    return NextResponse.json(
      { error: "Missing jData payload." },
      { status: 400 }
    );
  }

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

    const endpoint =
      orderType === "bo"
        ? "/quick/order/bo/exit"
        : orderType === "co"
          ? "/quick/order/co/exit"
          : "/quick/order/cancel";

    const response = await cancelOrder(session.baseUrl, session, endpoint, jData);
    return NextResponse.json({ status: "ok", response });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel order." },
      { status: 500 }
    );
  }
}
