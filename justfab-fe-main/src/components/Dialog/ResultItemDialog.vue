<script setup>
import bgPopup from "@images/game/bg-popup.png";
import energy from "@images/game/energy.svg";
import gold from "@images/game/gold.png";
import btnClaim from "@images/game/btn-claim.svg";
import { emitter } from "@plugins/mitt";
import voucher from "@images/game/voucher.png";
import rarityMythic from "@images/game/rarity-mythic.png";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const gameStore = useGameStore();
const userStore = useUserStore();

const goldSvgRefs = ref({});
const energySvgRefs = ref({});
const voucherSvgRefs = ref({});

const fontSizeBase = computed(() => gameStore.baseFontSize);
const widthDialog = computed(() => `${props.width}px`);

const emit = defineEmits(["onConfirm", "onClose"]);

onMounted(() => {
  emitter.on("show-reward", (item) => {
    gameStore.openResultDialog(item);
  });
});

const setGoldRef = (el, id) => {
  if (el) goldSvgRefs.value[id] = el;
};

const setEnergyRef = (el, id) => {
  if (el) energySvgRefs.value[id] = el;
};

const setVoucherRef = (el, id) => {
  if (el) voucherSvgRefs.value[id] = el;
};

const closeDialog = (id) => {
  emit("onClose");
  gameStore.closeDialog(id);
};

const submitClaim = async (item, rewardsType = "slot-machine") => {
  try {
    if (rewardsType === "no-claim") {
      if (item.type === REWARD_TYPES.GOLD) {
        userStore.userData.gold += item.value;
      }

      if (rewardsType === "REFERRAL") {
        emitter.emit("onClaimeReferralSuccess", "");
      }
    } else if (rewardsType !== "slot-machine") {
      await claimReward(item._id);

      if (item.type === REWARD_TYPES.GOLD) {
        userStore.userData.gold += item.value;
      }

      if (rewardsType === "daily") {
        emitter.emit("onClaimeDailySuccess", "");
      } else if (rewardsType === "REFERRAL") {
        emitter.emit("onClaimeReferralSuccess", "");
      }
    }

    emit("onConfirm");

    closeDialog(item._id);
  } catch (error) {
    console.error("submitClaim -> error", error);
    closeDialog(item._id);
  }
};

defineExpose({
  openDialog: gameStore.openResultDialog,
  closeDialog,
});
</script>

<template>
  <template
    v-for="dialog in gameStore.arrayResultItemDialogRef"
    :key="dialog.id"
  >
    <v-dialog
      v-model="dialog.open"
      class=""
      content-class="popup-invite"
      max-width="731"
      :width="widthDialog"
      persistent
    >
      <v-card
        class="!tw-rounded-2xl tw-px-4 tw-py-2 !tw-shadow-none !tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[731/705]"
        :style="{ backgroundImage: `url(${bgPopup})` }"
        color="transparent"
        flat
      >
        <v-card-text class="tw-text-center !tw-p-[3%]">
          <div
            class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-full"
          >
            <div
              class="tw-w-[45%] tw-relative"
              v-if="dialog.item.type === REWARD_TYPES.GOLD"
            >
              <div class="tw-w-full">
                <v-img :src="gold" width="100%" class="" />
              </div>
              <div class="tw-w-full tw-h-auto tw-absolute tw-top-[85%]">
                <svg
                  viewBox="0 0 130 40"
                  xmlns="http://www.w3.org/2000/svg"
                  class="tw-w-full tw-h-full"
                  :ref="(el) => setGoldRef(el, dialog.id)"
                >
                  <text
                    x="50%"
                    y="50%"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    font-family="DynaPuff"
                    :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                      goldSvgRefs[dialog.id],
                      65
                    )}px`"
                    font-weight="700"
                    fill="#fff"
                    stroke="#7E2009"
                    stroke-width="6"
                    paint-order="stroke fill"
                  >
                    {{ dialog.item.value }}
                  </text>
                </svg>
              </div>
            </div>

            <div
              class="tw-w-[45%]"
              v-else-if="dialog.item.type === REWARD_TYPES.ENERGY"
            >
              <div class="tw-aspect-[349/194] tw-w-full tw-mb-[10%]">
                <v-img :src="energy" width="100%" class="" />
              </div>
              <div class="tw-w-full tw-h-auto">
                <svg
                  viewBox="0 0 130 30"
                  xmlns="http://www.w3.org/2000/svg"
                  class="tw-w-full tw-h-full"
                  :ref="(el) => setEnergyRef(el, dialog.id)"
                >
                  <text
                    x="50%"
                    y="50%"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    font-family="DynaPuff"
                    :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                      energySvgRefs[dialog.id],
                      75
                    )}px`"
                    font-weight="700"
                    fill="#fff"
                    stroke="#000"
                    stroke-width="4"
                    paint-order="stroke fill"
                  >
                    {{ dialog.item.value }}
                  </text>
                </svg>
              </div>
            </div>

            <div
              class="tw-aspect-[178/178] tw-w-[45%] tw-mb-[3%] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
              :style="{ backgroundImage: `url(${rarityMythic})` }"
              v-else-if="dialog.item.type === REWARD_TYPES.POOL_PERCENTAGE"
            >
              <v-img
                :src="voucher"
                class="!tw-max-w-[75%] tw-w-full tw-h-auto"
              />

              <svg
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                class="tw-w-full tw-h-full tw-absolute"
                :ref="(el) => setVoucherRef(el, dialog.id)"
              >
                <text
                  x="85%"
                  y="75%"
                  dominant-baseline="middle"
                  text-anchor="end"
                  font-family="DynaPuff"
                  :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                    voucherSvgRefs[dialog.id],
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
                  {{ dialog.item.value }}%
                </text>
              </svg>
            </div>

            <div
              v-if="dialog.item.item?.item?.photoUrl"
              class="tw-aspect-[178/178] tw-w-[45%] tw-mb-[3%] tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-flex tw-justify-center tw-items-center"
              :style="{
                backgroundImage: `url(${
                  ITEM_RARITIES[dialog.item.item?.rarity].background
                })`,
              }"
            >
              <v-img
                :src="srcAsset(dialog.item.item?.item?.photoUrl)"
                class="!tw-max-w-[75%] tw-w-full tw-h-auto"
              />
            </div>

            <div
              class="tw-font-[DynaPuff] tw-mb-[10%]"
              :style="{
                fontSize: `${fontSizeBase * 1.2}px`,
              }"
            >
              {{ dialog.item.item?.item?.name }}
            </div>

            <v-btn
              flat
              color="transparent"
              class="tw-aspect-[352/113] tw-w-[51.23%] !tw-h-auto tw-bg-contain tw-bg-center tw-bg-no-repeat tw-relative tw-rounded-[10%] tw-overflow-hidden"
              :style="{ backgroundImage: `url(${btnClaim})` }"
              @click.stop="submitClaim(dialog.item, dialog.rewardsType)"
            ></v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
</template>
