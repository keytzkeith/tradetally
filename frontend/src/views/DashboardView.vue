<template>
  <div class="content-wrapper py-8 space-y-8">
    <div>
      <h1 class="heading-page">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Mock-data overview for core trade performance metrics.</p>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        v-for="metric in metricCards"
        :key="metric.label"
        :label="metric.label"
        :value="metric.value"
        :badge-label="metric.badgeLabel"
        :status="metric.status"
      />
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Recent trades (last 5)">
        <ul class="space-y-3">
          <li
            v-for="trade in recentTrades"
            :key="trade.id"
            class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ trade.symbol }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(trade.closedAt) }}</p>
            </div>
            <StatusBadge :label="formatCurrency(trade.pnl)" :status="trade.pnl >= 0 ? 'positive' : 'negative'" />
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Mistake frequency (top 3 tags)">
        <ul class="space-y-3">
          <li
            v-for="entry in mistakeFrequency"
            :key="entry.tag"
            class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
          >
            <p class="text-sm text-gray-800 dark:text-gray-200">{{ entry.tag }}</p>
            <StatusBadge :label="`${entry.count}x`" status="neutral" />
          </li>
        </ul>
      </SectionCard>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StatCard from '@/components/common/StatCard.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { mockTrades } from '@/data/mockTrades';
import { calculateTradeMetrics, getRecentTrades, getMistakeFrequency } from '@/utils/tradeMetrics';

const metrics = computed(() => calculateTradeMetrics(mockTrades));
const recentTrades = computed(() => getRecentTrades(mockTrades, 5));
const mistakeFrequency = computed(() => getMistakeFrequency(mockTrades, 3));

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => `${value.toFixed(1)}%`;
const formatRatio = (value) => (value == null ? '—' : `${value.toFixed(2)}x`);
const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getPnlStatus = (value) => (value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral');

const formatDaySummary = (dayEntry) => {
  if (!dayEntry) return '—';
  const [date, pnl] = dayEntry;
  return `${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${formatCurrency(pnl)})`;
};

const metricCards = computed(() => {
  const current = metrics.value;
  const streakText = current.currentStreak.count
    ? `${current.currentStreak.type === 'win' ? 'W' : 'L'}${current.currentStreak.count}`
    : '—';

  return [
    { label: 'Total trades', value: String(current.totalTrades), badgeLabel: '', status: 'neutral' },
    { label: 'Win rate', value: formatPercent(current.winRate), badgeLabel: current.winRate >= 50 ? 'Solid' : 'Needs work', status: current.winRate >= 50 ? 'positive' : 'negative' },
    { label: 'Net PnL', value: formatCurrency(current.netPnl), badgeLabel: current.netPnl >= 0 ? 'Profit' : 'Drawdown', status: getPnlStatus(current.netPnl) },
    { label: 'Average win', value: formatCurrency(current.averageWin), badgeLabel: '', status: 'neutral' },
    { label: 'Average loss', value: formatCurrency(current.averageLoss), badgeLabel: '', status: 'neutral' },
    { label: 'Profit factor', value: formatRatio(current.profitFactor), badgeLabel: '', status: current.profitFactor >= 1 ? 'positive' : 'negative' },
    { label: 'Average RR', value: formatRatio(current.averageRR), badgeLabel: '', status: current.averageRR >= 1 ? 'positive' : 'negative' },
    { label: 'Current streak', value: streakText, badgeLabel: '', status: current.currentStreak.type === 'win' ? 'positive' : current.currentStreak.type === 'loss' ? 'negative' : 'neutral' },
    { label: 'Best day', value: formatDaySummary(current.bestDay), badgeLabel: '', status: 'positive' },
    { label: 'Worst day', value: formatDaySummary(current.worstDay), badgeLabel: '', status: 'negative' },
  ];
});
</script>
