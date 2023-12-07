<template>
  <div>
    <b-card no-body class="mb-2">
      <b-card-header>
        <h4>{{ scoutingResult.outputs?.header || "Scouting Result" }}</h4>
      </b-card-header>

      <b-card-body>
        <b-list-group>
          <b-list-group-item v-for="(team, index) in teams" :key="index">
            <h5>Team {{ index + 1 }} ({{ getFormat(team) }})</h5>

            <b-table
              :items="team.pokemon"
              :fields="pokemonFields"
              :striped="true"
              class="pokemon-table"
            >
              <template #cell(name)="data">
                {{ data.item.name }} <span v-if="data.item.lead">(Lead)</span>
                <span v-if="data.item.teraType"
                  >({{ data.item.teraType }})</span
                >
              </template>
              <template #cell(ability)="data">
                {{ data.item.ability }}
              </template>
              <template #cell(item)="data">
                {{ data.item.item }}
              </template>
              <template #cell(moves)="data">
                {{ data.item.moves.join(", ") }}
              </template>
            </b-table>

            <b-button
              v-b-toggle="`replays-collapse-${index}`"
              variant="secondary"
              class="mt-2"
            >
              View Replays
            </b-button>
            <b-collapse :id="`replays-collapse-${index}`" class="mt-2">
              <b-list-group>
                <b-list-group-item
                  v-for="(replay, replayIndex) in team.replays"
                  :key="replayIndex"
                >
                  <p>Replay ID: {{ replay.id }}</p>
                  <p>
                    Players:
                    {{ replay.players ? replay.players[0] : replay.p1 }} vs
                    {{ replay.players ? replay.players[1] : replay.p2 }}
                  </p>
                  <p>Winner: {{ replay.winner }}</p>
                  <p>
                    <b-link :href="replay.link" target="_blank">
                      View Replay Link
                    </b-link>
                  </p>
                </b-list-group-item>
              </b-list-group>
            </b-collapse>
          </b-list-group-item>
        </b-list-group>
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
// Inspired by GPT 4
import type { ApiScoutingResult, Team } from "@/api";
import { getFormatFromTeam } from "@/util/teamCompareFunction";

export default {
  props: {
    scoutingResult: {
      type: Object as PropType<ApiScoutingResult>,
      required: true,
    },
    teams: {
      type: Array as PropType<Team[]>,
      required: true,
    },
  },
  data() {
    return {
      pokemonFields: ["name", "ability", "item", "moves"],
    };
  },
  methods: {
    getFormat(team: Team) {
      return getFormatFromTeam(team);
    },
  },
};
</script>

<style scoped>
.pokemon-table {
  margin-bottom: 0;
}
</style>
