<template>
  <div v-if="teams">
    <SearchQuery
      :multiple="true"
      name="Usage Parameters"
      placeholder="Enter a Pokémon, Move or Item of you want to visualize the usage over time"
      :scouting-result="props.scoutingResult"
      :sorting-active="false"
      @change="change"
    />
    <Line
      v-if="searchQueries[0].length > 0"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
// Renders a graph based on a given item, graph or whatever
// X - Axis is date
// Y - Axis is the percentage being used from first starting point
//  (i.e. starts with 0% or 100% => n: times being used, m: number of teams, v: value => v = n / m)
import type { ApiScoutingResult, Team } from "@/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  type ChartData,
  type ChartOptions,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-luxon";
import { Line } from "vue-chartjs";
import { createRandomColor } from "@/util/randomColor";
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const teamIndizes = ref<number[]>([]);
const searchQueries = ref<string[][]>([[]]);
const fullValidationListList = ref<boolean[][]>([]);
const change = (
  _: Team[],
  __: string[],
  foundTeamIndizes: number[],
  determinedSearchQueries: string[][],
  determinedFullValidationListList: boolean[][],
) => {
  teamIndizes.value = foundTeamIndizes;
  searchQueries.value = determinedSearchQueries;
  fullValidationListList.value = determinedFullValidationListList;
};

const chartOptions = ref<ChartOptions<"line">>({
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: "time",
    },
  },
});

type LabeledTeamItem = {
  date: number;
  team: Team;
  valid: boolean[];
};
type LabeledTeamList = LabeledTeamItem[];
const labeledTeamList = computed(() => {
  const computingLabeledTeamList: LabeledTeamList = [];
  if (props.scoutingResult && props.scoutingResult.teams && teamIndizes.value) {
    for (const teamIndex in props.scoutingResult.teams) {
      const team = props.scoutingResult.teams[teamIndex];
      const applicable = fullValidationListList.value[teamIndex];
      if (team.replays) {
        for (const replay of team.replays) {
          if (replay.uploadTime) {
            computingLabeledTeamList.push({
              date: replay.uploadTime,
              team,
              valid: applicable,
            });
          }
        }
      }
    }
    return computingLabeledTeamList.sort((a, b) => a.date - b.date);
  }
  return computingLabeledTeamList;
});

type lineType = "line";
type lineData = number[];
type LineData = ChartData<lineType, lineData>;
const chartData = computed<LineData>(() => {
  const computedChartData: LineData = {
    labels: labeledTeamList.value.map((entry) => new Date(entry.date * 1000)),
    datasets: [],
  };
  for (const searchQueryIndex in searchQueries.value) {
    const searchQuery = searchQueries.value[searchQueryIndex];
    if (searchQuery.length === 0) {
      continue;
    }
    const data: number[] = [];
    let count = 0;
    let totalCount = 0;
    for (const teamIndex in labeledTeamList.value) {
      const applicable =
        labeledTeamList.value[teamIndex].valid[searchQueryIndex];
      if (applicable) {
        count += 1;
      }
      totalCount += 1;
      data.push(count / totalCount);
    }
    computedChartData.datasets.push({
      data,
      borderColor: createRandomColor(),
      label: searchQuery.join(" "),
    });
  }
  return computedChartData;
});
</script>

<style scoped></style>
