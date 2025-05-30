const Jackpot = require('../models/jackpot.model');

/**
 * Spin the jackpot and determine the reward.
 * @param {String} jackpotId - The ID of the jackpot
 * @returns {Object} The selected reward and its details
 */
const spinJackpot = async (jackpotId) => {
  const jackpot = await getJackpot();
  if (!jackpot) {
    throw new Error('Jackpot not found.');
  }

  const { pool, rewards } = jackpot;

  // Step 1: Calculate total weight for rewards
  const totalWeight = rewards.reduce((sum, jackPotReward) => sum + jackPotReward.chance, 0);

  // Step 2: Randomly select a reward based on weight
  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;
  let selectedJackpotReward = null;

  for (const jackPotReward of rewards) {
    cumulativeWeight += jackPotReward.chance;
    if (random <= cumulativeWeight) {
      selectedJackpotReward = jackPotReward; // Extract the embedded reward
      break;
    }
  }

  if (!selectedJackpotReward) {
    throw new Error('Failed to determine jackpot reward.');
  }

  // Step 3: Process the selected reward
  let rewardDetails = null;
  switch (selectedJackpotReward.reward.type) {
    case 'ITEM':
      rewardDetails = {
        description: selectedJackpotReward.description,
        type: 'ITEM',
        item: selectedJackpotReward.reward.item,
      };
      break;

    case 'GOLD':
      rewardDetails = {
        description: selectedJackpotReward.description,
        type: 'GOLD',
        value: selectedJackpotReward.reward.value,
      };
      break;

    case 'POOL_PERCENTAGE':
      const percentage = selectedJackpotReward.reward.value;
      const rewardValue = percentage;
      rewardDetails = {
        description: selectedJackpotReward.description,
        type: 'POOL_PERCENTAGE',
        value: selectedJackpotReward.reward.value,
        pool: jackpot.pool,
      };
      break;

    default:
      throw new Error('Unknown reward type.');
  }

  return { reward: rewardDetails, updatedPool: jackpot.pool };
};


/**
 * Get the jackpot. If no jackpot exists, create a default one.
 * @returns {Object} The jackpot document
 */
const getJackpot = async () => {
  let jackpot = await Jackpot.findOne();

  // If no jackpot exists, create a default one
  if (!jackpot) {
    console.log('No jackpot found. Creating a default jackpot.');

    const defaultRewards = [
      {
        description: '5.000 Gold',
        reward: {
          type: 'GOLD',
          value: 5000,
        },
        chance: 35,
      },
      {
        description: '10.000 Gold',
        reward: {
          type: 'GOLD',
          value: 10000
        },
        chance: 30,
      },
      {
        description: 'Items (Legendary)',
        reward: {
          type: 'ITEM',
          item: { rarity: 'LEGENDARY' }
        },
        chance: 10,
      },
      {
        description: 'Items (Mythic)',
        reward: {
          type: 'ITEM',
          item: { rarity: 'MYTHIC' }
        },
        chance: 1,
      },
      {
        description: '0.001% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.001
        },
        chance: 10,
      },
      {
        description: '0.005% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.005
        },
        chance: 8,
      },
      {
        description: '0.01% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.01
        },
        chance: 5,
      },
      {
        description: '0.02% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.02
        },
        chance: 0.9,
      },
      {
        description: '0.05% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.05
        },
        chance: 0.009,
      },
      {
        description: '0.1% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.1
        },
        chance: 0.001,
      },
      {
        description: '0.5% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 0.5
        },
        chance: 0,
      },
      {
        description: '1% Jackpot Pool',
        reward: {
          type: 'POOL_PERCENTAGE',
          value: 1
        },
        chance: 0,
      }
    ];

    jackpot = new Jackpot({
      name: 'Default Jackpot',
      pool: 1000000,
      rewards: defaultRewards,
    });

    await jackpot.save();
  }

  return jackpot;
};


/**
 * Update the jackpot configuration.
 * @param {Object} data - The updated jackpot data
 * @param {String} data.name - The name of the jackpot
 * @param {Number} data.pool - The jackpot pool amount
 * @param {Array} data.rewards - The list of rewards
 * @returns {Object} The updated jackpot
 */
const updateJackpot = async ({ name, pool, rewards }) => {
  // Fetch the current jackpot
  let jackpot = await Jackpot.findOne();
  if (!jackpot) {
    throw new Error('Jackpot not found. Please create a jackpot first.');
  }


  // Update fields
  if (name) jackpot.name = name;
  try {
    pool = parseInt(pool, 10);
    jackpot.pool = pool;
  } catch (e) {

  }
  if (rewards && Array.isArray(rewards)) jackpot.rewards = rewards;

  // Save the updated jackpot
  await jackpot.save();
  return jackpot;
};

module.exports = {
  getJackpot,
  spinJackpot,
  updateJackpot
}