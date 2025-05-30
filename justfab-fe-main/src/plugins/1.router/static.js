export const redirects = [
  // {
  //   path: "/",
  //   redirect: "/editor",
  // },
];

export const staticRoutes = [
  {
    path: "/",
    name: "index",
    component: () => import("@/pages/home/index.vue"),
    meta: {
      layout: "blank",
      public: true,
    },
  },
];
