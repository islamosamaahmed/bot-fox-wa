const settings = require('../settings');
const fs = require('fs');
const path = require('path');


async function helpCommand(sock, chatId, message) {
    const helpMessage = `

╭═✦〔 ✅ *ꜱᴇʟᴇᴄᴛᴇᴅ* ✅ 〕✦═╮
│🛠️ ᴘʀᴇғɪx  : [ ${settings.prefix} ]
│🚀 ᴠᴇʀsɪᴏɴ : *${settings.version}*
╰═══⭘══════════⚬═╯
 
╭═✦〔 📥 *ᴅʟᴅ ᴄᴍᴅꜱ* 〕✦═╮
│
│🔹 .play <song_name>
│🔹 .song <song_name>
│🔹 .instagram <link>
│🔹 .facebook <link>
│🔹 .tiktok <link>
│🔹 .spotify <query>
│🔹 .video <song name>
│🔹 .ytmp4 <Link>
│
╰═✪╾✦═✦═✦═✦═✦╼✪═╯
> ${settings.caption}`;

    try {       
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420656466131@newsletter',
                        newsletterName: 'Lucky Tech Hub Bot',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420656466131@newsletter',
                        newsletterName: 'Lucky Tech Hub Bot by Lucky Tech Hub',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
   
}

module.exports = helpCommand;