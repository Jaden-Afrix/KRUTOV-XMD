const fs = require('fs');
const path = require('path');

function isBanned(userId) {
    try {
        const filePath = path.join(__dirname, '../data/banned.json');
        if (!fs.existsSync(filePath)) return false;

        const bannedUsers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return Array.isArray(bannedUsers) && bannedUsers.includes(userId);
    } catch (error) {
        console.error('Error checking banned status:', error);
        return false;
    }
}

module.exports = { isBanned };