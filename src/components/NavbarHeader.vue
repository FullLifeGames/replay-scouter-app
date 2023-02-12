<template>
  <div>
    <b-navbar toggleable="lg" :dark="true" type="dark" variant="dark">
      <router-link v-slot="{ href }" to="/" custom>
        <b-navbar-brand :href="href">Showdown Replay Scouter</b-navbar-brand>
      </router-link>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ms-auto navbarImage">
          <b-nav-item href="https://www.youtube.com/user/FullLifeGames"
            ><i-bi-youtube
          /></b-nav-item>
          <b-nav-item href="https://twitter.com/fulllifegames"
            ><i-bi-twitter
          /></b-nav-item>
          <b-nav-item href="https://github.com/FullLifeGames/replay-scouter-app"
            ><i-bi-github
          /></b-nav-item>
          <b-nav-item href="https://fulllifegames.com"
            ><img
              class="img-fluid img-profile rounded-circle mx-auto mb-2 navbarImage"
              src="https://fulllifegames.com/img/profile.jpg"
              alt=""
          /></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<style scoped>
.navbarImage {
  height: 40px;
}
.navbarImage :deep(img) {
  margin-top: -8px;
}
</style>
