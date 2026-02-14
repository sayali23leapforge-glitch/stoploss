import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSession, getKotakSettings } from "@/lib/store";
import { fetchQuotes } from "@/lib/kotak-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const filter = searchParams.get("filter") ?? "all";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query string." },
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

    const response = await fetchQuotes(
      session.baseUrl,
      settings.accessToken,
      query,
      filter
    );
    return NextResponse.json({
      status: "ok",
      filter,
      data: response,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotes." },
      { status: 500 }
    );
  }
}
