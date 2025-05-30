import { canNavigate } from "@plugins/casl/casl";
import { store } from "@store";
import { cookies } from "@/plugins/useCookies";

const authStore = useAuthStore(store);
const userStore = useUserStore(store);

export const setupGuards = (router) => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach((to) => {
    /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */

    if (to.meta.public) return true;

    /**
     * Check if user is logged in by checking if token & user data exists in local storage
     * Feel free to update this logic to suit your needs
     */
    const isLoggedIn = !!(cookies.get("user_role") && authStore.token);

    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn) return "/";
      else return undefined;
    }

    if (to.meta.requiresAuth && !isLoggedIn) {
      // return { name: "404", query: { redirect: to.fullPath } };
      return "/";
    }

    if (!canNavigate(to) && to.matched.length) {
      /* eslint-disable indent */
      // return isLoggedIn ? { name: "404" } : "/";
      return "/";
      // : {
      // name: "/",
      // query: {
      //   ...to.query,
      //   to: to.fullPath !== "/" ? to.path : undefined,
      // },
      // };
      /* eslint-enable indent */
    }
  });
};
