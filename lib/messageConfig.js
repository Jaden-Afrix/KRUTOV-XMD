const fs = require('fs');
const path = require('path');
const settings = require('../settings');

// Define the path to the configuration file
const configFilePath = path.join(__dirname, '../data/messageConfig.json');

// Load configuration from the JSON file
function loadConfig() {
    try {
        if (!fs.existsSync(configFilePath)) {
            // If the file doesn't exist, create it with default structure
            const defaultConfig = {
                bannedUsers: [],
                ownerNumbers: Array.isArray(settings.ownerNumber)
                    ? settings.ownerNumber
                    : [settings.ownerNumber],
                welcomeMessages: {},
                goodbyeMessages: {},
                chatbotSettings: {},
                antilinkSettings: {},
                antibadwordSettings: {},
                warnings: {}
            };
            fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        const data = fs.readFileSync(configFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading configuration:', error);
        return {
            bannedUsers: [],
            ownerNumbers: [],
            welcomeMessages: {},
            goodbyeMessages: {},
            chatbotSettings: {},
            antilinkSettings: {},
            antibadwordSettings: {},
            warnings: {}
        };
    }
}

// Save configuration to the JSON file
function saveConfig(config) {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving configuration:', error);
        return false;
    }
}

// Check if a user is banned
function isBanned(userId) {
    const config = loadConfig();
    return config.bannedUsers.includes(userId);
}

// Ban a user
function banUser(userId) {
    const config = loadConfig();
    if (!config.bannedUsers.includes(userId)) {
        config.bannedUsers.push(userId);
        return saveConfig(config);
    }
    return false;
}

// Unban a user
function unbanUser(userId) {
    const config = loadConfig();
    const index = config.bannedUsers.indexOf(userId);
    if (index !== -1) {
        config.bannedUsers.splice(index, 1);
        return saveConfig(config);
    }
    return false;
}

// Check if a user is an owner
function isOwner(userId) {
    const config = loadConfig();
    const ownerJids = config.ownerNumbers.map(num => num + '@s.whatsapp.net');
    return ownerJids.includes(userId);
}

// Set welcome message for a group
function setWelcomeMessage(groupId, message) {
    const config = loadConfig();
    config.welcomeMessages[groupId] = message;
    return saveConfig(config);
}

// Get welcome message for a group
function getWelcomeMessage(groupId) {
    const config = loadConfig();
    return config.welcomeMessages[groupId] || null;
}

// Remove welcome message for a group
function removeWelcomeMessage(groupId) {
    const config = loadConfig();
    if (config.welcomeMessages[groupId]) {
        delete config.welcomeMessages[groupId];
        return saveConfig(config);
    }
    return false;
}

// Set goodbye message for a group
function setGoodbyeMessage(groupId, message) {
    const config = loadConfig();
    config.goodbyeMessages[groupId] = message;
    return saveConfig(config);
}

// Get goodbye message for a group
function getGoodbyeMessage(groupId) {
    const config = loadConfig();
    return config.goodbyeMessages[groupId] || null;
}

// Remove goodbye message for a group
function removeGoodbyeMessage(groupId) {
    const config = loadConfig();
    if (config.goodbyeMessages[groupId]) {
        delete config.goodbyeMessages[groupId];
        return saveConfig(config);
    }
    return false;
}

// Enable or disable chatbot for a group
function setChatbot(groupId, isEnabled) {
    const config = loadConfig();
    config.chatbotSettings[groupId] = isEnabled;
    return saveConfig(config);
}

// Check if chatbot is enabled for a group
function isChatbotEnabled(groupId) {
    const config = loadConfig();
    return config.chatbotSettings[groupId] || false;
}

// Enable or disable antilink for a group
function setAntilink(groupId, isEnabled) {
    const config = loadConfig();
    config.antilinkSettings[groupId] = isEnabled;
    return saveConfig(config);
}

// Check if antilink is enabled for a group
function isAntilinkEnabled(groupId) {
    const config = loadConfig();
    return config.antilinkSettings[groupId] || false;
}

// Enable or disable antibadword for a group
function setAntibadword(groupId, isEnabled) {
    const config = loadConfig();
    config.antibadwordSettings[groupId] = isEnabled;
    return saveConfig(config);
}

// Check if antibadword is enabled for a group
function isAntibadwordEnabled(groupId) {
    const config = loadConfig();
    return config.antibadwordSettings[groupId] || false;
}

// Increment warning count for a user in a group
function incrementWarning(groupId, userId) {
    const config = loadConfig();
    if (!config.warnings[groupId]) {
        config.warnings[groupId] = {};
    }
    if (!config.warnings[groupId][userId]) {
        config.warnings[groupId][userId] = 0;
    }
    config.warnings[groupId][userId] += 1;
    saveConfig(config);
    return config.warnings[groupId][userId];
}

// Reset warning count for a user in a group
function resetWarning(groupId, userId) {
    const config = loadConfig();
    if (config.warnings[groupId] && config.warnings[groupId][userId]) {
        config.warnings[groupId][userId] = 0;
        return saveConfig(config);
    }
    return false;
}

// Get warning count for a user in a group
function getWarningCount(groupId, userId) {
    const config = loadConfig();
    return (config.warnings[groupId] && config.warnings[groupId][userId]) || 0;
}

module.exports = {
    isBanned,
    banUser,
    unbanUser,
    isOwner,
    setWelcomeMessage,
    getWelcomeMessage,
    removeWelcomeMessage,
    setGoodbyeMessage,
    getGoodbyeMessage,
    removeGoodbyeMessage,
    setChatbot,
    isChatbotEnabled,
    setAntilink,
    isAntilinkEnabled,
    setAntibadword,
    isAntibadwordEnabled,
    incrementWarning,
    resetWarning,
    getWarningCount
};