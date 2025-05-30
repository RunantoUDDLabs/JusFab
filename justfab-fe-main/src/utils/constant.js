import rarityCommon from "@images/game/rarity-common.png";
import rarityRare from "@images/game/rarity-rare.png";
import rarityUltraRare from "@images/game/rarity-ultra-rare.png";
import rarityEpic from "@images/game/rarity-epic.png";
import rarityLegendary from "@images/game/rarity-legendary.png";
import rarityMythic from "@images/game/rarity-mythic.png";

export const ROLES = {
  GUEST: "GUEST",
  USER: "USER",
  ADMIN: "ADMIN",
};

export const USER_ABILITY_RULES = {
  [ROLES.GUEST]: [],
  [ROLES.USER]: [
    {
      action: "read",
      subject: "User",
      // fields: ["id", "name", "email"],
    },
    {
      action: "update",
      subject: "User",
      // fields: ["name", "email"],
    },
  ],
  [ROLES.ADMIN]: [
    {
      action: "manage",
      subject: "all",
    },
  ],
};

export const ITEM_CATEGORIES = {
  WEAPON: "WEAPON",
  ARMOR: "ARMOR",
  PET: "PET",
  ACCESSORY: "ACCESSORY",
};

export const ITEM_RARITIES = {
  COMMON: {
    name: "COMMON",
    background: rarityCommon,
  },
  RARE: {
    name: "RARE",
    background: rarityRare,
  },
  ULTRA_RARE: {
    name: "ULTRA_RARE",
    background: rarityUltraRare,
  },
  EPIC: {
    name: "EPIC",
    background: rarityEpic,
  },
  LEGENDARY: {
    name: "LEGENDARY",
    background: rarityLegendary,
  },
  MYTHIC: {
    name: "MYTHIC",
    background: rarityMythic,
  },
};

// export const ITEM_RARITIES = {
//   COMMON: "COMMON",
//   RARE: "RARE",
//   ULTRA_RARE: "ULTRA_RARE",
//   EPIC: "EPIC",
//   LEGENDARY: "LEGENDARY",
//   MYTHIC: "MYTHIC",
// };

export const REWARD_TYPES = {
  GOLD: "GOLD",
  TOKEN: "TOKEN",
  FOOD: "FOOD",
  ITEM: "ITEM",
  JACKPOT: "JACKPOT",
  SPIN: "SPIN",
  POOL_PERCENTAGE: "POOL_PERCENTAGE",
  ENERGY: "ENERGY",
};

export const TASK_TYPES = {
  LINK: "LINK",
  TELEGRAM: "TELEGRAM",
};

export const ERROR_MESSAGE = {};
