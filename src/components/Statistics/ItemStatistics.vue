<template>
  <div>
    <SearchQuery :scouting-result="props.scoutingResult" @change="change" />
    <b-form-textarea
      v-if="statistics !== ''"
      v-model="statistics"
      class="statisticsText"
      rows="53"
      :readonly="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import { renderUsageDict } from "@/util/statisticFormatting";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const change = (searchedTeams: Team[]) => {
  teams.value = searchedTeams;
};

const statistics = computed(() => {
  if (teams.value) {
    const itemDict: { [item: string]: { use: number; wins: number } } = {};
    for (const team of teams.value) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentItem: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.item) {
          continue;
        }
        currentItem.add(pokemon.item);
      }
      for (const item of currentItem) {
        if (!itemDict[item]) {
          itemDict[item] = { use: 0, wins: 0 };
        }
        itemDict[item].use += games;
        itemDict[item].wins += wins;
      }
    }
    return renderUsageDict(itemDict, teams.value, "Item");
  }
  return "";
});
</script>

<style scoped>
.statisticsText {
  font-family: Consolas, Menlo, Monaco, "Lucida Console", "Courier New", Courier,
    monospace;
  font-size: 11px;
}
</style>
