const settings = require('../settings.js');

async function helpCommand(sock, chatId, message) {
    try {
        const helpMessage = `
Hello! I am a bot. Here are some of the things I can do:

- \`.ping\`: Check my response time.
- \`.menu\`: Show the main menu.
- \`.sticker\`: Create a sticker from an image.

For a full list of commands, please use the \`.menu\` command.
`;

        await sock.sendMessage(chatId, {
            text: helpMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'FOXBOT V2',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to show help.' });
    }
}

module.exports = helpCommand;