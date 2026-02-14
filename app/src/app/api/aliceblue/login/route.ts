import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Use the Alice Blue redirect login flow.",
    },
    { status: 410 }
  );
}
