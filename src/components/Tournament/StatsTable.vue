<template>
  <div class="tt-stack" style="gap: 10px">
    <div class="tt-line">
      <div class="tt-seg" role="group" aria-label="Show the statistics as">
        <button type="button" :class="{ on: !asText }" @click="asText = false">
          Table
        </button>
        <button type="button" :class="{ on: asText }" @click="asText = true">
          Text
        </button>
      </div>
      <template v-if="kind === 'combos'">
        <label class="tt-line" style="gap: 6px"
          >Combos of
          <select v-model.number="size" aria-label="Combo size">
            <option
              v-for="value in [2, 3, 4, 5, 6]"
              :key="value"
              :value="value"
            >
              {{ value }}
            </option>
          </select>
        </label>
        <label class="tt-line" style="gap: 6px"
          ><input v-model="leads" type="checkbox" /> Leads</label
        >
      </template>
      <input
        v-model="rowFilter"
        class="tt-text"
        style="flex: 1 1 160px; width: auto"
        :placeholder="
          definition?.byPokemon || kind === 'combos'
            ? 'Only rows with this Pokémon'
            : 'Only rows with…'
        "
        aria-label="Filter the rows"
      />
      <button v-if="asText" type="button" class="tt-btn" @click="copy(text)">
        Copy text
      </button>
      <button type="button" class="tt-btn" @click="downloadCsv">
        Download CSV
      </button>
    </div>
    <span class="tt-muted tt-small"
      >{{ formatCount(table.rows.length) }} rows over
      {{ formatCount(table.total) }} Teams of the current search; a Team counts
      once per Game.</span
    >

    <template v-if="asText">
      <textarea
        readonly
        rows="30"
        aria-label="Statistics as text"
        :value="text"
      />
      <span v-if="table.rows.length > textLimit" class="tt-muted tt-small"
        >The text holds the first {{ formatCount(textLimit) }} rows; the CSV has
        all of them.</span
      >
    </template>
    <template v-else>
      <div class="tt-scroll-x tt-sheet">
        <table class="tt-st">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ label }}</th>
              <th>Usage</th>
              <th class="num">Teams</th>
              <th class="num">Win %</th>
              <th v-if="kind === 'pokemon'" />
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(row, index) in table.rows.slice(0, limit)"
              :key="row.key"
            >
              <tr>
                <td class="tt-muted">{{ index + 1 }}</td>
                <td>
                  <span class="tt-line" style="gap: 6px">
                    <span v-if="iconsOf(row.key).length > 0" class="tt-team">
                      <IconRenderer
                        v-for="name in iconsOf(row.key)"
                        :key="name"
                        :name="name"
                      />
                    </span>
                    <button
                      type="button"
                      class="tt-rowname"
                      title="Show the Matches"
                      @click="pick(row.key)"
                    >
                      {{ row.key }}
                    </button>
                  </span>
                </td>
                <td>
                  <span class="tt-bar"
                    ><i
                      :style="{
                        width: `${share(row.use, table.rows[0].use) * 100}%`,
                      }"
                  /></span>
                  <span class="tt-small tt-muted">
                    {{ percent(row.use, table.total) }}</span
                  >
                </td>
                <td class="num">{{ formatCount(row.use) }}</td>
                <td class="num">
                  <span class="tt-wr" :class="rating(row)">{{
                    percent(row.wins, row.decided)
                  }}</span>
                </td>
                <td v-if="kind === 'pokemon'">
                  <button
                    type="button"
                    class="tt-btn"
                    :aria-expanded="detailOf === row.key"
                    @click="detailOf = detailOf === row.key ? null : row.key"
                  >
                    {{ detailOf === row.key ? "Less" : "Detail" }}
                  </button>
                </td>
              </tr>
              <tr
                v-if="kind === 'pokemon' && detailOf === row.key"
                class="detail"
              >
                <td />
                <td colspan="5">
                  <PokemonFocus
                    :name="row.key"
                    :sides="sides"
                    inline
                    style="padding: 8px 0"
                    @require="
                      (conditions, about) => emit('require', conditions, about)
                    "
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div v-if="table.rows.length > limit" class="tt-line">
        <button type="button" class="tt-btn" @click="limit += 50">
          Show 50 more
        </button>
        <button type="button" class="tt-btn" @click="limit = table.rows.length">
          Show all {{ formatCount(table.rows.length) }}
        </button>
      </div>
      <div v-if="table.rows.length === 0" class="tt-note">
        Nothing to count in this search.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { saveAs } from "file-saver";
import { usageCsv, usageText } from "@/tournament/export";
import type { Condition } from "@/tournament/filter";
import { formatCount, toId, type GameSide } from "@/tournament/model";
import {
  comboConditions,
  comboTable,
  pokemonOfRow,
  share,
  tableKinds,
  tally,
  type Row,
  type Table,
} from "@/tournament/statistics";

const properties = defineProps<{
  sides: GameSide[];
  /** The id of one of the table kinds, or "combos". */
  kind: string;
}>();

const emit = defineEmits<{
  /** Asks for the Matches of Teams that meet the Conditions; `about` says what they describe. */
  require: [conditions: Condition[], about: string];
}>();

const textLimit = 2000;

const asText = ref(false);
const size = ref(2);
const leads = ref(false);
const rowFilter = ref("");
const limit = ref(30);
const detailOf = ref<string | null>(null);

const definition = computed(() =>
  tableKinds.find((entry) => entry.id === properties.kind),
);
const label = computed(() =>
  properties.kind === "combos"
    ? `Combos of ${size.value}`
    : (definition.value?.label ?? ""),
);

const counted = computed<Table>(() => {
  if (properties.kind === "combos") {
    return comboTable(properties.sides, size.value, leads.value);
  }
  const kind = definition.value;
  return kind
    ? tally(properties.sides, (team) => kind.keysOf(team))
    : { total: 0, rows: [] };
});
const table = computed<Table>(() => {
  const wanted = toId(rowFilter.value);
  if (wanted === "") {
    return counted.value;
  }
  return {
    total: counted.value.total,
    rows: counted.value.rows.filter((row) => toId(row.key).includes(wanted)),
  };
});
watch(
  [() => properties.kind, () => properties.sides, size, leads, rowFilter],
  () => {
    limit.value = 30;
  },
);

const text = computed(() =>
  asText.value ? usageText(table.value, label.value, textLimit) : "",
);

const iconsOf = (key: string) =>
  pokemonOfRow(
    properties.kind === "combos" ? "combos" : (definition.value ?? "combos"),
    key,
  );

const percent = (part: number, whole: number) => {
  const value = share(part, whole) * 100;
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}%`;
};

const rating = (row: Row) => {
  if (row.decided < 5) {
    return "";
  }
  const won = share(row.wins, row.decided);
  if (won >= 0.55) {
    return "good";
  }
  return won <= 0.45 ? "bad" : "";
};

const pick = (key: string) => {
  const conditions =
    properties.kind === "combos"
      ? comboConditions(key)
      : (definition.value?.conditions(key) ?? []);
  emit("require", conditions, key);
};

const copy = (value: string) => {
  navigator.clipboard?.writeText(value).catch(() => {});
};

const downloadCsv = () => {
  saveAs(
    new Blob([usageCsv(table.value)], { type: "text/csv;charset=utf-8" }),
    properties.kind === "combos"
      ? `combos_of_${size.value}.csv`
      : (definition.value?.file ?? "statistics.csv"),
  );
};
</script>
