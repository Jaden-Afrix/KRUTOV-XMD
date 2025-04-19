const settings = require('../settings');

function isOwner(senderId) {
    const ownerNumbers = Array.isArray(settings.ownerNumber)
        ? settings.ownerNumber
        : [settings.ownerNumber];

    const ownerJids = ownerNumbers.map(num => num + '@s.whatsapp.net');
    return ownerJids.includes(senderId);
}

module.exports = isOwner;