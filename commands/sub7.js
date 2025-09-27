const fs = require('fs');

async function sub7Command(sock, chatId, msg, botName) {
    const buttonMessage = {
        text: `
╭══✦〔 *MENU* 〕✦═╮
│
│ *Bot Name:* ${botName}
│ *Owner:* FOX
│
│ *Commands:*
│ - .alive
│ - .ping
│ - .owner
│
╰═✦═✦═✦═✦═✦═✦═✦═╯
`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420656466131@newsletter',
                newsletterName: 'FOXBOT V2',
                serverMessageId: -1
            }
        }
    };

    await sock.sendMessage(chatId, buttonMessage, { quoted: msg });
}

module.exports = sub7Command;