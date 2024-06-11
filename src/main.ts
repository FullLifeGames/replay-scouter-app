import { createApp, h } from "vue";
import { createBootstrap } from "bootstrap-vue-next";
// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import App from "@/App.vue";

import VueSelect from "vue-select";
import VueDOMPurifyHTML from "vue-dompurify-html";

import useEmitter from "./plugins/emitter";

import createCustomRouter from "@/router";
const emitter = useEmitter();

const app = createApp({
  render: () => h(App),
});

app.component("VSelect", VueSelect);

app.use(createCustomRouter(emitter));
app.use(createBootstrap());
app.use(VueDOMPurifyHTML, {
  namedConfigurations: {
    a: {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target"],
    },
  },
});

app.config.globalProperties.productionTip = false;
app.config.globalProperties.devtools = true;
app.config.globalProperties.emitter = emitter;

app.mount("#app");
