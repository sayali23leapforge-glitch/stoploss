export function calculateEMA(prices: number[], period: number) {
  if (prices.length === 0) return 0;
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i += 1) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }
  return Number(ema.toFixed(2));
}

export function suggestStopLoss(
  prices: number[],
  period: number,
  bufferPct = 0.6
) {
  const ema = calculateEMA(prices, period);
  const buffer = ema * (bufferPct / 100);
  return Number((ema - buffer).toFixed(2));
}

export const EMA_PERIODS = [9, 10, 20];
