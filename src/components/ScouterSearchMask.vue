<template>
  <div>
    <p class="fst-italic">
      Please provide at a minimum a name, a tier or a list of replays (note that
      private replays will be cached and might appear on the public search).
    </p>
    <div>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Names"
        label-for="name-input"
        description="Enter the Showdown Usernames"
      >
        <b-input-group>
          <b-form-tags
            v-if="
              scoutGetRequest.users !== null &&
              scoutGetRequest.users !== undefined
            "
            id="name-input"
            v-model="scoutGetRequest.users"
            :add-on-change="true"
            placeholder="Optional: User Definition (e.g. 'fulllifegames' or 'fulllifegames,fulllifegamer')"
            separator=",;"
          ></b-form-tags>
        </b-input-group>
      </b-form-group>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Tiers"
        label-for="tier-input"
        description="Enter the Showdown Tiers"
      >
        <b-input-group style="display: block">
          <SearchSelect
            v-if="
              scoutGetRequest.tiers !== null &&
              scoutGetRequest.tiers !== undefined
            "
            id="tier-input"
            v-model="selectedTiers"
            :options="tierOptions"
            placeholder="Optional: Search for a Tier Definition (e.g. '[Gen 9] OU' or add one with 'gen9ou')"
            :taggable="true"
          />
        </b-input-group>
      </b-form-group>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Opponents"
        label-for="opponents-input"
        description="Enter the Opponent's Showdown Usernames"
      >
        <b-input-group>
          <b-form-tags
            v-if="
              scoutGetRequest.opponents !== null &&
              scoutGetRequest.opponents !== undefined
            "
            id="opponents-input"
            v-model="scoutGetRequest.opponents"
            :add-on-change="true"
            placeholder="Optional: Opponent Definition (e.g. 'patlop2307' or 'patlop2307,Fantos13')"
            separator=",;"
          ></b-form-tags>
        </b-input-group>
      </b-form-group>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Replays"
        label-for="replays-input"
        description="Enter Replays"
      >
        <b-input-group>
          <b-form-textarea
            id="replays-input"
            v-model="links"
            placeholder="Optional: List of replays (separate by new line)"
          ></b-form-textarea>
        </b-input-group>
      </b-form-group>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Date Filters"
        label-for="minimum-input"
        description="Enter a Minimum and Maximum Date"
      >
        <b-input-group prepend="Minimum" append="Maximum">
          <b-form-input
            id="minimum-input"
            v-model="scoutGetRequest.minimumDate"
            type="date"
          ></b-form-input>
          <b-form-input
            id="maximum-input"
            v-model="scoutGetRequest.maximumDate"
            type="date"
          ></b-form-input>
        </b-input-group>
      </b-form-group>
      <div>
        <b-button-toolbar class="gap-2 custom-toolbar" :justify="true">
          <b-button-group>
            <b-button
              :disabled="currentHistoryIndex === 0"
              @click="currentHistoryIndex--"
              >&lsaquo;</b-button
            >
          </b-button-group>
          <b-button-group class="w-100">
            <b-button
              id="scoutButton"
              variant="secondary"
              :disabled="loading || !canScout"
              @click="scout"
            >
              Scout for Replays
            </b-button>
          </b-button-group>
          <b-button-group>
            <b-button
              :disabled="currentHistoryIndex >= history.length"
              @click="currentHistoryIndex++"
              >&rsaquo;</b-button
            >
          </b-button-group>
        </b-button-toolbar>
      </div>
      <b-form-invalid-feedback v-if="error" id="input-live-feedback">
        Error occured during the last request!
      </b-form-invalid-feedback>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScoutApi, type ApiScoutingResult, type ScoutGetRequest } from "@/api";
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { possibleFormats } from "@/util/formats";
import type { LocationQueryValue } from "vue-router";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult | null): void;
}>();

const emitter = useEmitter();

const router = useRouter();

// Currently not supported
const query = router.currentRoute.value.query;

const transformToArray = (
  queryValue: LocationQueryValue | LocationQueryValue[],
) => {
  if (queryValue && Array.isArray(queryValue)) {
    return queryValue;
  } else if (queryValue) {
    return [queryValue];
  }
  return [];
};

const name = transformToArray(query.name);
const tier = transformToArray(query.tier);
const opponent = transformToArray(query.opponent);
const replays = transformToArray(query.replays);
const minimum = transformToArray(query.minimum)[0];
const maximum = transformToArray(query.maximum)[0];

const scoutApi = new ScoutApi();

const scoutGetRequest = ref<ScoutGetRequest>({
  users: name,
  tiers: tier,
  opponents: opponent,
  links: replays,
  minimumDate: minimum,
  maximumDate: maximum,
} as ScoutGetRequest);

const canScout = computed(() => {
  return (
    scoutGetRequest.value.users?.length ||
    scoutGetRequest.value.tiers?.length ||
    scoutGetRequest.value.links?.length
  );
});

const links = ref<string>("");
watch(links, () => {
  const linkList = links.value.split("\n");
  scoutGetRequest.value.links = [];
  for (const link of linkList.map((entry) => entry.trim())) {
    if (link) {
      scoutGetRequest.value.links.push(link);
    }
  }
});

const tierOptions = ref(possibleFormats);
const selectedTiers = ref<SearchSelectedOption[]>([]);
watch(selectedTiers, () => {
  scoutGetRequest.value.tiers = selectedTiers.value.map(
    (selectedTier) => selectedTier.i ?? selectedTier.n,
  );
});

const history = useLocalStorage<
  {
    scoutGetRequest: ScoutGetRequest;
    links: string;
    selectedTiers: SearchSelectedOption[];
    scoutingResult: ApiScoutingResult;
  }[]
>("scouter.history", []);

const currentHistoryIndex = ref(history.value.length);

watch(currentHistoryIndex, () => {
  if (history.value[currentHistoryIndex.value]) {
    const historicQuery = history.value[currentHistoryIndex.value];
    scoutGetRequest.value = historicQuery.scoutGetRequest;
    links.value = historicQuery.links;
    selectedTiers.value = historicQuery.selectedTiers;
    emit("scouting", historicQuery.scoutingResult);
  } else {
    scoutGetRequest.value = {
      links: [],
      opponents: [],
      tiers: [],
      users: [],
    };
    links.value = "";
    selectedTiers.value = [];
    emit("scouting", null);
  }
});

const loading = ref(false);
const error = ref(false);

const scout = async () => {
  loading.value = true;
  error.value = false;
  emitter.emit("asyncComponentLoading");

  try {
    const scoutingResult = await scoutApi.scoutPost({
      apiScoutingRequest: {
        users:
          scoutGetRequest.value.users && scoutGetRequest.value.users.length > 0
            ? scoutGetRequest.value.users
            : null,
        tiers:
          scoutGetRequest.value.tiers && scoutGetRequest.value.tiers.length > 0
            ? scoutGetRequest.value.tiers
            : null,
        opponents:
          scoutGetRequest.value.opponents &&
          scoutGetRequest.value.opponents.length > 0
            ? scoutGetRequest.value.opponents
            : null,
        links:
          scoutGetRequest.value.links && scoutGetRequest.value.links.length > 0
            ? scoutGetRequest.value.links
            : null,
        minimumDate: scoutGetRequest.value.minimumDate
          ? new Date(scoutGetRequest.value.minimumDate)
          : null,
        maximumDate: scoutGetRequest.value.maximumDate
          ? new Date(scoutGetRequest.value.maximumDate)
          : null,
        provideOutput: true,
      },
    });

    // To not overfill Local Storage
    if (history.value.length === 10) {
      history.value.splice(0, 1);
    }
    history.value.push({
      scoutGetRequest: scoutGetRequest.value,
      links: links.value,
      scoutingResult: scoutingResult,
      selectedTiers: selectedTiers.value,
    });
    currentHistoryIndex.value = history.value.length - 1;

    loading.value = false;
    emitter.emit("asyncComponentLoaded");
    emit("scouting", scoutingResult);
  } catch {
    loading.value = false;
    error.value = true;
    emitter.emit("asyncComponentLoaded");
  }
};

defineExpose({ links, scoutGetRequest });
</script>

<style scoped>
#input-live-feedback {
  display: block;
}
.custom-toolbar {
  flex-wrap: nowrap;
}
</style>
