import { createRouter, createWebHistory } from "vue-router";
import DemoPage from "../components/views/DemoPage.vue";
import DocsView from "../components/views/DocsView.vue";
import LandingView from "../components/views/LandingView.vue";
import RoadmapView from "../components/views/RoadmapView.vue";
import SecurityView from "../components/views/SecurityView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: LandingView },
    { path: "/demo", name: "demo", component: DemoPage },
    { path: "/docs", name: "docs", component: DocsView },
    { path: "/security", name: "security", component: SecurityView },
    { path: "/roadmap", name: "roadmap", component: RoadmapView },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 96, behavior: "smooth" };
    return { top: 0 };
  },
});
