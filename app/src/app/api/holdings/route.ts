import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/request-auth";
import { getKotakSession, getKotakSettings } from "@/lib/store";
import { fetchHoldings } from "@/lib/kotak-client";
import { calculateEMA, suggestStopLoss, EMA_PERIODS } from "@/lib/stoploss";
import { recordPrice, getPriceHistory } from "@/lib/price-history";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodParam = Number(searchParams.get("period") ?? 10);
  const period = EMA_PERIODS.includes(periodParam) ? periodParam : 10;

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

    const response = await fetchHoldings(session.baseUrl, session);
    const holdings = (response.data ?? []).map((holding: any) => {
      const price = Number(holding.closingPrice ?? 0);
      const symbol = String(holding.displaySymbol ?? holding.symbol ?? "");
      if (symbol) {
        recordPrice(symbol, price);
      }

      const history = getPriceHistory(symbol, period);
      const hasHistory = history.length >= period;
      const ema = hasHistory ? calculateEMA(history, period) : null;
      const suggestedStopLoss = hasHistory ? suggestStopLoss(history, period) : null;

      return {
        symbol,
        exchange: holding.exchangeSegment ?? "--",
        quantity: holding.quantity ?? 0,
        avgPrice: Number(holding.averagePrice ?? 0),
        lastTradedPrice: price,
        dayChangePct: holding.per_change ?? 0,
        ema,
        suggestedStopLoss,
      };
    });

    return NextResponse.json({ period, holdings });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch holdings." },
      { status: 500 }
    );
  }
}
