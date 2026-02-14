import { NextResponse } from "next/server";

// This endpoint is deprecated - use /api/brokers/aliceblue/login with redirect flow
export async function POST() {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Use POST /api/brokers/aliceblue/login instead.",
      redirectRequired: false,
    },
    { status: 400 }
  );
}
