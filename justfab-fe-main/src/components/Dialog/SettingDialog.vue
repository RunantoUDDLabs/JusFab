<script setup>
import bgSetting from "@images/game/bg-setting.png";
import iconCloseBtn from "@images/game/icon-close-1.png";
import buttonSlide from "@images/game/button-slide.png";
import { emitter } from "@plugins/mitt";

const props = defineProps({
  width: {
    type: Number,
    default: 0,
  },
});

const gameStore = useGameStore();

const settingGameDialog = ref(false);
const soundVolume = useLocalStorage("soundVolume", 50);
const sfxVolume = useLocalStorage("sfxVolume", 50);
const labelSoundSvgRef = ref(null);
const labelSfxSvgRef = ref(null);
const soundVolumeSvgRef = ref(null);
const sfxVolumeSvgRef = ref(null);

const emit = defineEmits(["onConfirm", "onClose"]);

onMounted(() => {});

const openDialog = () => {
  settingGameDialog.value = true;
};

const closeDialog = () => {
  settingGameDialog.value = false;
};

const changeVolumn = (type) => {
  if (type === "sound") {
    emitter.emit("changeVolume", { type: "sound", value: soundVolume.value });
  } else {
    emitter.emit("changeVolume", { type: "sfx", value: sfxVolume.value });
  }
};

defineExpose({ openDialog, settingGameDialog, closeDialog });
</script>

<template>
  <v-dialog
    v-model="settingGameDialog"
    class=""
    content-class="popup-setting"
    max-width="731"
    :width="width"
    persistent
  >
    <v-card
      class="!tw-rounded-2xl tw-px-4 tw-py-2 !tw-shadow-none !tw-bg-cover tw-bg-center tw-bg-no-repeat tw-aspect-[731/705]"
      :style="{ backgroundImage: `url(${bgSetting})` }"
      color="transparent"
      flat
    >
      <IconBtn
        flat
        color="transparent"
        variant="elevated"
        size="small"
        class="btn-close-setting"
        @click="closeDialog"
      >
        <v-img :src="iconCloseBtn" width="44" class="!tw-max-w-[50%]"></v-img>
      </IconBtn>

      <v-card-text class="tw-text-center !tw-p-[3%]">
        <div class="!tw-p-[5%] tw-h-full tw-flex tw-flex-col tw-justify-center">
          <div
            class="volume-box"
            :style="`--button-slide: url(${buttonSlide})`"
          >
            <div class="tw-col-span-1 tw-flex tw-items-center">
              <svg
                viewBox="0 0 100 35"
                xmlns="http://www.w3.org/2000/svg"
                class="tw-w-full tw-h-full"
                ref="labelSoundSvgRef"
              >
                <text
                  x="1%"
                  y="50%"
                  dominant-baseline="middle"
                  text-anchor="start"
                  font-family="DynaPuff"
                  :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                    labelSoundSvgRef,
                    38
                  )}px`"
                  font-weight="900"
                  fill="#fff"
                  stroke="#000000"
                  stroke-width="2"
                  paint-order="stroke fill"
                  text-overflow="ellipsis"
                  white-space="nowrap"
                  overflow="hidden"
                  width="100%"
                >
                  Music Volume
                </text>
              </svg>
            </div>
            <div class="tw-col-span-2">
              <v-slider
                v-model="soundVolume"
                color="transparent"
                thumb-size="20%"
                :thumb-label="false"
                track-color="#FFEFC0"
                track-size="10%"
                track-fill-color="#00D8FF"
                class="volumn-slider"
                :step="1"
                @update:model-value="changeVolumn('sound')"
              >
                <template v-slot:append>
                  <svg
                    viewBox="0 0 100 35"
                    xmlns="http://www.w3.org/2000/svg"
                    class="!tw-w-7 tw-h-6"
                    ref="soundVolumeSvgRef"
                  >
                    <text
                      x="2%"
                      y="50%"
                      dominant-baseline="middle"
                      text-anchor="start"
                      font-family="DynaPuff"
                      :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                        soundVolumeSvgRef,
                        140
                      )}px`"
                      font-weight="700"
                      fill="#fff"
                      stroke="#000000"
                      stroke-width="6"
                      paint-order="stroke fill"
                      text-overflow="ellipsis"
                      white-space="nowrap"
                      overflow="hidden"
                      width="100%"
                    >
                      {{ soundVolume }}
                    </text>
                  </svg>
                </template>
              </v-slider>
            </div>

            <div class="tw-col-span-1 tw-flex tw-items-center">
              <svg
                viewBox="0 0 100 35"
                xmlns="http://www.w3.org/2000/svg"
                class="tw-w-full tw-h-full"
                ref="labelSfxSvgRef"
              >
                <text
                  x="1%"
                  y="50%"
                  dominant-baseline="middle"
                  text-anchor="start"
                  font-family="DynaPuff"
                  :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                    labelSfxSvgRef,
                    38
                  )}px`"
                  font-weight="900"
                  fill="#fff"
                  stroke="#000000"
                  stroke-width="2"
                  paint-order="stroke fill"
                  text-overflow="ellipsis"
                  white-space="nowrap"
                  overflow="hidden"
                  width="100%"
                >
                  SFX Volume
                </text>
              </svg>
            </div>
            <div class="tw-col-span-2">
              <v-slider
                v-model="sfxVolume"
                color="transparent"
                thumb-size="20%"
                :thumb-label="false"
                track-color="#FFEFC0"
                track-size="10%"
                track-fill-color="#00D8FF"
                class="volumn-slider"
                :step="1"
                @update:model-value="changeVolumn('sfx')"
              >
                <template v-slot:append>
                  <svg
                    viewBox="0 0 100 35"
                    xmlns="http://www.w3.org/2000/svg"
                    class="!tw-w-7 tw-h-6"
                    ref="sfxVolumeSvgRef"
                  >
                    <text
                      x="2%"
                      y="50%"
                      dominant-baseline="middle"
                      text-anchor="start"
                      font-family="DynaPuff"
                      :font-size="`${gameStore.setFontSizeBasedOnViewBox(
                        sfxVolumeSvgRef,
                        140
                      )}px`"
                      font-weight="700"
                      fill="#fff"
                      stroke="#000000"
                      stroke-width="6"
                      paint-order="stroke fill"
                      text-overflow="ellipsis"
                      white-space="nowrap"
                      overflow="hidden"
                      width="100%"
                    >
                      {{ sfxVolume }}
                    </text>
                  </svg>
                </template>
              </v-slider>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="postcss">
.volumn-slider {
  @apply !tw-mr-0;
  .v-slider-track {
    @apply tw-rounded-full;
    box-shadow: inset 0 clamp(1px, 0.1vw, 4px) clamp(1px, 0.1vw, 4px) 0
        rgba(0, 0, 0, 0.25),
      0 clamp(1px, 0.1vw, 4px) clamp(1px, 0.1vw, 4px) 0 rgba(0, 0, 0, 0.25);
  }
  .v-slider-thumb\_\_surface {
    @apply tw-rounded-none !tw-shadow-none;
    background-image: var(--button-slide);
    background-size: cover;
  }
}

.volume-box {
  @apply !tw-bg-[#FFEFC0] tw-grid tw-grid-cols-3  tw-items-center tw-p-[5%] tw-rounded-[1rem];

  box-shadow: inset 0 clamp(1px, 0.1vw, 4px) clamp(1px, 0.1vw, 4px) 0
      rgba(0, 0, 0, 0.25),
    0 clamp(1px, 0.1vw, 4px) clamp(1px, 0.1vw, 4px) 0 rgba(0, 0, 0, 0.25);
}

.btn-close-setting {
  @apply tw-absolute tw-top-[7%] tw-right-[7%] tw-z-[1] tw-bg-no-repeat tw-bg-center;
  /* background-size: 50%; */
}
</style>
