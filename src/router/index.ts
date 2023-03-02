import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomePage from "@/views/HomePage.vue";
import type { EventType, Emitter } from "mitt";

const createCustomRouter = (emitter: Emitter<Record<EventType, unknown>>) => {
  const routes: RouteRecordRaw[] = [
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
      path: "/:pathMatch(.*)*",
      name: "HomePage",
      // NOTE: you can also apply meta information
      // meta: {authRequired: false }
      component: HomePage,
      // NOTE: you can also lazy-load the component
      // component: () => import("@/views/About.vue")
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
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
