const fs = require('fs');
const path = require('path');

const antilinkFilePath = path.join(__dirname, '../data', 'antilinkSettings.json');

function loadAntilinkSettings() {
    if (fs.existsSync(antilinkFilePath)) {
        const data = fs.readFileSync(antilinkFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveAntilinkSettings(settings) {
    fs.writeFileSync(antilinkFilePath, JSON.stringify(settings, null, 2));
}

/**
 * Set Antilink settings for a group.
 * @param {string} groupId - The group JID.
 * @param {string} status - 'on' or 'off'.
 * @param {string} action - Optional. 'warn', 'kick', or 'delete'.
 */
function setAntilink(groupId, status, action = 'warn') {
    const settings = loadAntilinkSettings();

    if (status === 'off') {
        delete settings[groupId];
    } else {
        settings[groupId] = {
            enabled: true,
            action: action.toLowerCase()
        };
    }

    saveAntilinkSettings(settings);
}

/**
 * Get Antilink settings for a group.
 * @param {string} groupId - The group JID.
 * @returns {object|null} - Settings object or null if not enabled.
 */
function getAntilink(groupId) {
    const settings = loadAntilinkSettings();
    return settings[groupId] && settings[groupId].enabled ? settings[groupId] : null;
}

module.exports = {
    setAntilink,
    getAntilink
};