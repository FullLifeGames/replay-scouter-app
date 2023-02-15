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
            placeholder="Optional: User Definition (e.g. 'fulllifegames' or 'fulllifegames, fulllifegamer')"
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
            placeholder="Optional: Tier Definition (e.g. 'gen9ou' or 'gen8ou, gen9ou')"
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
            placeholder="Optional: Opponent Definition (e.g. 'patlop2307' or 'patlop2307, Fantos13')"
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
            placeholder="Optional: List of replays (comma seperated)"
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
      <pre v-if="scoutingResultRaw !== ''">
        {{ scoutingResultRaw }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScoutApi, type ScoutGetRequest } from "@/api";
import useEmitter from "@/plugins/emitter";

const emitter = useEmitter();

const scoutApi = new ScoutApi();

const scoutingResultRaw = ref("");

const scoutGetRequest = ref({
  users: [],
  tiers: [],
  opponents: [],
  links: [],
} as ScoutGetRequest);

const loading = ref(false);

const scout = async () => {
  loading.value = true;
  emitter.emit("asyncComponentLoading");

  const scoutingResult = await scoutApi.scoutGet({
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
  });
  scoutingResultRaw.value = JSON.stringify(scoutingResult);

  loading.value = false;
  emitter.emit("asyncComponentLoaded");
};
</script>
