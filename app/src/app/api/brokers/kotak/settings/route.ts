import { NextResponse } from "next/server";
import { saveKotakSettings } from "@/lib/store";
import { requireUserId } from "@/lib/request-auth";

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { accessToken, mobileNumber, ucc, mpin, totp } = body ?? {};

  if (!accessToken || !mobileNumber || !ucc || !mpin || !totp) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    const userId = await requireUserId();
    saveKotakSettings(userId, { accessToken, mobileNumber, ucc, mpin, totp });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
