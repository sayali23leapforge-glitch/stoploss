import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getAliceBlueSession } from "@/lib/store";
import { placeAliceBlueOrder, type PlaceOrderParams } from "@/lib/aliceblue-client";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const session = getAliceBlueSession(userId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated. Please login with Alice Blue first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      symbol,
      token,
      exchange,
      qty,
      triggerPrice,
      productCode,
      transactionType,
      orderTag,
    } = body;

    if (!symbol || !token || !exchange || !qty || !triggerPrice || !productCode || !transactionType) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, token, exchange, qty, triggerPrice, productCode, transactionType" },
        { status: 400 }
      );
    }
    const orderParams: PlaceOrderParams = {
      complexty: "regular",
      discqty: "0",
      exch: exchange,
      pCode: productCode,
      prctyp: "SL-M",
      price: "0",
      qty: qty.toString(),
      ret: "DAY",
      symbol_id: token,
      trading_symbol: symbol,
      transtype: transactionType,
      trigPrice: triggerPrice.toString(),
      orderTag: orderTag || "stoploss-ema",
    };

    const orderResponse = await placeAliceBlueOrder(session, orderParams);
    
    if (orderResponse.stat !== "Ok") {
      return NextResponse.json(
        { error: orderResponse.emsg || "Order placement failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "ok",
      orderId: orderResponse.NOrdNo,
      message: "Stop-loss order placed successfully",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

