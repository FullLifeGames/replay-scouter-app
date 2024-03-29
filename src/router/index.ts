import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomePage from "@/views/HomePage.vue";
import TournamentsPage from "@/views/TournamentsPage.vue";
import SmogonDump from "@/views/SmogonDump.vue";
import TeamGenerator from "@/views/TeamGenerator.vue";
import type { EventType, Emitter } from "mitt";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "HomePage",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: HomePage,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
  {
    path: "/scouter",
    name: "HomePage",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: HomePage,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
  {
    path: "/tournaments",
    name: "TournamentsPage",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: TournamentsPage,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
  {
    path: "/smogonDump",
    name: "SmogonDump",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: SmogonDump,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
  {
    path: "/teamGenerator",
    name: "TeamGenerator",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: TeamGenerator,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
  {
    path: "/:pathMatch(.*)*",
    name: "HomePage",
    // NOTE: you can also apply meta information
    // meta: {authRequired: false }
    component: HomePage,
    // NOTE: you can also lazy-load the component
    // component: () => import("@/views/About.vue")
  },
];

const createCustomRouter = (emitter: Emitter<Record<EventType, unknown>>) => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  });

  router.beforeEach((to, from, next) => {
    if (typeof to.matched[0]?.components?.default === "function") {
      emitter.emit("asyncComponentLoading", to); // Start progress bar
    }
    next();
  });

  router.beforeResolve((to, from, next) => {
    next();
    emitter.emit("asyncComponentLoaded"); // Stop progress bar
  });

  return router;
};

export default createCustomRouter;
