<template>
  <div>
    <b-navbar toggleable="lg" class="bg-dark" data-bs-theme="dark">
      <router-link v-slot="{ href }" to="/" custom>
        <b-navbar-brand :href="href">Showdown Replay Scouter</b-navbar-brand>
      </router-link>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
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
          <li class="nav-item dropdown">
            <button
              id="bd-theme"
              class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
              type="button"
              aria-expanded="false"
              data-bs-toggle="dropdown"
              data-bs-display="static"
            >
              <i-bi-circle-half class="my-1 theme-icon-active" />
              <span class="d-lg-none ms-2">Toggle theme</span>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="bd-theme"
              style="--bs-dropdown-min-width: 8rem"
            >
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center"
                  data-bs-theme-value="light"
                >
                  <i-bi-sun-fill class="me-2 opacity-50 theme-icon" />
                  Light
                  <i-bi-check2 class="ms-auto d-none" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center"
                  data-bs-theme-value="dark"
                >
                  <i-bi-moon-stars-fill class="me-2 opacity-50 theme-icon" />
                  Dark
                  <i-bi-check2 class="ms-auto d-none" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center"
                  data-bs-theme-value="auto"
                >
                  <i-bi-circle-half class="me-2 opacity-50 theme-icon" />
                  Auto
                  <i-bi-check2 class="ms-auto d-none" />
                </button>
              </li>
            </ul>
          </li>
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
      "theme"
    ) as Theme | null;

    const getPreferredTheme = () => {
      if (storedTheme) {
        return storedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const setTheme = function (theme: Theme) {
      if (
        theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.setAttribute("data-bs-theme", "dark");
      } else {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    };

    setTheme(getPreferredTheme());

    const showActiveTheme = (theme: Theme) => {
      const activeThemeIcon = document.querySelector(".theme-icon-active use");
      const btnToActive = document.querySelector(
        `[data-bs-theme-value="${theme}"]`
      );
      if (btnToActive !== null && activeThemeIcon !== null) {
        const svgQuery = btnToActive.querySelector("svg use");
        if (svgQuery !== null) {
          const svgOfActiveBtn = svgQuery.getAttribute("href");

          if (svgOfActiveBtn !== null) {
            document
              .querySelectorAll("[data-bs-theme-value]")
              .forEach((element) => {
                element.classList.remove("active");
              });

            btnToActive.classList.add("active");
            activeThemeIcon.setAttribute("href", svgOfActiveBtn);
          }
        }
      }
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (storedTheme !== "light" && storedTheme !== "dark") {
          setTheme(getPreferredTheme());
        }
      });

    window.addEventListener("DOMContentLoaded", () => {
      showActiveTheme(getPreferredTheme());

      document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const theme = toggle.getAttribute(
            "data-bs-theme-value"
          ) as Theme | null;
          if (theme !== null) {
            localStorage.setItem("theme", theme);
            setTheme(theme);
            showActiveTheme(theme);
          }
        });
      });
    });
  },
});
</script>

<style scoped>
.profileImage {
  height: 40px;
  margin-top: -8px;
  margin-bottom: -8px !important;
}
</style>

<style>
.navbar-toggler-icon {
  mix-blend-mode: color-burn;
}
</style>
