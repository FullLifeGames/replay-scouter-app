<template>
  <Line
    :data="chartData"
    :options="chartOptions"
    role="img"
    :aria-label="label"
  />
</template>

<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "vue-chartjs";
import { lineColours } from "@/tournament/lineColours";
import { formatCount } from "@/tournament/model";
import type { Timeline } from "@/tournament/statistics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

const properties = withDefaults(
  defineProps<{
    timeline: Timeline;
    /** Says what the chart shows to those who cannot see it. */
    label: string;
    aspectRatio?: number;
  }>(),
  { aspectRatio: 2.2 },
);

const colours = lineColours;

const chartData = computed<ChartData<"line", number[]>>(() => ({
  labels: properties.timeline.months,
  datasets: properties.timeline.lines.map((line, index) => ({
    label: line.label,
    data: line.shares.map((value) => Math.round(value * 1000) / 10),
    borderColor: colours[index % colours.length],
    backgroundColor: colours[index % colours.length],
    borderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 4,
    tension: 0.2,
  })),
}));

// the chart draws on a canvas, so it needs the theme's colours handed to it
const theme = ref(document.documentElement.dataset.bsTheme ?? "light");
useMutationObserver(
  document.documentElement,
  () => {
    theme.value = document.documentElement.dataset.bsTheme ?? "light";
  },
  { attributes: true, attributeFilter: ["data-bs-theme"] },
);

const chartOptions = computed<ChartOptions<"line">>(() => {
  const dark = theme.value === "dark";
  const text = dark ? "#dee2e6" : "#212529";
  const grid = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: properties.aspectRatio,
    // hovering anywhere above a month shows that month's values
    interaction: { mode: "index", intersect: false },
    plugins: {
      // the chips or the heading next to the chart name the lines
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue}%`,
          footer: (items) => {
            const total = properties.timeline.totals[items[0]?.dataIndex ?? -1];
            return total === undefined
              ? ""
              : `of ${formatCount(total)} Teams that month`;
          },
        },
      },
    },
    scales: {
      x: {
        // flat month labels, as many as fit
        ticks: { color: text, maxRotation: 0, autoSkipPadding: 12 },
        grid: { color: grid },
      },
      y: {
        beginAtZero: true,
        ticks: { color: text, callback: (value) => `${value}%` },
        grid: { color: grid },
      },
    },
  };
});
</script>
