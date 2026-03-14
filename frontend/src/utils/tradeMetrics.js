const formatDayKey = (dateValue) => {
  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().slice(0, 10);
};

const getTradeDate = (trade) => trade.closedAt || trade.date || trade.createdAt;
const getTradePnl = (trade) => Number(trade.pnl ?? trade.netPnl ?? 0);

const average = (numbers) => {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
};

const calculateCurrentStreak = (trades) => {
  if (!trades.length) return { type: 'none', count: 0 };

  const sortedTrades = [...trades].sort((a, b) => new Date(getTradeDate(a)) - new Date(getTradeDate(b)));

  let type = null;
  let count = 0;

  for (let i = sortedTrades.length - 1; i >= 0; i -= 1) {
    const pnl = getTradePnl(sortedTrades[i]);
    const currentType = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'flat';

    if (!type && currentType !== 'flat') {
      type = currentType;
      count = 1;
      continue;
    }

    if (!type || currentType === 'flat') {
      continue;
    }

    if (currentType === type) {
      count += 1;
    } else {
      break;
    }
  }

  return {
    type: type ?? 'none',
    count,
  };
};

export const calculateTradeMetrics = (trades = []) => {
  const cleanTrades = trades.filter((trade) => trade && getTradeDate(trade));
  const pnlValues = cleanTrades.map((trade) => getTradePnl(trade));
  const winners = pnlValues.filter((pnl) => pnl > 0);
  const losers = pnlValues.filter((pnl) => pnl < 0);

  const grossProfit = winners.reduce((sum, pnl) => sum + pnl, 0);
  const grossLoss = losers.reduce((sum, pnl) => sum + pnl, 0);

  const avgWin = average(winners);
  const avgLoss = average(losers);
  const profitFactor = grossLoss === 0 ? null : grossProfit / Math.abs(grossLoss);
  const averageRR = avgLoss === 0 ? null : avgWin / Math.abs(avgLoss);
  const currentStreak = calculateCurrentStreak(cleanTrades);

  const dayPnL = cleanTrades.reduce((accumulator, trade) => {
    const day = formatDayKey(getTradeDate(trade));
    if (!day) return accumulator;
    accumulator[day] = (accumulator[day] ?? 0) + getTradePnl(trade);
    return accumulator;
  }, {});

  const dayEntries = Object.entries(dayPnL);
  const bestDay = dayEntries.length
    ? dayEntries.reduce((best, current) => (current[1] > best[1] ? current : best))
    : null;
  const worstDay = dayEntries.length
    ? dayEntries.reduce((worst, current) => (current[1] < worst[1] ? current : worst))
    : null;

  return {
    totalTrades: cleanTrades.length,
    winRate: cleanTrades.length ? (winners.length / cleanTrades.length) * 100 : 0,
    netPnl: pnlValues.reduce((sum, pnl) => sum + pnl, 0),
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor,
    averageRR,
    currentStreak,
    bestDay,
    worstDay,
  };
};

export const getRecentTrades = (trades = [], limit = 5) => {
  return [...trades]
    .sort((a, b) => new Date(getTradeDate(b)) - new Date(getTradeDate(a)))
    .slice(0, limit);
};

export const getMistakeFrequency = (trades = [], limit = 3) => {
  const frequencyMap = trades.reduce((accumulator, trade) => {
    const tags = Array.isArray(trade.tags) ? trade.tags : [];
    tags.forEach((tag) => {
      accumulator[tag] = (accumulator[tag] ?? 0) + 1;
    });
    return accumulator;
  }, {});

  return Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
};
