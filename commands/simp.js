const Jimp = require('jimp');

async function simpCommand(sock, chatId, quoted, mentioned, sender) {
    let user;
    if (quoted) {
        user = quoted.sender;
    } else if (mentioned && mentioned.length > 0) {
        user = mentioned[0];
    } else {
        user = sender;
    }

    try {
        const pfp = await sock.profilePictureUrl(user, 'image');
        const simpCard = await Jimp.read('https://i.imgur.com/i2hG2V2.png');
        const userPfp = await Jimp.read(pfp);

        userPfp.resize(256, 256);
        simpCard.composite(userPfp, 100, 100);

        const buffer = await simpCard.getBufferAsync(Jimp.MIME_PNG);

        await sock.sendMessage(chatId, {
            image: buffer,
            caption: 'Certified Simp!',
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
    } catch (error) {
        console.error('Error creating simp card:', error);
        await sock.sendMessage(chatId, { 
            text: 'Could not create the simp card. Make sure the user has a profile picture.',
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

module.exports = {
    simpCommand,
};