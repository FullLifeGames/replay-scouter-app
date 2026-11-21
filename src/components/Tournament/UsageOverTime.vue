<template>
  <div class="tt-stack">
    <div class="tt-field">
      <label class="tt-label" for="tt-line">Lines</label>
      <div class="tt-chips">
        <span
          v-for="(line, index) in lines"
          :key="conditionText(line)"
          class="tt-chip text"
        >
          <span
            class="tt-sw"
            :style="{ background: colours[index % colours.length] }"
            aria-hidden="true"
          />
          <span v-if="line.kind !== 'pokemon'" class="kind">{{
            kindLabels[line.kind]
          }}</span>
          {{ line.name }}
          <button
            type="button"
            :aria-label="`Remove ${line.name}`"
            @click="remove(index)"
          >
            ×
          </button>
        </span>
      </div>
      <SuggestInput
        id="tt-line"
        placeholder="Add a Pokémon, move, item, ability or Tera type"
        :options="options"
        @pick="add"
      />
    </div>
    <div v-if="timeline.months.length < 2" class="tt-note">
      Too few months with at least {{ least }} Teams to draw a line. Widen the
      search to see usage over time.
    </div>
    <template v-else>
      <Line :data="chartData" :options="chartOptions" />
      <div class="tt-line">
        <button type="button" class="tt-btn" @click="downloadCsv">
          Download CSV
        </button>
        <span class="tt-muted tt-small"
          >Share of the Teams of each month that have the entry; months with
          fewer than {{ least }} Teams are left out.</span
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { saveAs } from "file-saver";
import { Line } from "vue-chartjs";
import {
  conditionText,
  kindLabels,
  sameCondition,
  type Condition,
} from "@/tournament/filter";
import type { GameSide, TokenKind } from "@/tournament/model";
import { usageOverTime, vocabularyOf } from "@/tournament/statistics";
import {
  conditionSuggestions,
  type Suggestion,
} from "@/tournament/suggestions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const properties = defineProps<{ sides: GameSide[] }>();

const least = 10;
const startWith = 5;
const colours = [
  "#3b6fd4",
  "#d4573b",
  "#2f9e63",
  "#b07cd8",
  "#d4a23b",
  "#3bb8c4",
  "#d43b8f",
  "#7f8c3a",
];

const vocabulary = computed(() => vocabularyOf(properties.sides));

/** The lines someone chose; until then, the most used Pokémon of the search. */
const chosen = ref<Condition[] | null>(null);
const lines = computed<Condition[]>(
  () =>
    chosen.value ??
    [...vocabulary.value.pokemon.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, startWith)
      .map(([name]) => ({ kind: "pokemon", name, exclude: false })),
);

const options = (text: string) => conditionSuggestions(vocabulary.value, text);
const add = (suggestion: Suggestion) => {
  const line: Condition = {
    kind: suggestion.kind as TokenKind,
    name: suggestion.value,
    exclude: false,
  };
  if (!lines.value.some((entry) => sameCondition(entry, line))) {
    chosen.value = [...lines.value, line];
  }
};
const remove = (index: number) => {
  chosen.value = lines.value.filter((_, position) => position !== index);
};

const labelOf = (condition: Condition) =>
  condition.kind === "pokemon"
    ? condition.name
    : `${kindLabels[condition.kind]}: ${condition.name}`;

const timeline = computed(() =>
  usageOverTime(properties.sides, lines.value, labelOf, least),
);

const chartData = computed<ChartData<"line", number[]>>(() => ({
  labels: timeline.value.months,
  datasets: timeline.value.lines.map((line, index) => ({
    label: line.label,
    data: line.shares.map((value) => Math.round(value * 1000) / 10),
    borderColor: colours[index % colours.length],
    backgroundColor: colours[index % colours.length],
    borderWidth: 2,
    pointRadius: 2,
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
    aspectRatio: 2.2,
    interaction: { mode: "index", intersect: false },
    plugins: {
      // the chips above the chart name the lines
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: text }, grid: { color: grid } },
      y: {
        beginAtZero: true,
        ticks: { color: text, callback: (value) => `${value}%` },
        grid: { color: grid },
      },
    },
  };
});

const downloadCsv = () => {
  const header = [
    "Month",
    "Teams",
    ...timeline.value.lines.map((line) => line.label),
  ];
  const rows = timeline.value.months.map((month, index) =>
    [
      month,
      timeline.value.totals[index],
      ...timeline.value.lines.map(
        (line) => `${(line.shares[index] * 100).toFixed(2)}%`,
      ),
    ].join(";"),
  );
  saveAs(
    new Blob([[header.join(";"), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    "usage_over_time.csv",
  );
};
</script>
