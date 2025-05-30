<script setup>
import gameBgInventory from "@images/game/bg-game-inventory.png";
import bgBar1 from "@images/game/bar-1.png";
import bgSlot from "@images/game/bg-slot-inventory.png";
import btnByQuality from "@images/game/btn-by-quality.png";
import btnMerge from "@images/game/btn-merge.png";
import kapybara from "@images/game/kapybara-inventory.png";
import hpIndex from "@images/game/hp-index.png";
import defenseIndex from "@images/game/defense-index.png";
import attackIndex from "@images/game/attack-index.png";
import btnFeed from "@images/game/btn-feed.png";
import bgRibbon from "@images/game/bg-ribbon.png";
import slot1 from "@images/game/slot-1.png";
import slot2 from "@images/game/slot-2.png";
import slot3 from "@images/game/slot-3.png";
import slot4 from "@images/game/slot-4.png";
import slot5 from "@images/game/slot-5.png";
import slot6 from "@images/game/slot-6.png";
import food from "@images/game/food.svg";
import voucher from "@images/game/voucher.png";
import rarityMythic from "@images/game/rarity-mythic.png";
import overlaySlotInventoryEquiped from "@images/game/overlay-slot-inventory-equiped.png";
import overlaySlotInventorySelecting from "@images/game/overlay-slot-inventory-selecting.png";

definePage({
  meta: {
    layout: "game",
    requiresAuth: true,
    subject: "User",
    action: "read",
  },
});

const { observe } = useMixin();
const userStore = useUserStore();
const gameStore = useGameStore();

const inventoryData = ref();
const foodSvgRef = ref();
const foodBarSvgRef = ref();
const itemsContainerRef = ref();
const itemsContainerWidth = ref(0);
const itemsContainerHeight = ref(0);
const voucherSvgRefs = ref([]);
const unclaimRewards = ref([]);
// const itemsContainerGapX = ref(0);
// const itemsContainerGapY = ref(0);
// const itemsContainerPaddingX = ref(0);
// const itemsContainerPaddingY = ref(0);
const lastHeight = ref(0);
const selectedItem = ref();
// const currentEquipments = ref();
const gameContainerRef = ref();

const userInventory = computed(() => inventoryData.value?.items);
const fontSizeBase = computed(() => gameStore.baseFontSize);
const voucherFontSize = computed(() => {
  if (!voucherSvgRefs.value?.length) return 0;
  if (voucherFontSize.value > 0) return;

  return gameStore.setFontSizeBasedOnViewBox(voucherSvgRefs.value[0], 18);
});
const itemsContainerGapX = computed(() =>
  Math.round(itemsContainerWidth.value * 0.05)
);
const itemsContainerGapY = computed(() =>
  Math.round(itemsContainerHeight.value * 0.1)
);
const itemsContainerPaddingX = computed(() =>
  Math.round(itemsContainerWidth.value * 0.05)
);
const itemsContainerPaddingY = computed(() =>
  Math.round(itemsContainerHeight.value * 0.1)
);
const hasPoolPercentage = computed(() => {
  if (!unclaimRewards.value) return false;
  return unclaimRewards.value.filter(
    (reward) => reward.reward.type === REWARD_TYPES.POOL_PERCENTAGE
  );
});
const weaponSlots = computed(() => {
  if (!userInventory.value || !gameStore.equippedKapy) return [];

  return gameStore.equippedKapy
    .filter((eq) => {
      const item = userInventory.value.find((i) => i._id === eq._id);
      return item && item.item.category === ITEM_CATEGORIES.WEAPON;
    })
    .map((eq) => userInventory.value.find((i) => i._id === eq._id));
});
const weaponSlot1 = computed(() => weaponSlots.value[0] || null);
const weaponSlot2 = computed(() => weaponSlots.value[1] || null);
const petSlots = computed(() => {
  if (!userInventory.value || !gameStore.equippedKapy) return [];

  return gameStore.equippedKapy
    .filter((eq) => {
      const item = userInventory.value.find((i) => i._id === eq._id);
      return item && item.item.category === ITEM_CATEGORIES.PET;
    })
    .map((eq) => userInventory.value.find((i) => i._id === eq._id));
});
const petSlot1 = computed(() => petSlots.value[0] || null);
const petSlot2 = computed(() => petSlots.value[1] || null);
const armorSlots = computed(() => {
  if (!userInventory.value || !gameStore.equippedKapy) return null;

  const eq = gameStore.equippedKapy.find((eq) => {
    const item = userInventory.value.find((i) => i._id === eq._id);
    return item && item.item.category === ITEM_CATEGORIES.ARMOR;
  });

  return eq ? userInventory.value.find((i) => i._id === eq._id) : null;
});
const accessorySlot = computed(() => {
  if (!userInventory.value || !gameStore.equippedKapy) return null;

  const eq = gameStore.equippedKapy.find((eq) => {
    const item = userInventory.value.find((i) => i._id === eq._id);
    return item && item.item.category === ITEM_CATEGORIES.ACCESSORY;
  });

  return eq ? userInventory.value.find((i) => i._id === eq._id) : null;
});
const tooltipAttachTarget = computed(() => gameContainerRef.value || undefined);

onMounted(async () => {
  nextTick(() => {
    if (itemsContainerRef.value) {
      observe(itemsContainerRef.value, handleResize);
    }
    window.addEventListener("resize", onResizeWindow);
  });

  const p1 = getInventory();

  const p2 = getUserInfo();

  const p3 = getUnclaim();

  await Promise.all([p1, p2, p3]);
});

const handleResize = (newWidth, newHeight) => {
  if (
    newWidth !== itemsContainerWidth.value ||
    Math.abs(newHeight - lastHeight.value) > 5
  ) {
    itemsContainerWidth.value = newWidth;
    itemsContainerHeight.value = newHeight;
    lastHeight.value = newHeight;
  }
};

const onResizeWindow = () => {
  if (itemsContainerRef.value) {
    observe(itemsContainerRef.value, handleResize);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeWindow);
});

// onUnmounted(() => {
//   if (resizeObserver) {
//     resizeObserver.disconnect();
//   }
// });

const getInventory = async () => {
  try {
    const response = await getUserInventory(userStore.userData?._id);
    inventoryData.value = response;
  } catch (error) {
    console.error(error);
  }
};

const getUnclaim = async () => {
  try {
    const response = await getUnclaimedRewards();
    unclaimRewards.value = response;
  } catch (error) {
    console.error(error);
  }
};

const submitByQuality = () => {
  console.log("submitByQuality");
};

const submitMerge = () => {
  console.log("submitMerge");
};

const handleSelectItem = (item) => {
  if (selectedItem.value?._id === item._id) {
    selectedItem.value = null;
    return;
  }

  selectedItem.value = item;
};

const equipItem = async (typeItem, slot) => {
  try {
    if (!selectedItem.value) {
      await unequipItem(typeItem, slot);
      return;
    }

    if (
      selectedItem.value === "food" ||
      selectedItem.value?.item.category !== typeItem ||
      gameStore.equippedKapy.some((eq) => eq._id === selectedItem.value._id)
    )
      return;

    const selected = selectedItem.value;
    const category = selected.item.category;

    let currentSlotItem = null;

    if (category === ITEM_CATEGORIES.PET) {
      currentSlotItem = slot === 1 ? petSlot1.value : petSlot2.value;
    } else if (category === ITEM_CATEGORIES.WEAPON) {
      console.log("weapon", slot);
      currentSlotItem = slot === 1 ? weaponSlot1.value : weaponSlot2.value;
    } else if (category === ITEM_CATEGORIES.ARMOR) {
      currentSlotItem = armorSlots.value;
    } else if (category === ITEM_CATEGORIES.ACCESSORY) {
      currentSlotItem = accessorySlot.value;
    }

    if (currentSlotItem?._id === selected._id) return;

    if (currentSlotItem) {
      const index = gameStore.equippedKapy.findIndex(
        (eq) => eq._id === currentSlotItem._id
      );
      console.log("index", index);
      if (index !== -1) {
        console.log(
          "gameStore.equippedKapy[index]._id",
          gameStore.equippedKapy[index]._id,
          selected._id
        );
        gameStore.equippedKapy[index]._id = selected._id;
      } else {
        gameStore.equippedKapy.push({
          _id: selected._id,
          item: selected.item,
        });
      }
    } else {
      gameStore.equippedKapy.push({ _id: selected._id, item: selected.item });
    }

    const equipments = gameStore.equippedKapy.map((eq) => eq._id);
    const response = await setEquipments(equipments);
    if (response) {
      await gameStore.getKapyDetails();
    }
  } catch (error) {
    console.error(error);
  }
};

const unequipItem = async (typeItem, slot) => {
  try {
    let currentSlotItem = null;

    if (typeItem === ITEM_CATEGORIES.PET) {
      currentSlotItem = slot === 1 ? petSlot1.value : petSlot2.value;
    } else if (typeItem === ITEM_CATEGORIES.WEAPON) {
      currentSlotItem = slot === 1 ? weaponSlot1.value : weaponSlot2.value;
    } else if (typeItem === ITEM_CATEGORIES.ARMOR) {
      currentSlotItem = armorSlots.value;
    } else if (typeItem === ITEM_CATEGORIES.ACCESSORY) {
      currentSlotItem = accessorySlot.value;
    }

    if (!currentSlotItem) return;

    const index = gameStore.equippedKapy.findIndex(
      (eq) => eq._id === currentSlotItem._id
    );
    if (index !== -1) {
      gameStore.equippedKapy.splice(index, 1);

      const equipments = gameStore.equippedKapy.map((eq) => eq._id);
      const response = await setEquipments(equipments);
      if (response) {
        await gameStore.getKapyDetails();
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const isEquipped = (itemId) => {
  if (!gameStore.equippedKapy) return false;
  return gameStore.equippedKapy.some((eq) => eq._id === itemId);
};
</script>

<template>
  <div
    class="game-content tw-flex-grow tw-flex tw-flex-col tw-relative tw-overflow-hidden"
    ref="gameContainerRef"
  >
    <!-- <div class="tw-flex tw-flex-col tw-h-full"> -->
    <div
      class="tw-aspect-[1080/932] tw-w-full tw-flex tw-flex-col tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative"
      :style="{ backgroundImage: `url(${gameBgInventory})` }"
    >
      <div class="tw-w-full tw-flex-grow tw-items-start tw-px-[12%] tw-pt-[1%]">
        <div
          class="tw-h-full tw-grid tw-grid-cols-4 tw-grid-rows-3 tw-gap-x-[4%] tw-gap-y-[6%]"
        >
          <div
            class="slot-item roll-in-left"
            :class="{
              highlight:
                selectedItem?.item?.category === ITEM_CATEGORIES.WEAPON,
            }"
            :style="{
              backgroundImage: weaponSlot1
                ? `url(${ITEM_RARITIES[weaponSlot1.rarity].background})`
                : `url(${slot1})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.WEAPON, 1)"
          >
            <img
              v-if="weaponSlot1"
              :src="srcAsset(weaponSlot1?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.WEAPON"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
          <div class="tw-col-span-2 tw-row-span-3">
            <div
              class="tw-aspect-[274/91] tw-w-3/4 tw-mx-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center tw-pl-[18%] tw-text-white"
              :style="{
                backgroundImage: `url(${bgRibbon})`,
                fontSize: '17.352px',
              }"
            >
              <div class="-tw-mt-[2%]">{{ gameStore.combatPower || 0 }}</div>
            </div>

            <div
              class="tw-aspect-[371/417] tw-w-full -tw-ml-[8%] tw-mt-[13%] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center bounce-in-top"
              :style="{ backgroundImage: `url(${kapybara})` }"
            ></div>
          </div>
          <div
            class="slot-item roll-in-right"
            :class="{
              highlight:
                selectedItem?.item?.category === ITEM_CATEGORIES.WEAPON,
            }"
            :style="{
              backgroundImage: weaponSlot2
                ? `url(${ITEM_RARITIES[weaponSlot2.rarity]?.background})`
                : `url(${slot2})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.WEAPON, 2)"
          >
            <img
              v-if="weaponSlot2"
              :src="srcAsset(weaponSlot2?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.WEAPON"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
          <div
            class="slot-item roll-in-left"
            :class="{
              highlight: selectedItem?.item?.category === ITEM_CATEGORIES.ARMOR,
            }"
            :style="{
              backgroundImage: armorSlots
                ? `url(${ITEM_RARITIES[armorSlots.rarity]?.background})`
                : `url(${slot3})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.ARMOR)"
          >
            <v-img
              v-if="armorSlots"
              :src="srcAsset(armorSlots?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.ARMOR"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
          <div
            class="slot-item roll-in-right"
            :class="{
              highlight:
                selectedItem?.item?.category === ITEM_CATEGORIES.ACCESSORY,
            }"
            :style="{
              backgroundImage: accessorySlot
                ? `url(${ITEM_RARITIES[accessorySlot.rarity]?.background})`
                : `url(${slot4})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.ACCESSORY)"
          >
            <v-img
              v-if="accessorySlot"
              :src="srcAsset(accessorySlot?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.ACCESSORY"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
          <div
            class="slot-item roll-in-left"
            :class="{
              highlight: selectedItem?.item?.category === ITEM_CATEGORIES.PET,
            }"
            :style="{
              backgroundImage: petSlot1
                ? `url(${ITEM_RARITIES[petSlot1.rarity]?.background})`
                : `url(${slot5})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.PET, 1)"
          >
            <v-img
              v-if="petSlot1"
              :src="srcAsset(petSlot1?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.PET"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
          <div
            class="slot-item roll-in-right"
            :class="{
              highlight: selectedItem?.item?.category === ITEM_CATEGORIES.PET,
            }"
            :style="{
              backgroundImage: petSlot2
                ? `url(${ITEM_RARITIES[petSlot2.rarity]?.background})`
                : `url(${slot6})`,
            }"
            @click="equipItem(ITEM_CATEGORIES.PET, 2)"
          >
            <v-img
              v-if="petSlot2"
              :src="srcAsset(petSlot2?.item?.photoUrl)"
              class="!tw-max-w-[80%] tw-w-full tw-h-auto"
            />

            <img
              v-if="selectedItem?.item?.category === ITEM_CATEGORIES.PET"
              :src="overlaySlotInventorySelecting"
              class="tw-absolute tw-w-full tw-h-auto"
            />
          </div>
        </div>
      </div>

      <div
        class="tw-w-full tw-grid tw-items-center tw-grid-cols-3 tw-px-[4%] tw-aspect-[1080/100] -tw-mb-[2%]"
      >
        <!-- <div class=""></div>

        <div class="">
          <div
            class="tw-aspect-[260/64] tw-w-[78%] tw-bg-contain tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-md tw-mx-auto"
            :style="{ backgroundImage: `url(${bgLayer1})` }"
          ></div>
        </div> -->

        <div class="tw-text-center tw-col-start-2">
          <v-btn
            flat
            color="transparent"
            class="tw-aspect-[179/100] tw-w-[54%] !tw-h-auto tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] disable-element"
            :style="{ backgroundImage: `url(${btnFeed})` }"
          ></v-btn>
        </div>
      </div>

      <div
        class="tw-w-full tw-aspect-[1080/100] tw-flex tw-justify-center tw-items-center"
      >
        <div
          class="tw-aspect-[282/116] tw-w-[26%] tw-bg-contain tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-md tw-flex tw-justify-center tw-items-center tw-pt-[1.5%] tw-pl-[2%]"
          :style="{ backgroundImage: `url(${hpIndex})`, fontSize: '17.352px' }"
        >
          {{ formatNumber(gameStore.statsKapy?.hp) || 0 }}
        </div>
        <div
          class="tw-aspect-[282/116] tw-w-[26%] tw-bg-contain tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-md tw-flex tw-justify-center tw-items-center tw-pt-[1%] tw-pl-[4%]"
          :style="{
            backgroundImage: `url(${defenseIndex})`,
            fontSize: '17.352px',
          }"
        >
          {{ formatNumber(gameStore.statsKapy?.defense) || 0 }}
        </div>
        <div
          class="tw-aspect-[284/116] tw-w-[26%] tw-bg-contain tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-md tw-flex tw-justify-center tw-items-center tw-pt-[1%] tw-pl-[2%]"
          :style="{
            backgroundImage: `url(${attackIndex})`,
            fontSize: '17.352px',
          }"
        >
          {{ formatNumber(gameStore.statsKapy?.attack) || 0 }}
        </div>
      </div>

      <div
        class="tw-w-full tw-aspect-[1080/100] tw-flex tw-justify-between tw-items-center tw-px-[4%] -tw-mb-[0.5%]"
      >
        <v-btn
          flat
          color="transparent"
          class="tw-aspect-[213/76] tw-w-[21.4%] !tw-h-auto tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-md disable-element"
          :style="{ backgroundImage: `url(${btnByQuality})` }"
          @click.stop="submitByQuality"
        ></v-btn>

        <v-btn
          flat
          color="transparent"
          class="tw-aspect-[214/76] tw-w-[21.5%] !tw-h-auto tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-md disable-element"
          :style="{ backgroundImage: `url(${btnMerge})` }"
          @click.stop="submitMerge"
        ></v-btn>
      </div>
    </div>

    <div
      ref="itemsContainerRef"
      class="tw-bg-[#23212e] tw-aspect-[1080/420] tw-flex-auto tw-w-full tw-max-w-screen tw-box-border tw-overflow-y-scroll tw-px-[5%]"
      :style="{
        'padding-top': `${itemsContainerPaddingY}px`,
        'padding-bottom': `${itemsContainerPaddingY}px`,
        'padding-left': `${itemsContainerPaddingX}px`,
        'padding-right': `${itemsContainerPaddingX}px`,
      }"
    >
      <div
        class="tw-grid tw-grid-cols-4"
        :style="{
          'row-gap': `${itemsContainerGapX}px`,
          'column-gap': `${itemsContainerGapY}px`,
        }"
      >
        <div
          class="tw-aspect-[178/178] tw-w-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
          :style="{ backgroundImage: `url(${bgSlot})` }"
          @click.stop="selectedItem = 'food'"
        >
          <v-img :src="food" class="!tw-max-w-[60%] tw-w-full tw-h-auto" />

          <svg
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
            class="tw-w-full tw-h-full tw-absolute"
            ref="foodSvgRef"
          >
            <text
              x="80%"
              y="75%"
              dominant-baseline="middle"
              text-anchor="end"
              font-family="DynaPuff"
              :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                foodSvgRef,
                15
              )}px`"
              font-weight="700"
              fill="#fff"
              stroke="#000000"
              stroke-width="1.5"
              paint-order="stroke fill"
              text-overflow="ellipsis"
              white-space="nowrap"
              overflow="hidden"
              width="100%"
            >
              {{ userStore.userData?.food || 0 }}
            </text>
          </svg>
        </div>

        <div
          class="tw-aspect-[178/178] tw-w-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
          :style="{ backgroundImage: `url(${rarityMythic})` }"
          v-if="hasPoolPercentage.length"
          v-for="voucherItem in hasPoolPercentage"
        >
          <v-img :src="voucher" class="!tw-max-w-[70%] tw-w-full tw-h-auto" />

          <svg
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
            class="tw-w-full tw-h-full tw-absolute"
            ref="voucherSvgRefs"
          >
            <text
              v-if="voucherFontSize"
              x="80%"
              y="75%"
              dominant-baseline="middle"
              text-anchor="end"
              font-family="DynaPuff"
              :font-size="`${voucherFontSize}px`"
              font-weight="700"
              fill="#fff"
              stroke="#000000"
              stroke-width="1.5"
              paint-order="stroke fill"
              text-overflow="ellipsis"
              white-space="nowrap"
              overflow="hidden"
              width="100%"
            >
              {{ voucherItem.reward.value }}%
            </text>
          </svg>
        </div>

        <v-tooltip
          v-if="userInventory && userInventory.length"
          v-for="item in userInventory"
          :key="item._id"
          :model-value="selectedItem?._id === item._id"
          :open-on-hover="false"
          :open-on-click="true"
          :close-on-content-click="true"
          :attach="gameContainerRef"
          scroll-strategy="close"
          contained
          location="top"
          location-strategy="connected"
        >
          <template #activator="{ props }">
            <div
              v-bind="props"
              class="tw-aspect-[178/178] tw-w-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
              :style="{
                backgroundImage: `url(${
                  ITEM_RARITIES[item?.rarity].background
                })`,
              }"
              @click.stop="handleSelectItem(item)"
            >
              <v-img
                :src="srcAsset(item.item?.photoUrl)"
                class="!tw-max-w-[75%] tw-w-full tw-h-auto"
              />

              <img
                v-if="isEquipped(item._id)"
                :src="overlaySlotInventoryEquiped"
                class="tw-absolute tw-w-full tw-h-auto"
              />

              <img
                v-if="selectedItem?._id === item._id"
                :src="overlaySlotInventorySelecting"
                class="tw-absolute tw-w-full tw-h-auto"
              />
            </div>
          </template>

          <div>
            <div
              :style="{
                fontSize: `${fontSizeBase * 0.9}px`,
              }"
            >
              {{ item.item.name }} - Level {{ item.level }}
            </div>
            <div
              :style="{
                fontSize: `${fontSizeBase * 0.7}px`,
              }"
            >
              {{ item.rarity }} {{ item.item.category }}
            </div>
            <div
              class="tw-grid tw-grid-cols-2"
              :style="{
                fontSize: `${fontSizeBase * 0.7}px`,
              }"
            >
              <div>HP: {{ item.currentStats.hp }}</div>
              <div>ATK: {{ item.currentStats.attack }}</div>
              <div>DEF: {{ item.currentStats.defense }}</div>
              <div>LUK: {{ item.currentStats.luck }}</div>
            </div>
          </div>
        </v-tooltip>

        <div class="tw-col-span-full tw-h-[0.1vh]"></div>
      </div>
    </div>

    <div
      class="tw-w-full tw-aspect-[1080/145] tw-flex tw-justify-center tw-items-center tw-px-[6%] tw-gap-[4%]"
      :style="{ backgroundImage: `url(${bgBar1})` }"
    >
      <!-- <v-btn
        color="transparent"
        class="tw-aspect-[326/113] tw-w-[30%] !tw-h-auto tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-md"
        :style="{ backgroundImage: `url(${btnAddInventory})` }"
      ></v-btn> -->
      <!-- <v-progress-linear
        color="#91F8FD"
        bg-color="#000"
        bg-opacity="0.6"
        model-value="100"
        rounded="0"
        class="foodbar !tw-h-[60%] disable-element"
      >
        <svg
          viewBox="0 0 80 40"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-h-full"
          ref="foodBarSvgRef"
        >
          <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="DynaPuff"
            :font-size="`${gameStore.setFontSizeBasedOnViewBox(
              foodBarSvgRef,
              50
            )}px`"
            font-weight="700"
            fill="#fff"
            stroke="#000000"
            stroke-width="3"
            paint-order="stroke fill"
            text-overflow="ellipsis"
            white-space="nowrap"
            overflow="hidden"
            width="100%"
          >
            ???
          </text>
        </svg>
      </v-progress-linear> -->

      <!-- <v-btn
        flat
        color="transparent"
        class="tw-aspect-[179/100] tw-w-[19%] !tw-h-auto tw-bg-cover tw-bg-bottom tw-bg-no-repeat tw-relative tw-rounded-[10%] disable-element"
        :style="{ backgroundImage: `url(${btnFeed})` }"
      ></v-btn> -->
    </div>
    <!-- </div> -->
  </div>
</template>

<style lang="postcss">
.foodbar {
  @apply tw-border-solid tw-border-[#FFFFFF];
  border-width: clamp(1.5px, 1.5vw, 2px);
  .v-progress-linear\_\_determinate {
    @apply tw-h-full;
    box-shadow: inset 0 0 0 clamp(1.5px, 1.5vw, 2px) #12a6d4;
  }
}

.slot-item {
  @apply tw-aspect-square tw-w-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center;
}

.highlight {
  filter: drop-shadow(0 0 10px #ffefbf);
}
</style>
