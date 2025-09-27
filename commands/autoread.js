const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/autoreadConfig.json');

// Function to read the current configuration for autoread
function readAutoreadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.error('Error reading autoread config:', error);
    }
    return { enabled: false, mode: 'blacklist', list: [] }; // Default config
}

// Function to write the configuration for autoread
function writeAutoreadConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error writing autoread config:', error);
    }
}

// Command to toggle autoread on or off
async function autoreadCommand(sock, chatId, sender, args) {
    const config = readAutoreadConfig();
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        config.enabled = true;
        writeAutoreadConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autoread has been enabled.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'FOXBOT V2',
                    serverMessageId: -1
                }
            }
        });
    } else if (action === 'off') {
        config.enabled = false;
        writeAutoreadConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autoread has been disabled.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'FOXBOT V2',
                    serverMessageId: -1
                }
            }
        });
    } else if (action === 'blacklist' || action === 'whitelist') {
        config.mode = action;
        writeAutoreadConfig(config);
        await sock.sendMessage(chatId, {
            text: `🤖 Autoread mode set to ${action}.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'FOXBOT V2',
                    serverMessageId: -1
                }
            }
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `Invalid action. Use 'on', 'off', 'blacklist', or 'whitelist'.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'FOXBOT V2',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to check if autoread is enabled
function isAutoreadEnabled() {
    const config = readAutoreadConfig();
    return config.enabled;
}

// Function to handle autoread logic
async function handleAutoread(sock, message) {
    const config = readAutoreadConfig();
    if (!config.enabled) return;

    const sender = message.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    
    if (config.mode === 'blacklist' && config.list.includes(sender)) {
        return; // Don't read if sender is in blacklist
    }
    
    if (config.mode === 'whitelist' && !config.list.includes(sender)) {
        return; // Don't read if sender is not in whitelist
    }

    await sock.readMessages([message.key]);
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    handleAutoread,
};
const botNames = [global.botname?.toLowerCase(), 'bot', 'foxbot', 'foxbot v2'];