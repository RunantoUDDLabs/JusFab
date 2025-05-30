const userEvents = require('../envents/user.event');
const SlotMachine = require('../models/slotMachine.model');
const EError = require('../utils/EError');
const logger = require('../utils/logger');
const { spinJackpot } = require('./jackpot.service');
const { applyPlayScriptsRewardsToUser } = require('./reward.service');
const { getUserById } = require('./user.service');

let cachedSlotMachine = null; // Cache slot machine config

/**
 * Initialize or update the slot machine configuration.
 * If the slot machine already exists, update it; otherwise, create it.
 * @param {Object} data - Slot machine configuration
 * @returns {Object} Slot machine document
 */
const initializeSlotMachine = async (data) => {
  const slotMachine = await SlotMachine.findOne();
  if (slotMachine) {
    // Update existing slot machine
    const updatedSlotMachine = await SlotMachine.findOneAndUpdate({}, data, { new: true });
    cachedSlotMachine = updatedSlotMachine;
    return updatedSlotMachine;
  }
  // Create a new slot machine
  const newSlotMachine = new SlotMachine(data);
  const savedSlotMachine = await newSlotMachine.save();
  cachedSlotMachine = savedSlotMachine;
  return savedSlotMachine;
};

/**
 * Get the single slot machine configuration.
 * If no slot machine exists, initialize a default one.
 * @returns {Object} Slot machine document
 */
const getSlotMachine = async () => {
  if (cachedSlotMachine) {
    return cachedSlotMachine;
  }

  let slotMachines = await SlotMachine.find();

  if (slotMachines.length === 0) {
    // No slot machine exists, create a default one
    // logger.log('No slot machine found. Creating a default one.');

    const symbols = [
      { "symbol": "X", "ratio": 30 },
      { "symbol": "O", "ratio": 15 },
      { "symbol": "F", "ratio": 25 },
      { "symbol": "I", "ratio": 10 },
      { "symbol": "J", "ratio": 10 }
    ];

    const defaultSlotMachine = new SlotMachine({
      name: 'Default Slot Machine',
      reels: [
        {
          "symbols": symbols
        },
        {
          "symbols": symbols
        },
        {
          "symbols": symbols
        },
        {
          "symbols": symbols
        }
      ],
      combinations: [
        // X
        { combination: ["X", "X"], reward: { type: "GOLD", value: 40 } },
        { combination: ["X", "X", "X"], reward: { type: "GOLD", value: 160 } },
        { combination: ["X", "X", "X", "X"], reward: { type: "GOLD", value: 2560 } },

        // O
        { combination: ["O", "O"], reward: { type: "GOLD", value: 160 } },
        { combination: ["O", "O", "O"], reward: { type: "GOLD", value: 640 } },
        { combination: ["O", "O", "O", "O"], reward: { type: "TOKEN", value: 10 } },

        // F
        { combination: ["F", "F"], reward: { type: "FOOD", value: 1 } },
        { combination: ["F", "F", "F"], reward: { type: "FOOD", value: 4 } },
        { combination: ["F", "F", "F", "F"], reward: { type: "FOOD", value: 64 } },

        // I
        { combination: ["I", "I"], reward: { type: "ITEM", item: { rarity: 'COMMON' } } },
        { combination: ["I", "I", "I"], reward: { type: "ITEM", item: { rarity: 'RARE' } } },
        { combination: ["I", "I", "I", "I"], reward: { type: "ITEM", item: { rarity: 'ULTRA_RARE' } } },

        // J
        { combination: ["J", "J"], reward: { type: "GOLD", value: 640 } },
        { combination: ["J", "J", "J"], reward: { type: "GOLD", value: 10240 } },
        { combination: ["J", "J", "J", "J"], reward: { type: "JACKPOT", value: 1 } },

        // COMBO
        { combination: ["X", "F", "F"], reward: { type: "SPIN", value: 2 } },
        { combination: ["X", "X", "F", "F"], reward: { type: "SPIN", value: 3 } },
        { combination: ["O", "I", "J"], reward: { type: "SPIN", value: 5 } },
        { combination: ["O", "J", "J"], reward: { type: "SPIN", value: 10 } },
        { combination: ["O", "O", "J", "J"], reward: { type: "SPIN", value: 20 } }
      ],
      isActive: true,
    });

    await defaultSlotMachine.save();
    slotMachines = [defaultSlotMachine];
  }

  cachedSlotMachine = slotMachines[0];
  return cachedSlotMachine;
};

const spinReel = (reel) => {
  const totalRatio = reel.symbols.reduce((sum, symbol) => sum + symbol.ratio, 0);
  const random = Math.random() * totalRatio;

  let cumulative = 0;
  for (const symbol of reel.symbols) {
    cumulative += symbol.ratio;
    if (random <= cumulative) {
      return symbol.symbol; // Return the selected symbol
    }
  }
};

const spinSlotMachine = (slotMachine) => {
  return slotMachine.reels.map((reel) => spinReel(reel)); // Spin each reel
};

/**
 * Check for winning combinations without overlapping rewards.
 * Prioritize longer or higher-priority combinations.
 * @param {Array} reelSymbols - The symbols generated from the spin
 * @param {Array} combinations - The list of possible combinations and rewards
 * @returns {Array} List of rewards
 */
const checkWinningCombinations = (reelSymbols, combinations) => {
  const symbolCounts = reelSymbols.reduce((counts, symbol) => {
    counts[symbol] = (counts[symbol] || 0) + 1;
    return counts;
  }, {});

  const rewards = [];

  // Sort combinations by descending priority (longer combinations or explicitly set priorities)
  const sortedCombinations = combinations.sort((a, b) => b.combination.length - a.combination.length);

  // Iterate through combinations and check if they can be satisfied
  for (const { combination, reward } of sortedCombinations) {
    const combinationCounts = combination.reduce((counts, symbol) => {
      counts[symbol] = (counts[symbol] || 0) + 1;
      return counts;
    }, {});
    // Check if the combination can be fulfilled with remaining symbols
    const isMatch = Object.entries(combinationCounts).every(
      ([symbol, count]) => symbolCounts[symbol] >= count
    );

    if (isMatch) {
      // Deduct used symbols from the available pool
      Object.entries(combinationCounts).forEach(([symbol, count]) => {
        symbolCounts[symbol] -= count;
      });

      // Add the reward for this combination
      rewards.push(reward.toObject());;
    }
  }

  return rewards;
};


/**
 * Plays the slot machine game for a user identified by their Telegram ID.
 * 
 * @async
 * @function playSlotMachine
 * @param {string} id - The ID of the user.
 * @param {number} [betX=1] - The multiplier for the bet amount (default is 1).
 * @returns {Promise<Object>} The result of the slot machine play, including updated user data and rewards.
 * @throws {EError} Throws an error if the user does not have enough energy or if an unexpected error occurs.
 * 
 * @description
 * This function simulates a slot machine game. It performs the following steps:
 * - Retrieves the user by their ID.
 * - Checks if the user has enough energy to play.
 * - Deducts the bet amount from the user's energy and increments their play count.
 * - Spins the slot machine reels and checks for winning combinations.
 * - Handles special rewards such as JACKPOT and SPIN bonuses.
 * - Applies the rewards to the user's account and saves the updated user data.
 * - Returns the result of the play, including the user's updated state and rewards.
 */
const playSlotMachine = async (id, betX = 1) => {
  try {
    let user = await getUserById(id);
    console.log(id, user);

    if (user.energy < betX) {
      throw new EError(406, "Not enought energy");
    }

    user.energy -= betX;
    user.slotMachinePlays += 1;
    try {
      await userEvents.asyncEmit("playSlotMachine", user);
    } catch (e) {
      logger.error(e)
    }

    const slotMachine = await getSlotMachine();
    let turns = 1;
    let playScripts = [];
    let no = 0;
    let gotSpins = false;
    console.log("================================================");
    while (turns > 0) {
      turns--;
      no++;

      const reelSymbols = spinSlotMachine(slotMachine);
      let potentialRewards = checkWinningCombinations(reelSymbols, slotMachine.combinations);
      console.log(no, reelSymbols, potentialRewards.map(r => r.type));
      playScripts.push({
        no: no,
        type: 'slotMachine',
        reelSymbols: reelSymbols,
        rewards: potentialRewards,
        betX: betX,
      });
      if (potentialRewards.find(r => r.type == "JACKPOT")) {
        no++;
        let jackpot = await spinJackpot();
        playScripts.push({
          no: no,
          type: 'jackpot',
          rewards: [jackpot.reward],
          pool: jackpot.pool,
          betX: betX
        })
      }
      const spinRewards = potentialRewards.find(r => r.type == "SPIN");
      if (spinRewards) {
        if (!gotSpins) {
          betX = 1;
          turns += spinRewards.value * betX;
        } else {
          // already got spins bonus, roll back
          no--;
          turns++;
          playScripts.pop();
        }

        gotSpins = true;
      }
    }

    let result = await applyPlayScriptsRewardsToUser(user, playScripts);
    await user.save();
    return {
      ...result,
      user
    };
  } catch (e) {
    console.log(e);
    throw new EError(e.statusCode || 500, e.message, e);
  }
};

module.exports = {
  initializeSlotMachine,
  getSlotMachine,
  playSlotMachine,
};
