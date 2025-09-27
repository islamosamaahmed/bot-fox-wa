const {
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia
} = require('@whiskeysockets/baileys');

async function pairCommand(sock, chatId, message) {
  const isOwner = message.key.fromMe;

  if (isOwner) {
    const pairingCodeEnabled = process.argv.includes('--pairing-code');

    if (pairingCodeEnabled) {
      await sock.sendMessage(chatId, {
        text: 'Pairing code is already enabled. Please check your console for the code.',
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
        text: 'Pairing code is not enabled. Please restart the bot with --pairing-code flag to use this command.',
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
  } else {
    await sock.sendMessage(chatId, {
      text: 'This command can only be used by the owner.',
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

module.exports = pairCommand;