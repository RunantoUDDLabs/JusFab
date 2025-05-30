const devVerticalNav = [
  {
    title: "Users",
    isLink: true,
    to: "/dashboard/users",
    icon: "material-symbols-light:home-outline",
  },

  {
    title: "Items",
    isLink: true,
    to: "/dashboard/items",
    icon: "material-symbols-light:home-outline",
  },

  {
    title: "Slot Machine",
    isLink: true,
    to: "/dashboard/slot-machine",
    icon: "material-symbols-light:home-outline",
  },
  {
    title: "Jackpot",
    isLink: true,
    to: "/dashboard/jackpot",
    icon: "material-symbols-light:home-outline",
  },
  {
    title: "Skills",
    isLink: true,
    to: "/dashboard/skills",
    icon: "material-symbols-light:home-outline",
  },
  {
    title: "Tasks",
    isLink: true,
    to: "/dashboard/tasks",
    icon: "material-symbols-light:home-outline",
  },
  {
    title: "Task Group",
    isLink: true,
    to: "/dashboard/task-group",
    icon: "material-symbols-light:home-outline",
  },
];

const prodVerticalNav = [...devVerticalNav];

export const verticalNav =
  import.meta.env.MODE === "development" ? devVerticalNav : prodVerticalNav;

const devDefaultVerticalNav = [];

const prodDefaultVerticalNav = [];

export const defaultVerticalNav =
  import.meta.env.MODE === "development"
    ? devDefaultVerticalNav
    : prodDefaultVerticalNav;
