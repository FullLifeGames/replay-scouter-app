<template>
  <div>
    <p class="fst-italic">
      Please provide at a minimum a name or a list of replays (note that private
      replays will be cached and might appear on the public search).
    </p>
    <div>
      <b-form-group
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
        label-class="fw-bold pt-0"
        label="Tiers"
        label-for="tier-input"
        description="Enter the Showdown Tiers"
      >
        <b-input-group>
          <b-form-tags
            v-if="
              scoutGetRequest.tiers !== null &&
              scoutGetRequest.tiers !== undefined
            "
            id="tier-input"
            v-model="scoutGetRequest.tiers"
            :add-on-change="true"
            placeholder="Optional: Tier Definition (e.g. 'gen9ou' or 'gen8ou,gen9ou')"
            separator=",;"
          ></b-form-tags>
        </b-input-group>
      </b-form-group>
      <b-form-group
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
        label-class="fw-bold pt-0"
        label="Replays"
        label-for="replays-input"
        description="Enter Replays"
      >
        <b-input-group>
          <b-form-tags
            v-if="
              scoutGetRequest.links !== null &&
              scoutGetRequest.links !== undefined
            "
            id="replays-input"
            v-model="scoutGetRequest.links"
            :add-on-change="true"
            placeholder="Optional: List of replays (comma separated)"
            separator=",;"
          ></b-form-tags>
        </b-input-group>
      </b-form-group>
      <div class="d-grid gap-2">
        <button
          class="btn btn-secondary"
          type="button"
          :disabled="loading"
          @click="scout"
        >
          Scout for Replays
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScoutApi, type ApiScoutingResult, type ScoutGetRequest } from "@/api";
import useEmitter from "@/plugins/emitter";
import type { LocationQueryValue } from "vue-router";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const router = useRouter();
const query = router.currentRoute.value.query;

const transformToArray = (
  queryValue: LocationQueryValue | LocationQueryValue[]
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

const scoutApi = new ScoutApi();

const scoutGetRequest = ref({
  users: name,
  tiers: tier,
  opponents: opponent,
  links: replays,
} as ScoutGetRequest);

const loading = ref(false);

const scout = async () => {
  loading.value = true;
  emitter.emit("asyncComponentLoading");

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
      provideOutput: true,
    },
  });

  loading.value = false;
  emitter.emit("asyncComponentLoaded");
  emit("scouting", scoutingResult);
};
</script>
