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

const configPath = path.join(__dirname, '../data/autorecordingConfig.json');

// Function to read the current configuration for autorecording
function readAutorecordingConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.error('Error reading autorecording config:', error);
    }
    return { enabled: false, mode: 'blacklist', list: [] }; // Default config
}

// Function to write the configuration for autorecording
function writeAutorecordingConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error writing autorecording config:', error);
    }
}

// Command to toggle autorecording on or off
async function autorecordingCommand(sock, chatId, sender, args) {
    const config = readAutorecordingConfig();
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        config.enabled = true;
        writeAutorecordingConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autorecording has been enabled.',
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
        writeAutorecordingConfig(config);
        await sock.sendMessage(chatId, {
            text: '🤖 Autorecording has been disabled.',
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
        writeAutorecordingConfig(config);
        await sock.sendMessage(chatId, {
            text: `🤖 Autorecording mode set to ${action}.`,
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

// Function to check if autorecording is enabled
function isAutorecordingEnabled() {
    const config = readAutorecordingConfig();
    return config.enabled;
}

// Function to handle autorecording logic for messages
async function handleAutorecordingForMessage(sock, chatId, text) {
    const config = readAutorecordingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't record if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't record if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('recording', chatId);
}

// Function to handle autorecording logic for commands
async function handleAutorecordingForCommand(sock, chatId) {
    const config = readAutorecordingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't record if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't record if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('recording', chatId);
}

// Function to show recording after a command
async function showRecordingAfterCommand(sock, chatId) {
    const config = readAutorecordingConfig();
    if (!config.enabled) return;

    if (config.mode === 'blacklist' && config.list.includes(chatId)) {
        return; // Don't record if chatId is in blacklist
    }

    if (config.mode === 'whitelist' && !config.list.includes(chatId)) {
        return; // Don't record if chatId is not in whitelist
    }

    await sock.sendPresenceUpdate('recording', chatId);
}

module.exports = {
    autorecordingCommand,
    isAutorecordingEnabled,
    handleAutorecordingForMessage,
    handleAutorecordingForCommand,
    showRecordingAfterCommand,
};