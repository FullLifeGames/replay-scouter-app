<template>
  <div>
    <b-navbar toggleable="lg" class="bg-primary" data-bs-theme="dark">
      <router-link v-slot="{ href }" to="/" custom>
        <b-navbar-brand :href="href">Showdown Companion</b-navbar-brand>
      </router-link>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <router-link v-slot="{ href, isExactActive }" to="/scouter" custom>
            <b-nav-item :href="href" :active="isExactActive"
              >Replay Scouter</b-nav-item
            >
          </router-link>
          <router-link
            v-slot="{ href, isExactActive }"
            to="/tournaments"
            custom
          >
            <b-nav-item :href="href" :active="isExactActive"
              >Tournament Teams</b-nav-item
            >
          </router-link>
          <router-link v-slot="{ href, isExactActive }" to="/smogonDump" custom>
            <b-nav-item :href="href" :active="isExactActive"
              >Smogon Team Dump</b-nav-item
            >
          </router-link>
          <!--
          <router-link
            v-slot="{ href, isExactActive }"
            to="/teamGenerator"
            custom
          >
            <b-nav-item :href="href" :active="isExactActive"
              >Team Generator</b-nav-item
            >
          </router-link>
        -->
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ms-auto">
          <b-nav-item href="https://www.youtube.com/user/FullLifeGames"
            ><i-bi-youtube
          /></b-nav-item>
          <b-nav-item href="https://twitter.com/fulllifegames"
            ><i-bi-twitter
          /></b-nav-item>
          <b-nav-item href="https://github.com/FullLifeGames/replay-scouter-app"
            ><i-bi-github
          /></b-nav-item>
          <li class="nav-item">
            <form
              action="https://www.paypal.com/donate"
              method="post"
              target="_top"
            >
              <input
                type="hidden"
                name="hosted_button_id"
                value="LSAEWSQK7NJBJ"
              />
              <a
                class="nav-link"
                href="javascript:;"
                onclick="parentNode.submit();"
              >
                <i-bi-paypal />
              </a>
            </form>
          </li>
          <b-nav-item-dropdown>
            <template #button-content>
              <i-bi-circle-half class="toggle-theme" />
              <span class="d-lg-none ms-2">Toggle theme</span>
            </template>
            <b-dropdown-item-button
              data-bs-theme-value="light"
              @click="setMode('light')"
              ><i-bi-sun-fill class="me-2 opacity-50 theme-icon" />
              Light
              <i-bi-check2 class="ms-auto d-none"
            /></b-dropdown-item-button>
            <b-dropdown-item-button
              data-bs-theme-value="dark"
              @click="setMode('dark')"
              ><i-bi-moon-stars-fill class="me-2 opacity-50 theme-icon" />
              Dark
              <i-bi-check2 class="ms-auto d-none"
            /></b-dropdown-item-button>
            <b-dropdown-item-button
              data-bs-theme-value="auto"
              @click="setMode('auto')"
              ><i-bi-circle-half class="me-2 opacity-50 theme-icon" />
              Auto
              <i-bi-check2 class="ms-auto d-none"
            /></b-dropdown-item-button>
          </b-nav-item-dropdown>
          <b-nav-item href="https://fulllifegames.com"
            ><img
              class="img-fluid img-profile rounded-circle mx-auto mb-2 navbarImage profileImage"
              src="https://fulllifegames.com/img/profile.jpg"
              alt=""
          /></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
type Theme = "light" | "dark" | "auto";

export default defineComponent({
  name: "NavbarHeader",
  mounted() {
    // From: https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
    const storedTheme: Theme | null = localStorage.getItem(
      "theme",
    ) as Theme | null;

    this.setTheme(this.getPreferredTheme(storedTheme));

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (storedTheme !== "light" && storedTheme !== "dark") {
          this.setTheme(this.getPreferredTheme(storedTheme));
        }
      });

    window.addEventListener("DOMContentLoaded", () => {
      this.showActiveTheme(this.getPreferredTheme(storedTheme));
    });
  },
  methods: {
    getPreferredTheme(storedTheme: Theme | null) {
      if (storedTheme) {
        return storedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
    setMode(theme: Theme | null) {
      if (theme !== null) {
        localStorage.setItem("theme", theme);
        this.setTheme(theme);
        this.showActiveTheme(theme);
      }
    },
    setTheme(theme: Theme) {
      document.documentElement.dataset.bsTheme =
        theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : theme;
    },
    showActiveTheme(theme: Theme) {
      const activeThemeIcon = document.querySelector(".theme-icon-active use");
      const buttonToActive = document.querySelector(
        `[data-bs-theme-value="${theme}"]`,
      );
      if (buttonToActive !== null && activeThemeIcon !== null) {
        const svgQuery = buttonToActive.querySelector("svg use");
        if (svgQuery !== null) {
          const svgOfActiveButton = svgQuery.getAttribute("href");

          if (svgOfActiveButton !== null) {
            for (const element of document.querySelectorAll(
              "[data-bs-theme-value]",
            )) {
              element.classList.remove("active");
            }

            buttonToActive.classList.add("active");
            activeThemeIcon.setAttribute("href", svgOfActiveButton);
          }
        }
      }
    },
  },
});
</script>

<style scoped>
.bg-primary {
  --bvn-primary: rgb(24, 25, 79);
  --bvn-bg-primary: linear-gradient(
    45deg,
    var(--bvn-primary) 0%,
    hsla(230, 25%, 18%, 1) 72%,
    rgb(10, 17, 30) 100%
  );
  background: var(--bvn-bg-primary) !important;
}
.bg-primary :deep(.navbar-toggler-icon) {
  mix-blend-mode: color-dodge !important;
}
.profileImage {
  height: 40px;
  margin-top: -8px;
  margin-bottom: -8px !important;
}
.toggle-theme {
  margin-bottom: 0.25rem;
}
</style>

<style>
.navbar-toggler-icon {
  mix-blend-mode: color-burn;
}
</style>
