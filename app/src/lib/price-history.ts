const globalStore = globalThis as typeof globalThis & {
  __stoploss_prices__?: Record<string, number[]>;
};

if (!globalStore.__stoploss_prices__) {
  globalStore.__stoploss_prices__ = {};
}

export function recordPrice(symbol: string, price: number) {
  if (!Number.isFinite(price)) return;
  const bucket = globalStore.__stoploss_prices__!;
  if (!bucket[symbol]) {
    bucket[symbol] = [];
  }
  bucket[symbol].push(price);
  if (bucket[symbol].length > 200) {
    bucket[symbol].shift();
  }
}

export function getPriceHistory(symbol: string, period: number) {
  const bucket = globalStore.__stoploss_prices__![symbol] ?? [];
  return bucket.slice(-Math.max(period, 1));
}
