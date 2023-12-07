<template>
  <div id="app">
    <NavbarHeader />
    <ProgressBar />
    <b-container class="text-center team-container">
      <RouterView />
    </b-container>
  </div>
</template>

<style scoped>
.team-container {
  margin-top: 0.5rem;
}
</style>

<style>
[data-bs-theme="dark"] .b-form-tags.focus {
  color: var(--bs-primary-text-emphasis);
  background-color: var(--bs-primary-bg-subtle);
}
[data-bs-theme="dark"] .v-select ul {
  background-color: var(--bs-primary-bg-subtle);
}
</style>
