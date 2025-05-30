<script setup>
import {
  Application,
  Assets,
  Spritesheet,
  Sprite,
  Container,
  Text,
} from "pixi.js";
import {
  Reel,
  SymbolReel,
  ReelSpinner,
  JackpotSpinner,
  EnergyBottle,
  EnergyBar,
  Button,
  RewardParticle,
  AnimateText,
  AnimatedGIF,
} from "@/components/Game/classes/slot-machine.js";
import jsonSpritesJson from "@/assets/images/game/slot-machine/sprites.json";
import jsonSpritesPng from "@/assets/images/game/slot-machine/sprites.png";
import { useLocalStorage } from "@vueuse/core";
import { emitter } from "@plugins/mitt";

import spearker from "@images/game/speaker.png";

const refCanvas = ref();

const slotMachineLoaded = ref(false);
const audioContext = ref(null);
const gainNode = ref(null);
const mediaSource = ref(null);
const soundVolume = useLocalStorage("soundVolume", 100);

const props = defineProps({
  jackpot: {
    type: Number,
    default: 100000,
  },
  energy: {
    type: Number,
    default: 0,
  },
  claimEnergy: {
    type: Number,
    default: 0,
  },
  claimEnergyAt: {
    type: Date,
    default: new Date(),
  },
  jackpotRewards: {
    type: Array,
  },
  disabled: {
    type: Boolean,
  },
  volume: {
    type: Number,
    default: 100,
  },
});

let inDuty = false;
const currentX = ref(1);
const currentAutoX = ref(1);
const GIFEffects = ref([]);
const refRollFx = ref();
const refEnergyBottle = ref();
let container = null;
let energyBottle = null;
let jackpotSpinner = null;
let reelSpinner = null;
let betXButton = null;
let autoXButton = null;
let spinButton = null;
let energyBar = null;
let jackpotText = null;
let XParticle = null;
let FParticle = null;
let IParticle = null;
let JParticle = null;
let OParticle = null;
let animateText1 = null;
let animateText2 = null;
let gifEffects = null;

// watch(soundVolume, (newVolume) => {
//   if (gainNode.value) {
//     console.log("change volume", newVolume);
//     gainNode.value.gain.value = newVolume / 100;
//   }
// }, {
//   immediate: true,
// });

watch(
  () => props.claimEnergyAt,
  (v, vo) => {
    //drainEnergyBottle();
  }
);

watch(
  () => props.disabled,
  (v, vo) => {
    spinButton.setDisabled(v);
  }
);

watch(
  () => props.energy,
  (v) => {
    energyBar.setEnergy(v);
  }
);

watch(
  () => props.jackpot,
  (v) => {
    if (jackpotText != null) {
      jackpotText.text = v.toLocaleString("en-US") + "$";
    }
  },
  { immediate: true }
);

watch(
  () => props.jackpotRewards,
  (v) => {
    if (jackpotSpinner == null) return;
    jackpotSpinner.setJackpotRewards(v);
  },
  {
    deep: true,
  }
);

// watch(
//   () => props.volume,
//   (v) => {
//     setVolume(v);
//   }
// );

let _energy = 0;
let isRolling = false;
let _drainingEnergy = false;

const drainEnergyBottle = async () => {
  if (refEnergyBottle.value == null) return;
  _drainingEnergy = true;
  energyBottle.drainEnergy();
  await waitForSeconds(3);
  _drainingEnergy = false;
};

const updateEnergyBottle = () => {
  if (_drainingEnergy) return;

  let now = new Date();
  let minutes = Math.floor((now - props.claimEnergyAt) / 60000);
  let seconds = Math.floor((now - props.claimEnergyAt) / 1000) % 60;
  if (minutes > 50) {
    minutes = 50;
    refEnergyBottle.value.setTime();
  } else {
    refEnergyBottle.value.setTime(60 - seconds);
  }
  // _energy = minutes;
  // slotMachine.value.LabelClaimEnergy.string = `${
  //   minutes < 10 ? "0" : ""
  // }${minutes}/50`;
  refEnergyBottle.value.setEnergy(minutes);
};

const XS = [1, 2, 3, 5, 10];
const onButtonBetXClick = () => {
  let id = XS.indexOf(currentX.value);
  id++;
  if (id >= XS.length) id = 0;
  currentX.value = XS[id];
  betXButton.setText(`BET X${currentX.value}`);
};

const autos = [1, 5];
const onButtonAutoXClick = () => {
  let id = autos.indexOf(currentAutoX.value);
  id++;
  if (id >= autos.length) id = 0;
  currentAutoX.value = autos[id];
  autoXButton.setText(`AUTO X${currentAutoX.value}`);
};

const onButtonClaimEnergyClick = async () => {
  emit("claimEnergyClick");
  drainEnergyBottle();
};

const onButtonCloseClick = () => {
  setJackpotVisible(false);
  setButtonCloseVisible(false);
};

const onButtonRoolClickAuto = async () => {
  if (props.disabled) return;
  if (spins > 0) {
    spins--;
    emit("rollClick", { betX: currentX.value });
  }
};

const onButtonRoolClick = () => {
  if (props.disabled) return;
  spins = currentAutoX.value;
  emit("rollClick", { betX: currentX.value });
};

let playScripts = [];
let currentStep = 0;
let currentScript = null;
let turns = 0;
let spins = 0;

const roll = async (scripts) => {
  currentStep = 0;
  playScripts = scripts;
  turns = 1;
  spinButton.setDisabled(true);
  await rollScriptStep(0);
  isRolling = true;
  return;
};

const rollScriptStep = async (step) => {
  if (step > playScripts.length - 1) {
    spinButton.setDisabled(false);
    emit("allScriptCompleted");
    if (spins > 1) {
      await waitForSeconds(0.25);
      onButtonRoolClickAuto();
    }
    return;
  }
  currentStep = step;
  currentScript = playScripts[currentStep];
  if (currentScript.type == "slotMachine") {
    jackpotSpinner.close();
    reelSpinner.roll(currentScript.reelSymbols);
    // refRollFx.value.currentTime = 0;
    // refRollFx.value.play();
    emitter.emit("play:rollFx");
    if (turns > 1) {
      animateText1.show(`bonus turn ${turns}`);
    }
    turns--;
    await waitForSeconds(1.75);
    for (const r of currentScript.rewards) {
      if (r.type == "SPIN") {
        turns += r.value;
        animateText2.show(`+${r.value} turns`);
      }
    }
    emit("scriptCompleted", currentScript);
  } else {
    jackpotSpinner.open();
    rollJackpot(currentScript.rewards[0].description);
    await waitForSeconds(2);
    isRolling = false;
    emit("scriptCompleted", currentScript);
  }
};

const rollNextStep = async () => {
  await rollScriptStep(currentStep + 1);
};

// const setJackpotPrizes = (prizes) => {
//   jackpotSpinner.setJackpotRewards(prizes);
// };

const rollJackpot = (prize) => {
  jackpotSpinner.roll(prize);
};

const setVolume = (v) => {
  console.log("change volume", v);
  soundVolume.value = v;
};

const waitForSeconds = async (s) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, s * 1000);
  });
};

const showGoldEffect = () => {
  OParticle.play();
};

const showTokenEffect = () => {
  XParticle.play();
};

const showFoodEffect = () => {
  FParticle.play();
};

const showGIFEffect = async (id) => {
  const ge = gifEffects[id];
  container.addChild(ge);
  await gifEffects[id].play();
  console.log("on done gif effect");
  container.removeChild(gifEffects[id]);
  return;
};

const showValue = (v) => {
  animateText2.show(v);
};

onMounted(async () => {
  await initSlotMachine();
});

import gif1 from "@/assets/images/game/reward-effects/1.BIGWIN.gif";
import gif2 from "@/assets/images/game/reward-effects/2.MEGA_WIN.gif";
import gif3 from "@/assets/images/game/reward-effects/3.GIGA_WIN.gif";
import gif4 from "@/assets/images/game/reward-effects/4.FABULOUS_WIN.gif";
import gif5 from "@/assets/images/game/reward-effects/5.LEGENDARY.gif";
import gif6 from "@/assets/images/game/reward-effects/6 JACKPOT.gif";

const initSlotMachine = async () => {
  const app = new Application();
  await app.init({
    width: 1080,
    height: 1920,
    backgroundColor: 0,
    backgroundAlpha: 0,
    resolution: 2,
    autoResize: true,
    transparent: true,
    canvas: refCanvas.value,
    resizeTo: refCanvas.value,
    antialias: false,
  });

  const texture = await Assets.load(jsonSpritesPng);
  const sheet = new Spritesheet(texture, jsonSpritesJson);
  await sheet.parse();

  container = new Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height;
  container.pivot.x = 0;
  container.pivot.y = 0;
  container.scale.set(app.screen.width / 1080);
  container.visible = false;
  app.stage.addChild(container);

  const castle = new Sprite(sheet.textures["castle.png"]);
  castle.anchor.set(0.52, 1);
  castle.x = 0;
  castle.y = -360;
  container.addChild(castle);

  const jackpot = new Sprite(sheet.textures["JackPot.png"]);
  jackpot.anchor.set(0.5, 1);
  jackpot.x = 0;
  jackpot.y = -1150;
  container.addChild(jackpot);

  jackpotText = new Text({
    text: "JACKPOT",
    style: {
      fontFamily: "Arbutus",
      fontSize: 64,
      fill: "#ffffff",
      align: "center",
      dropShadow: {
        color: "#000000",
        blur: 0,
        angle: Math.PI * 0.6,
        distance: 4,
      },
    },
  });
  jackpotText.anchor.set(0.5, 1);
  jackpotText.x = 0;
  jackpotText.y = -1100;
  container.addChild(jackpotText);

  const cloudBottom = new Sprite(sheet.textures["cloud-bottom.png"]);
  cloudBottom.anchor.set(0.5, 1);
  cloudBottom.x = 0;
  cloudBottom.y = 0;
  container.addChild(cloudBottom);

  const kapy = new Sprite(sheet.textures["char.png"]);
  kapy.anchor.set(0.5, 1);
  kapy.x = -380;
  kapy.y = -50;
  container.addChild(kapy);

  reelSpinner = new ReelSpinner({ sheet });
  reelSpinner.x = 308;
  reelSpinner.y = -625;
  reelSpinner.zIndex = -1;
  container.addChild(reelSpinner);

  jackpotSpinner = new JackpotSpinner({ sheet, app });
  jackpotSpinner.x = 308;
  jackpotSpinner.y = -625;
  jackpotSpinner.zIndex = 5;
  jackpotSpinner.closeButton.on("pointerup", () => {
    jackpotSpinner.close();
  });
  container.addChild(jackpotSpinner);

  energyBar = new EnergyBar({ sheet, app });
  energyBar.x = -262;
  energyBar.y = -536;
  energyBar.zIndex = 0;
  container.addChild(energyBar);

  energyBottle = refEnergyBottle.value = new EnergyBottle({
    sheet,
    app,
    bar: energyBar,
  });
  energyBottle.x = 350;
  energyBottle.y = -480;
  energyBottle.zIndex = 3;
  energyBottle.bottleSprite.interactive = true;
  energyBottle.bottleSprite.buttonMode = true;
  energyBottle.bottleSprite.on("pointerup", () => {
    onButtonClaimEnergyClick();
  });
  container.addChild(energyBottle);

  betXButton = new Button({
    sheet,
    normalSprite: "Button X.png",
    text: "BET X1",
  });
  betXButton.x = -130;
  betXButton.y = -450;
  betXButton.zIndex = 2;
  betXButton.on("pointerup", () => {
    onButtonBetXClick();
  });
  container.addChild(betXButton);

  autoXButton = new Button({
    sheet,
    normalSprite: "Button X.png",
    text: "AUTO X1",
  });
  autoXButton.x = 110;
  autoXButton.y = -450;
  autoXButton.zIndex = 2;
  autoXButton.on("pointerup", () => {
    onButtonAutoXClick();
  });
  container.addChild(autoXButton);

  spinButton = new Button({
    sheet,
    normalSprite: "button-spin-normal.png",
    pressedSprite: "button-spin-pressed.png",
    disabledSprite: "button-spin-pressed.png",
    text: "",
  });
  spinButton.x = 0;
  spinButton.y = -240;
  spinButton.zIndex = 2;
  spinButton.interactable = true;
  spinButton.buttonMode = true;
  spinButton.on("pointerup", () => {
    onButtonRoolClick();
  });
  container.addChild(spinButton);

  XParticle = new RewardParticle({ sheet, rewardSprite: "coin.png", app });
  XParticle.x = 0;
  XParticle.y = -840;
  XParticle.zIndex = 2;
  container.addChild(XParticle);

  FParticle = new RewardParticle({ sheet, rewardSprite: "food.png", app });
  FParticle.x = 0;
  FParticle.y = -840;
  FParticle.zIndex = 3.5;
  container.addChild(FParticle);

  IParticle = new RewardParticle({ sheet, rewardSprite: "sword.png", app });
  IParticle.x = 0;
  IParticle.y = -840;
  IParticle.zIndex = 3.5;
  container.addChild(IParticle);

  JParticle = new RewardParticle({ sheet, rewardSprite: "kapy.png", app });
  JParticle.x = 0;
  JParticle.y = -840;
  JParticle.zIndex = 3.5;
  container.addChild(JParticle);

  OParticle = new RewardParticle({ sheet, rewardSprite: "treasure.png", app });
  OParticle.x = 0;
  OParticle.y = -840;
  OParticle.zIndex = 3.5;
  container.addChild(OParticle);

  animateText1 = new AnimateText({
    text: "asdfasdfasdf",
    style: {
      fontFamily: "DynaPuff",
      fontSize: 128,
      fill: "#ffffff",
      align: "center",
      stroke: {
        color: "#000000",
        width: 8,
      },
    },
  });
  animateText1.x = 0;
  animateText1.y = -1500;
  animateText1.zIndex = 4;
  container.addChild(animateText1);

  animateText2 = new AnimateText({
    text: "asdfasdfasdf",
    style: {
      fontFamily: "DynaPuff",
      fontSize: 128,
      fill: "#ffff00",
      align: "center",
      stroke: {
        color: "#000000",
        width: 8,
      },
    },
  });
  animateText2.x = 0;
  animateText2.y = -750;
  animateText2.zIndex = 4;
  container.addChild(animateText2);

  gifEffects = [];
  for(let gif of [gif1, gif2, gif3, gif4, gif5, gif6]) {
    const ge = await AnimatedGIF.load(gif);
    ge.x = 0;
    ge.y = -300;
    ge.width = 1024;
    ge.height = 1024;
    ge.zIndex = 3;
    gifEffects.push(ge);
  } 

  spinButton.on("click", onButtonRoolClick);
  jackpotText.text = props.jackpot.toLocaleString("en-US") + "$";
  energyBar.setEnergy(props.energy);
  betXButton.on("click", onButtonBetXClick);
  betXButton.setText("BET X1");
  jackpotSpinner.setJackpotRewards(props.jackpotRewards);
  setInterval(updateEnergyBottle, 1000);
  updateEnergyBottle();
  emit("loaded");

  container.visible = true;
  slotMachineLoaded.value = true;
};

onBeforeUnmount(() => {
  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
    mediaSource.value = null;
    gainNode.value = null;
  }
});

onUnmounted(async () => {
  //slotMachineUrl.value = "";
});

const toggleSound = () => {
  console.log(soundVolume.value);
  setVolume(soundVolume.value === 0 ? 100 : 0);
};

// watch(soundVolume, (newVolume) => {
//   if (refRollFx.value) {
//     refRollFx.value.volume = newVolume / 100;
//   }
// });

const emit = defineEmits([
  "rollClick",
  "scriptCompleted",
  "allScriptCompleted",
  "claimEnergyClick",
  "loaded",
]);
defineExpose({
  roll,
  rollNextStep,
  rollJackpot,
  setVolume,
  showGoldEffect,
  showTokenEffect,
  showFoodEffect,
  showValue,
  showGIFEffect,
  waitForSeconds,
});
</script>

<template>
  <div
    class="tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center"
    v-if="!slotMachineLoaded"
  >
    Booting slot machine...
  </div>

  <canvas class="tw-w-full tw-h-full tw-border-none" ref="refCanvas" />

  <audio ref="refRollFx">
    <source src="@/assets/sounds/roll.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>

  <v-btn
    class="!tw-w-[31px] !tw-h-[24.5px] tw-border-none tw-absolute tw-right-3 tw-top-14 tw-z-10 tw-bg-contain tw-bg-center tw-bg-no-repeat"
    :class="{
      'tw-opacity-70': soundVolume === 0,
      'tw-opacity-100': soundVolume > 0,
    }"
    @click="toggleSound()"
    color="transparent"
    :style="{ backgroundImage: `url(${spearker})` }"
    flat
    :ripple="false"
  >
  </v-btn>
</template>
