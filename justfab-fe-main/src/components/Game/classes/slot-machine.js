import { all } from "axios";
import { gsap } from "gsap";
import { Application, Assets, Spritesheet, Sprite, Container, Text, Graphics, ParticleContainer, Particle } from "pixi.js";
import { GifSource, GifSprite } from "pixi.js/gif";
import { set } from "vue-demi";

class Reel extends Container {
    constructor({height = 200}) {
      super();
      this.x = 0;
      this.y = 0;
      this.pivot.x = 0;
      this.pivot.y = 0;
      this.scale.set(1);
      this.reelHeight = height;
      this.degree = 0;
      this.symbols = [];
    }

    addSymbol(o) {
      this.addChild(o);
      this.symbols.push(o);
      this.setDegree(this.degree);
    }

    clearAllSymbols( ) {
      for (let i = 0; i < this.symbols.length; i++) {
        const symbol = this.symbols[i];
        this.removeChild(symbol);
      }
      this.symbols = [];
      this.setDegree(this.degree);
    }

    setDegree(degree) {
      this.degree = degree;
      const degreePerSymbol = 360.0 / this.symbols.length;
      
      for (let i = 0; i < this.symbols.length; i++) {
        const symbol = this.symbols[i];
        const symbolDegree = degree + i * degreePerSymbol;
        const radians = (symbolDegree * Math.PI) / 180;
        symbol.y = Math.sin(radians) * this.reelHeight / 2;
        const scale = Math.cos(radians);
        symbol.scale.set(1, scale < 0 ? 0: 1);
        symbol.zIndex = scale;
      }
    }

    rollToIndex(index, delay = 0, duration = 1) {
      this._currentDegree = this.degree;
      gsap.to(this, {
        duration: duration,
        delay: delay,
        _currentDegree: 360 - (index * (360 / this.symbols.length)) + 360 * 10,
        onUpdate: () => {
          this.setDegree(this._currentDegree);
        },
        onComplete: () => {
          this.setDegree(this.degree % 360);
        },
    });
    } 
}

class SymbolReel extends Reel {
  constructor({sheet, symbols, height = 200}) {
    super({ height });
    this.symbols = [];  
    for (let i = 0; i < symbols.length; i++) {
      const symbol = new Sprite(sheet.textures[symbols[i]]);
      symbol.anchor.set(0.5, 0.5);
      symbol.x = 0;
      this.addSymbol(symbol);
    }
    this.setDegree(0);
  }
}

class ReelSpinner extends Container {
  constructor({sheet}) {
    super();
    this.pivot.x = 308;
    this.pivot.y = 200;
    this.zIndex = -1;
  
    const reelBackground = new Sprite(sheet.textures["machine-background.png"]);
    reelBackground.anchor.set(0.5, 0.5);
    reelBackground.x = 0;
    reelBackground.y = 0;
    this.addChild(reelBackground);
  
    const reelConfig = {
    sheet: sheet,
    symbols: [    
      "kapy.png", //X
      "food.png", //O
      "treasure.png", //F
      "sword.png", //I
      "coin.png", //J
      "kapy.png",
      "food.png",
      "treasure.png",
      "sword.png",
      "coin.png"
    ],
    height: 550}
    this.reelCharacters = ["J", "F", "X", "I", "O"];
    this.reels = [new SymbolReel(reelConfig), new SymbolReel(reelConfig), new SymbolReel(reelConfig), new SymbolReel(reelConfig)];
    this.addChild(this.reels[0]);
    this.addChild(this.reels[1]);
    this.addChild(this.reels[2]);
    this.addChild(this.reels[3]);
    this.reels[0].x = -235;
    this.reels[1].x = -80;
    this.reels[2].x = 80;
    this.reels[3].x = 235;  
    this.reels[0].setDegree(0);
    this.reels[1].setDegree(0);
    this.reels[2].setDegree(0);
    this.reels[3].setDegree(0);
  }

  roll(characters) {
    const indexes = characters.map((character) => this.reelCharacters.indexOf(character));
    this.reels[0].rollToIndex(indexes[0]);
    this.reels[1].rollToIndex(indexes[1], 0.25);
    this.reels[2].rollToIndex(indexes[2], 0.5);
    this.reels[3].rollToIndex(indexes[3], 0.75);
  }
}

class JackpotSpinner extends Container {
  constructor({sheet, app}) {
    super();
    this.pivot.x = 308;
    this.pivot.y = 200;
    this.zIndex = -1;

    const overlay = new Graphics();
    overlay.rect(-10000, -10000, 20000, 20000);
    overlay.fill({color: 0x000000, alpha: 0.5});
    overlay.x = 0;
    overlay.y = 0;
    this.addChild(overlay);

    const reelBackground = new Sprite(sheet.textures["jackpot-background.png"]);
    reelBackground.anchor.set(0.5, 0.5);
    reelBackground.x = 0;
    reelBackground.y = 0;
    this.addChild(reelBackground);

    const reelBackground2 = new Sprite(sheet.textures["jackpot-machine.png"]);
    reelBackground2.anchor.set(0.5, 0.5);
    reelBackground2.x = 0;
    reelBackground2.y = -125;
    reelBackground2.zIndex = 1;
    this.addChild(reelBackground2);

    this.reel = new Reel({height: 300});
    this.addChild(this.reel);

    this.closeButton = new Sprite(sheet.textures["close-jackpot.png"]);
    this.closeButton.anchor.set(0.5, 0.5);
    this.closeButton.x = 0;
    this.closeButton.y = 320;
    this.closeButton.interactive = true;
    this.closeButton.buttonMode = true;
    this.closeButton.on("pointerdown", () => {
      this.closeButton.scale.set(1.1, 1.1);
    });
    this.closeButton.on("pointerup", () => {
      this.closeButton.scale.set(1, 1);
    });
    this.addChild(this.closeButton);
    this.rewards = [];
    this.close();
  }

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  setJackpotRewards(rewards) {
    // rewards = [...rewards, ...rewards];
    this.reel.clearAllSymbols();
    this.rewards = rewards;
    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      const symbol = new Text({text: reward});
      symbol.anchor.set(0.5, 0.5);
      symbol.x = 0;
      symbol.y = 0;
      symbol.zIndex = 1;
      symbol.style = {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0x000000,
        align: "center",
      };
      this.reel.addSymbol(symbol);
    }

    this.reel.setDegree(0);
  }

  roll(reward) {
    const id = this.rewards.indexOf(reward);
    this.reel.rollToIndex(id);
  }
}

class EnergyBottle extends Container {
  constructor({sheet, bar}) {
    super();
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.zIndex = -1;
    this.sheet = sheet;
    this.bar = bar;
  
    this.bottleSprite = new Sprite(sheet.textures["bottle-25.png"])
    this.bottleSprite.anchor.set(0.5, 0);
    this.bottleSprite.x = 0;
    this.bottleSprite.y = 0;

    this.addChild(this.bottleSprite);

    this.bottleTextures = 
    [
      sheet.textures["bottle-25.png"],
      sheet.textures["bottle-50.png"],
      sheet.textures["bottle-75.png"],
      sheet.textures["bottle-100.png"],
    ];
  
    this.energySprite = new Sprite(sheet.textures["energy.png"]);
    this.energySprite.anchor.set(0.5, 0.5);
    this.energySprite.x = -40;
    this.energySprite.y = 210;
    this.energySprite.scale.set(1.2, 1.2);
    this.addChild(this.energySprite);

    this.text = new Text({text: "50/50", 
      style: {
        fontFamily: "DynaPuff", 
        fontWeight:'bold', 
        stroke: {
          color: '#000000',
          width: 6,
          join: 'round'
        }, 
        fontSize: 38, 
        fill: 0xFFFFFF, 
        align: "center"}});
    this.text.anchor.set(1, 0.5);
    this.text.x = 104;
    this.text.y = 204;
    this.addChild(this.text);

    this.textTime = new Text({text: "00:00", 
      style: {
        fontFamily: "DynaPuff", 
        fontWeight:'normal', 
        fontSize: 28, 
        fill: 0x000000, 
        align: "center"}});
    this.textTime.anchor.set(0.5, 0.5);
    this.textTime.x = 48;
    this.textTime.y = 241;
    this.addChild(this.textTime);

    this.flyEnergyContainer = new Container();
    this.flyEnergyContainer.pivot.x = 0;
    this.flyEnergyContainer.pivot.y = 0;
    this.flyEnergyContainer.zIndex = 1;
    this.flyEnergyContainer.x = 0;
    this.flyEnergyContainer.y = 0;
    this.addChild(this.flyEnergyContainer);

    this.energy = 0;
    this.setEnergy(50);
  }

  setEnergy(energy) {
    this.energy = energy;
    this.text.text = `${energy}/50`;
    let spriteId = Math.floor(energy * 4 / 50);
    if (spriteId > 3) {
      spriteId = 3;
    }
    this.bottleSprite.texture = this.bottleTextures[spriteId];
  }

  setTime(time) {
    if(!time) {
      this.textTime.text = "--:--";
      return;
    }
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this.textTime.text = formattedTime;
  }

  drainEnergy(position = { x: -350, y: -60}) {
    let globalPosition = { x: 0, y: 0 };
    globalPosition = this.toLocal(position, this, globalPosition, true);
    for (let i = 0; i < this.energy; i++) {
      const es = new Sprite(this.sheet.textures["energy.png"]);
      this.flyEnergyContainer.addChild(es);
      es.anchor.set(0.5, 0.5);
      es.scale.set(1.2, 1.2);
      es.x = -40;
      es.y = 210;
      
      gsap
      .to(es, {
        duration: 0.25,
        x: position.x + Math.random() * 20 - 10,
        y: position.y + Math.random() * 20 - 10,
        delay: i * 0.05,
        onUpdate: () => {
          
        },
        onComplete: () => {
          es.destroy();
          this.setEnergy(this.energy - 1);
          if(this.bar) this.bar.setEnergy(this.bar.energy + 1);
        },
      });
    }
  }
}

class EnergyBar extends Container {
  constructor({sheet}) {
    super();
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.zIndex = -1;
    this.sheet = sheet;

    this.energySprite = new Sprite(sheet.textures["Enegry.png"]);
    this.energySprite.anchor.set(0, 0.5);
    this.energySprite.x = 0;
    this.energySprite.y = 0;
    this.addChild(this.energySprite);

    this.energyMask = new Graphics();
    this.energyMask.rect(0, -this.energySprite.height / 2, this.energySprite.width, this.energySprite.height);
    this.energyMask.fill(0x000000);
    this.addChild(this.energyMask);

    this.energySprite.mask = this.energyMask;

    this.text = new Text({text: "100", 
      style: {
        fontFamily: "DynaPuff", 
        fontWeight:'bold', 
        stroke: {
          color: '#000000',
          width: 6,
          join: 'round'
        }, 
        fontSize: 38, 
        fill: 0xFFFFFF, 
        align: "center"}});
    this.text.anchor.set(0.5, 0.5);
    this.text.x = this.energySprite.width / 2;
    this.text.y = 0;

    this.addChild(this.text);

    this.energy = 0;
    this.setEnergy(50);
  }

  setEnergy(energy) {
    this.energy = energy;
    this.text.text = `${energy}`;
    const fill = energy / 100;
    this.energyMask.clear();
    this.energyMask.rect(0, -this.energySprite.height / 2, this.energySprite.width * (fill > 1 ? 1 : fill), this.energySprite.height);
    this.energyMask.fill();
  }
}

class Button extends Container {
  constructor({sheet, text, normalSprite, hoverSprite, disabledSprite}) {
    super();
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.zIndex = -1;
    this.sheet = sheet;

    this.normalSprite = new Sprite(sheet.textures[normalSprite]);
    this.normalSprite.anchor.set(0.5, 0.5);
    this.normalSprite.x = 0;
    this.normalSprite.y = 0;
    this.addChild(this.normalSprite);

    if(hoverSprite) {
      this.hoverSprite = new Sprite(sheet.textures[hoverSprite]);
      this.hoverSprite.anchor.set(0.5, 0.5);
      this.hoverSprite.x = 0;
      this.hoverSprite.y = 0;
      this.hoverSprite.visible = false;
      this.addChild(this.hoverSprite);
    }
    if(disabledSprite) {
      this.disabledSprite = new Sprite(sheet.textures[disabledSprite]);
      this.disabledSprite.anchor.set(0.5, 0.5);
      this.disabledSprite.x = 0;
      this.disabledSprite.y = 0;
      this.disabledSprite.visible = false;
      this.addChild(this.disabledSprite);
    }
    this.interactive = true;
    this.buttonMode = true;

    this.on("pointerover", () => {
      if(this.hoverSprite) {
        this.normalSprite.visible = false;
        this.hoverSprite.visible = true;
      }
    });
    this.on("pointerout", () => {
      if(this.hoverSprite) {
        this.normalSprite.visible = true;
        this.hoverSprite.visible = false;
      }
    });
    this.on("pointerdown", () => {
      this.normalSprite.scale.set(0.9, 0.9);
      if(this.hoverSprite) {
        this.hoverSprite.scale.set(0.9, 0.9);
      }
    });
    this.on("pointerup", () => {
      this.normalSprite.scale.set(1, 1);
      if(this.hoverSprite) {
        this.hoverSprite.scale.set(1, 1);
      }
    });

    this.text = new Text({text: text, 
      style: {
        fontFamily: "DynaPuff", 
        fontWeight:'bold', 
        stroke: {
          color: '#000000',
          width: 6,
          join: 'round'
        }, 
        fontSize: 38, 
        fill: 0xFFFFFF, 
        align: "center"}});
    this.text.anchor.set(0, 0.5);
    this.text.x = -96;
    this.text.y = 0;
    if(this.text.width > 144) {
      this.text.scale.set(144 / this.text.width, 1);
    }
    this.addChild(this.text);
  }

  setDisabled(disabled) {
    if(disabled) {
      this.interactive = false;
      this.buttonMode = false;
      this.normalSprite.visible = false;
      if(this.hoverSprite) {
        this.hoverSprite.visible = false;
      }
      if(this.disabledSprite) {
        this.disabledSprite.visible = true;
      }
    } else {
      this.interactive = true;
      this.buttonMode = true;
      this.normalSprite.visible = true;
      if(this.hoverSprite) {
        this.hoverSprite.visible = false;
      }
      if(this.disabledSprite) {
        this.disabledSprite.visible = false;
      }
    }
  }
  setText(text) {
    this.text.text = text;
  }
}

class RewardParticle extends ParticleContainer {
  constructor({sheet, rewardSprite, app}) {
    super(100,{
      alpha: true,
      scale: true
    });
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.zIndex = -1;
    this.sheet = sheet;

    this.particles = [];
    for (let i = 0; i < 40; i++) {
      const particle = new Particle({
        texture: sheet.textures[rewardSprite],
        x: 0, 
        y: 0,
        anchorX: 0.5, 
        anchorY: 0.5,
      });
      particle.x = 0;
      particle.y = 0;
      this.addParticle(particle);
      this.particles.push(particle);
    }

    app.ticker.add(this.updateParticles.bind(this));
    
    this.playing = false;
    this.config = {
      lifetime: 2,
      gravity: {x: 0, y: 980},
      startSpeed: {min: 600, max: 800}
    }
    this.visible = false;
  }

  play(){
    this.particleAttrs = [];
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const radian = - Math.random() * Math.PI * 2;
      const radius = Math.random() * 200 + 50;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;
      particle.x = x;
      particle.y = y;
      particle.alpha = 1;

      const speed = Math.random() * (this.config.startSpeed.max - this.config.startSpeed.min) + this.config.startSpeed.min;
      this.particleAttrs.push({
        lifetime: this.config.lifetime + 0,
        velocity: {x: Math.cos(radian) * speed, y: -Math.sin(radian) * speed},
      });
    }
    this.playing = true;
    this.visible = true;
  }

  updateParticles(time) {
    if (!this.playing) return;
    const deltaTime = time.deltaMS / 1000;
    let allExpired = true;
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const particleAttr = this.particleAttrs[i];
      
      particleAttr.lifetime -= deltaTime;
      if (particleAttr.lifetime <= 0) {
        particle.alpha = 0;
        continue;
      }
      allExpired = false;

      particleAttr.velocity.x -= this.config.gravity.x * deltaTime;
      particleAttr.velocity.y -= this.config.gravity.y * deltaTime;
      
      particle.x += particleAttr.velocity.x * deltaTime;
      particle.y -= particleAttr.velocity.y * deltaTime;

    }

    if (allExpired) {
      this.playing = false;
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        this.visible = false;
      }
    }
    this.update(); 
  }

}

class AnimateText extends Container {
  constructor({text, style}) {
    super();
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.zIndex = -1;

    this.text = new Text({text: text, style: style});
    this.text.anchor.set(0.5, 0.5);
    this.text.x = 0;
    this.text.y = 0;
    this.addChild(this.text);
    this.visible = false;

    this.tl = gsap.timeline({repeat: -1, repeatDelay: 0.5});
    this.tl.to(this.text, {
      duration: 0.5,
      x: 0,
      y: -100,
    });
    this.tl.to(this.text, {
      duration: 1,
      onComplete: () => {
        this.visible = false;
        this.text.y = 0;
      },
    });
  }

  show(text) {
    this.text.text = text;
    this.visible = true;
    this.text.x = 0;
    this.text.y = 0;
    this.tl.restart();
  }
}

class AnimatedGIF extends GifSprite {
  constructor({gifSource}) {
    super(gifSource);
    this.zIndex = 1.5;
    this.loop = false;
    this.anchor.set(0.5, 1);
    this.visible = false;
    this.play();
    this.onComplete = () => {
      console.log("GIF animation completed");
      this.visible = false;
    }
  }

  play() {
    this.visible = true;
    super.play();
    return new Promise((resolve) => {
      this.onComplete = resolve;
    });
  }

  stop() {
    super.stop();
    //this.visible = false;
  }
  
  static async load(gifUrl, options = {}) {
    const source = await Assets.load(gifUrl);
    const gif = new AnimatedGIF({...options, gifSource: source});
    return gif;
  }

  static fromBuffer(gif, options = {}) {
    const source = GifSource.from(gif);
    const ag = new AnimatedGIF({...options, gifSource: source});
    return ag;
  }
}
export { Reel, SymbolReel, ReelSpinner, JackpotSpinner, EnergyBottle, EnergyBar, Button, RewardParticle, AnimateText, AnimatedGIF };