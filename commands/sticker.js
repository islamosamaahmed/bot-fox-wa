const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');
const {
    Sticker,
    StickerTypes
} = require('wa-sticker-formatter');
const fs = require('fs');
const {
    tmpdir
} = require('os');
const {
    join
} = require('path');
const {
    exec
} = require('child_process');

async function stickerCommand(sock, chatId, msg) {
    const isImage = msg.message?.imageMessage;
    const isVideo = msg.message?.videoMessage;
    const isQuotedImage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const isQuotedVideo = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

    if (isImage || isQuotedImage) {
        const messageToDownload = isImage ? msg.message.imageMessage : isQuotedImage;
        const stream = await downloadContentFromMessage(messageToDownload, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const sticker = new Sticker(buffer, {
            pack: 'FOXBOT V2',
            author: 'FOXBOT',
            type: StickerTypes.FULL,
            quality: 50,
        });

        await sock.sendMessage(chatId, {
            sticker: await sticker.toBuffer(),
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

    } else if (isVideo || isQuotedVideo) {
        const messageToDownload = isVideo ? msg.message.videoMessage : isQuotedVideo;
        if (messageToDownload.seconds > 15) {
            await sock.sendMessage(chatId, {
                text: 'Video is too long for a sticker. Please use a video shorter than 15 seconds.',
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
            return;
        }

        const stream = await downloadContentFromMessage(messageToDownload, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const sticker = new Sticker(buffer, {
            pack: 'FOXBOT V2',
            author: 'FOXBOT',
            type: StickerTypes.FULL,
            quality: 50,
        });

        await sock.sendMessage(chatId, {
            sticker: await sticker.toBuffer(),
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
            text: 'Please reply to an image or video to create a sticker.',
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

module.exports = stickerCommand;