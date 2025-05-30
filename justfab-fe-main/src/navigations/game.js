import iconJackpot from "@images/game/icon-jackpot.png";
import iconTreasure from "@images/game/icon-treasure.png";
import iconBag from "@images/game/icon-bag.png";
import iconDaily from "@images/game/icon-daily.png";
import iconRef from "@images/game/icon-ref.png";

import menuPk from "@images/game/menu-pk.png";
import menuInventory from "@images/game/menu-inventory.png";
import menuMission from "@images/game/menu-mission.png";
import menuSlot from "@images/game/menu-slot.png";
import menuTreasury from "@images/game/menu-treasury.png";

export const gameNav = [
  {
    to: "/game/treasure",
    icon: menuTreasury,
    class: "tw-aspect-[209/170] tw-w-[19%]",
    imgClass: "!tw-max-w-[90%]",
    isLink: true,
    // isLocked: true,
  },
  {
    to: "/game/inventory",
    icon: menuInventory,
    class: "tw-aspect-[202/170] tw-w-[19%]",
    imgClass: "!tw-max-w-[90%]",
    isLink: true,
  },
  {
    to: "/game/jackpot",
    icon: menuSlot,
    class: "tw-aspect-[231/170] tw-grow",
    imgClass: "!tw-max-w-[70%]",
    isLink: true,
  },
  {
    to: "/game/daily",
    icon: menuMission,
    class: "tw-aspect-[232/170] tw-w-[19%]",
    imgClass: "!tw-max-w-[90%]",
    isLink: true,
    // isLocked: true,
  },
  {
    to: "/game/pk",
    icon: menuPk,
    class: "tw-aspect-[207/170] tw-w-[19%]",
    imgClass: "!tw-max-w-[90%]",
    isLink: true,
  },
];
