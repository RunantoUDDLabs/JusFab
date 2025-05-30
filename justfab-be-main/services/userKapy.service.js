const UserKapy = require('../models/userKapy.model');
const UserItem = require('../models/userItem.model'); // Assuming this model exists for inventory

/**
 * Sets equipment for a user's Kapy and updates stats and skills.
 * @param {String} userId - The ID of the user.
 * @param {Array<String>} equipmentIds - The IDs of the equipment to set.
 * @returns {Object} - The updated UserKapy document with stats and skills.
 */
async function setEquipments(userId, equipmentIds) {
    // Fetch the user's Kapy
    console.log(userId, equipmentIds);
    const userKapy = await UserKapy.findOne({ user: userId }).populate('equipments');
    if (!userKapy) {
        throw new Error('User Kapy not found');
    }

    // Fetch the equipment details from the inventory, including the related item
    const equipments = await UserItem.find({ _id: { $in: equipmentIds }, user: userId }).populate('item');

    if (equipments.length !== equipmentIds.length) {
        throw new Error('Some equipment items are not found in the user inventory');
    }

    // Validate equipment constraints
    const counts = { WEAPON: 0, ARMOR: 0, ACCESSORY: 0 };
    equipments.forEach(equipment => {
        const itemType = equipment.item.type; // Assuming `item.type` contains the type of the equipment
        if (itemType === 'WEAPON') counts.WEAPON++;
        if (itemType === 'ARMOR') counts.ARMOR++;
        if (itemType === 'ACCESSORY') counts.ACCESSORY++;
    });

    if (counts.WEAPON > 2 || counts.ARMOR > 1 || counts.ACCESSORY > 1) {
        throw new Error('Equipments can include a maximum of 2 WEAPONs, 1 ARMOR, and 1 ACCESSORY.');
    }

    // Update the user's Kapy with the new equipment
    userKapy.equipments = equipmentIds;
    await userKapy.save();

    return userKapy.toObject();
}

/**
 * Retrieves the Kapy associated with a specific user. Initializes a new Kapy if none exists.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The user's Kapy with stats and skills.
 */
async function getUserKapy(userId) {
    try {
        let userKapy = await UserKapy.findOne({ user: userId })
            .populate('equipments')
            .exec();

        if (!userKapy) {
            // Initialize a new Kapy for the user
            userKapy = new UserKapy({
                user: userId,
                equipments: [],
                baseStats: {
                    hp: 100,
                    attack: 0,
                    defense: 0,
                    luck: 0,
                },
                level: 1,
            });
            await userKapy.save();
        }

        return userKapy.toObject();
    } catch (error) {
        throw new Error('Error retrieving or initializing user Kapy: ' + error.message);
    }
}

module.exports = {
    setEquipments,
    getUserKapy,
};
