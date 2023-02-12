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
            id="name-input"
            v-model="userName"
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
            id="tier-input"
            v-model="tier"
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
            id="opponents-input"
            v-model="opponents"
            :add-on-change="true"
            placeholder="Optional: Opponent Definition (e.g. 'patlop2307' or 'patlop2307, Fantos13')"
          ></b-form-tags>
        </b-input-group>
      </b-form-group>
      <b-form-group
        label-class="fw-bold pt-0"
        label="Replays"
        label-for="replays-input"
        description="Add a list of replays, each seperated by a new line"
      >
        <b-input-group>
          <b-form-textarea
            id="replays-input"
            v-model="replays"
            type="search"
            placeholder="Optional: List of replays"
          ></b-form-textarea>
        </b-input-group>
      </b-form-group>
      <div class="d-grid gap-2">
        <button class="btn btn-dark" type="button">Scout for Replays</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userName = ref([] as string[]);
const tier = ref([] as string[]);
const opponents = ref([] as string[]);
const replays = ref("");
</script>
