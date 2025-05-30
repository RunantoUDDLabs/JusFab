function recalcStats(baseStats, level) {
  const updatedStats = {};
  for (const key in baseStats) {
    updatedStats[key] = Math.round(baseStats[key] * (1 + 0.1 * (level - 1)));
  }
  return updatedStats;
}

function recalcSkills(item, userItem) {
  const rarityOrder = ['COMMON', 'RARE', 'ULTRA_RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
  const currentRarity = userItem.rarity;
  const currentIndex = rarityOrder.indexOf(currentRarity);
  let aggregatedSkills = [];

  for (let i = 0; i <= currentIndex; i++) {
    const rarityKey = rarityOrder[i];
    let skillsForRarity;
    if (typeof item.raritySkills.get === 'function') {
      skillsForRarity = item.raritySkills.get(rarityKey);
    } else {
      skillsForRarity = item.raritySkills[rarityKey];
    }
    if (skillsForRarity) {
      aggregatedSkills = aggregatedSkills.concat(skillsForRarity);
    }
  }
  return aggregatedSkills;
}

module.exports = { recalcStats, recalcSkills };
