const fs = require('fs');
const path = require('path');

async function staffCommand(sock, chatId, msg) {
    try {
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        let isUrl = true;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = path.join(__dirname, '../assets/bot_image.jpg');
            isUrl = false;
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');
        
        // Get group owner
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create staff text
        const text = `
≡ *GROUP ADMINS* _${groupMetadata.subject}_

╭══✦〔 *ᴀᴅᴍɪɴꜱ* 〕✦═╮
▢ ${listAdmin}
╰═✦═✦═✦═✦═✦═✦═✦═✦═╯
`.trim();

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: isUrl ? { url: pp } : fs.readFileSync(pp),
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

    } catch (error) {
        console.error('Error in staff command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to get admin list!' });
    }
}

module.exports = staffCommand;