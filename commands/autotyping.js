/**
 * FOXBOT V2 - A WhatsApp Bot
 * Copyright (c) 2024 FOXBOT
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 *
 * Credits:
 * - Baileys Library by @whiskeysockets
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/autotypingConfig.json');

// Function to read the current configuration for autotyping
function readAutotypingConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.error('Error reading autotyping config:', error);
    }
    return { enabled: false, mode: 'blacklist', list: [] }; // Default config
}

// Function to write the configuration for autotyping
function writeAutotypingConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error writing autotyping config:', error);
    }
}

// Command to toggle autotyping on or off
async function autotypingCommand(sock, chatId, sender, args) {
    const config = readAutotypingConfig();
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        config.enabled = true;
        writeAutotypingConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autotyping has been enabled.',
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
        writeAutotypingConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autotyping has been disabled.',
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
        writeAutotypingConfig(config);
        await sock.sendMessage(chatId, {
            text: `🤖 Autotyping mode set to ${action}.`,
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

// Function to check if autotyping is enabled
function isAutotypingEnabled() {
    const config = readAutotypingConfig();
    return config.enabled;
}

// Function to handle autotyping logic for messages
async function handleAutotypingForMessage(sock, chatId, text) {
    const config = readAutotypingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't type if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't type if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('composing', chatId);
}

// Function to handle autotyping logic for commands
async function handleAutotypingForCommand(sock, chatId) {
    const config = readAutotypingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't type if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't type if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('composing', chatId);
}

// Function to show typing after a command
async function showTypingAfterCommand(sock, chatId) {
    const config = readAutotypingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't type if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't type if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('composing', chatId);
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand,
};