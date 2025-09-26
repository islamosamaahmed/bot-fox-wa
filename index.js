require("./settings");
const {
  Boom
} = require("@hapi/boom");
const fs = require("fs");
const chalk = require("chalk");
const FileType = require("file-type");
const path = require("path");
const axios = require("axios");
const {
  handleMessages,
  handleGroupParticipantUpdate,
  handleStatus
} = require("./main");
const PhoneNumber = require("awesome-phonenumber");
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require("./lib/exif");
const {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetch,
  await,
  sleep,
  reSize
} = require("./lib/myfunc");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  jidDecode,
  proto,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const readline = require("readline");
const {
  parsePhoneNumber
} = require("libphonenumber-js");
const {
  PHONENUMBER_MCC
} = require("@whiskeysockets/baileys/lib/Utils/generics");
const {
  rmSync,
  existsSync
} = require("fs");
const {
  join
} = require("path");
const store = require("./lib/lightweight_store");
store.readFromFile();
const settings = require("./settings");
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);
setInterval(() => {
  if (global.gc) {
    global.gc();
    console.log("🧹 Garbage collection completed");
  }
}, 60000);
setInterval(() => {
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
  if (memoryUsage > 400) {
    console.log("⚠️ RAM too high (>400MB), restarting bot...");
    process.exit(1);
  }
}, 30000);
let phoneNumber = "911234567890";
let owner = JSON.parse(fs.readFileSync("./data/owner.json"));
global.botname = "LUCKY TECH HUB BOT";
global.themeemoji = "•";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = text => {
  return new Promise(resolve => rl.question(text, resolve));
};
async function startXeonBotInc() {
  let {
    version: version,
    isLatest: isLatest
  } = await fetchLatestBaileysVersion();
  const {
    state: state,
    saveCreds: saveCreds
  } = await useMultiFileAuthState("./session");
  const msgRetryCounterCache = new NodeCache();
  const XeonBotInc = makeWASocket({
    "version": version,
    "logger": pino({
      "level": "silent"
    }),
    "printQRInTerminal": !pairingCode,
    "browser": ["Ubuntu", "Chrome", "20.0.04"],
    "auth": {
      "creds": state.creds,
      "keys": makeCacheableSignalKeyStore(state.keys, pino({
        "level": "silent"
      }).child({
        "level": "silent"
      }))
    },
    "markOnlineOnConnect": true,
    "generateHighQualityLinkPreview": true,
    "syncFullHistory": true,
    "getMessage": async key => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    },
    "msgRetryCounterCache": msgRetryCounterCache,
    "defaultQueryTimeoutMs": undefined
  });
  store.bind(XeonBotInc.ev);
  XeonBotInc.ev.on("messages.upsert", async chatUpdate => {
    try {
      const mek = chatUpdate.messages[0];
      if (!mek.message) {
        return;
      }
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") {
        await handleStatus(XeonBotInc, chatUpdate);
        return;
      }
      if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === "notify") {
        return;
      }
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) {
        return;
      }
      XeonBotInc?.readMessages && XeonBotInc?.readMessages([mek.key]);
      try {
        await handleMessages(XeonBotInc, chatUpdate, true);
      } catch (e) {
        console.error("Error in handleMessages:", e);
        mek.key && mek.key.remoteJid && (await XeonBotInc.sendMessage(mek.key.remoteJid, {
          "text": "❌ An error occurred while processing your message.",
          "contextInfo": {
            "forwardingScore": 1,
            "isForwarded": true,
            "forwardedNewsletterMessageInfo": {
              "newsletterJid": "120363420656466131@newsletter",
              "newsletterName": "LUCKY TECH HUB BOT",
              "serverMessageId": -1
            }
          }
        }).catch(console.error));
      }
    } catch (err) {
      console.error("Error in messages.upsert:", err);
    }
  });
  XeonBotInc.decodeJid = jid => {
    if (!jid) {
      return jid;
    }
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server && decode.user + "@" + decode.server || jid;
    } else {
      return jid;
    }
  };
  XeonBotInc.ev.on("contacts.update", update => {
    for (let contact of update) {
      let id = XeonBotInc.decodeJid(contact.id);
      if (store && store.contacts) {
        store.contacts[id] = {
          "id": id,
          "name": contact.notify
        };
      }
    }
  });
  XeonBotInc.getName = (jid, withoutContact = false) => {
    id = XeonBotInc.decodeJid(jid);
    withoutContact = XeonBotInc.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us")) {
      return new Promise(async resolve => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) {
          v = XeonBotInc.groupMetadata(id) || {};
        }
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    } else {
      v = id === "0@s.whatsapp.net" ? {
        "id": id,
        "name": "WhatsApp"
      } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ? XeonBotInc.user : store.contacts[id] || {};
    }
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };
  XeonBotInc.public = true;
  XeonBotInc.serializeM = m => smsg(XeonBotInc, m, store);
  XeonBotInc.ev.on("connection.update", async update => {
    const {
      connection: connection,
      lastDisconnect: lastDisconnect
    } = update;
    if (connection === 'open') {
		if (pairingCode && !XeonBotInc.authState.creds.registered) {
			if (useMobile) {
				throw new Error("Cannot use pairing code with mobile api");
			}
			let phoneNumber;
			if (!!global.phoneNumber) {
				phoneNumber = global.phoneNumber;
			} else {
				phoneNumber = await question(chalk.blue(chalk.bgGreen("Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : ")));
			}
			phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
			const {
				isValid
			} = require("./lib/myfunc");
			if (!isValid("+" + phoneNumber)) {
				console.log(chalk.red("Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces."));
				process.exit(1);
			}
			try {
				let code = await XeonBotInc.requestPairingCode(phoneNumber);
				code = code?.match(/.{1,4}/g)?.join("-") || code;
				console.log(chalk.black(chalk.bgGreen("Your Pairing Code : ")), chalk.black(chalk.white(code)));
				console.log(chalk.yellow("\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap \"Link a Device\"\n4. Enter the code shown above"));
        rl.close();
			} catch (e) {
				console.log("Error requesting pairing code:", e);
				console.log(chalk.red("Failed to get pairing code. Please check your phone number and try again."));
			}
		}
    }
    if (connection == "open") {
      console.log(chalk.magenta(" "));
      console.log(chalk.yellow("│ [ 🟠 ] Connecting to WhatsApp ⏳️..."));
      console.log(chalk.green("│ [ 🪩 ] L T H Bot Connected Successfully"));
      console.log(chalk.cyan(" "));
      const ownerName = "Tomilucky218";
      const repoUrl = "https://github.com/Tomilucky218/Lucky-XD2";
      const youtubeChannel = "LUCKY TECH HUB";
      const channelLink = "https://whatsapp.com/channel/0029VbAnuvT6RGJ9Qrf3NJ0L";
      const botNumber = XeonBotInc.user.id.split(":")[0] + "@s.whatsapp.net";
      await XeonBotInc.sendMessage(botNumber, {
        "image": {
          "url": "https://files.catbox.moe/suqejh.jpg"
        },
        "caption": "╭═✦〔 *ᴄᴏɴɴᴇᴄᴛɪᴏɴ ɴᴏᴛɪᴄᴇ* 〕✦═╮\n\n *ʟᴜᴄᴋʏ ᴛᴇᴄʜ ʜᴜʙ ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ!* ✅\n\n> _One of the Best Whatsapp Bot._\n\n────────────────\n> 🌟 *ꜱᴛᴀʀ ʀᴇᴘᴏ* : " + repoUrl + "\n\n> 🪄 *ꜰᴏʟʟᴏᴡ ᴜꜱ* : " + channelLink + "\n\n> 📺 *ʏᴏᴜᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* : https://youtube.com/@luckytechhub-i9u\n────────────────\n\n> © " + ownerName + " " + youtubeChannel,
        "contextInfo": {
          "forwardingScore": 1,
          "isForwarded": true,
          "forwardedNewsletterMessageInfo": {
            "newsletterJid": "120363420656466131@newsletter",
            "newsletterName": "LUCKY TECH HUB BOT",
            "serverMessageId": -1
          }
        }
      });
      await delay(500);
      console.log(chalk.red("│ [ ✅ ] Creds data downloaded successfully"));
      await delay(500);
      console.log(chalk.yellow("│ [ 🧩 ] Installing commands..."));
      await delay(500);
      console.log(chalk.blue("│ [ ✅ ] Commands installed successfully"));
      await delay(500);
      console.log(chalk.magenta("╭═════════════════════════════════╮"));
      await delay(500);
      console.log(chalk.green("│  Bot Version: 2.2.6"));
      await delay(500);
      console.log(chalk.blue("╰═════════════════════════════════╯"));
      await delay(500);
      console.log(chalk.cyan("╭══✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦══─❒"));
      await delay(500);
      console.log(chalk.yellow("│ [ 🌿 ] Engaging Connection to => " + JSON.stringify(XeonBotInc.user, null, 2)));
      await delay(500);
      console.log(chalk.cyan("╰══✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦══─❒"));
      await delay(500);
      console.log(chalk.red("╭═✦✦═══════════════════✦✦═╮"));
      await delay(500);
      console.log(chalk.blue("\n" + (global.themeemoji || "•") + " WA NUMBER: " + owner));
      console.log(chalk.magenta((global.themeemoji || "•") + " CREDIT: LUCKY TECH HUB"));
      console.log(chalk.red((global.themeemoji || "•") + " GITHUB: luckytechhub"));
      await delay(500);
      console.log(chalk.red("╰═✦✦═══════════════════✦✦═╯"));
      await delay(500);
      console.log(chalk.green("╭══✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦═✦══─❒"));
      await delay(500);
      console.log(chalk.yellow("│ [ 📩 ] Connection notice sent successfully with image"));
      await delay(500);
      console.log(chalk.blue("╰══════════════════════✦═✦═✦═✦═✦═══─❒"));
      await delay(500);
      console.log(chalk.cyan(" "));
      await delay(500);
      console.log(chalk.green("★★★★★═════════†════════★★★★★★"));
      console.log(chalk.yellow("> ⛔ *ʙᴏᴛ ᴘʀᴇꜰɪx* : " + settings.prefix));
      console.log(chalk.blue("\n╰══════════════════════✦═✦═✦═✦═✦═╯"));
      await delay(500);
      console.log(chalk.cyan(" "));
      console.log(chalk.red("╭══════════════════════✦═✦═✦═✦═✦═══─❒"));
      console.log(chalk.cyan(" "));
      await delay(500);
      const newsletters = ["120363403921007988@newsletter", "120363403433505770@newsletter", "120363420656466131@newsletter"];
      let followed = [];
      let alreadyFollowing = [];
      let failed = [];
      for (const jid of newsletters) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(chalk.yellow("│ [ 📡 ] Checking metadata for "));
          console.log(chalk.yellow("│ [ 📡 ] Metadata: " + jid));
          console.log(chalk.yellow("★★★★★═════════†════════★★★★★★"));
          const metadata = await XeonBotInc.newsletterMetadata("get", jid);
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(chalk.green("│ [ ✅ ] Metadata downloaded successfully"));
          console.log(chalk.green("│ [ 📩 ] Sending connection notice with image", metadata));
          console.log(chalk.blue("│ [ 📌 ] Already following:"));
          if (metadata.viewer_metadata === null) {
            await XeonBotInc.newsletterFollow(jid);
            followed.push(jid);
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(chalk.green("│ [ ✅ ] Followed newsletter:"));
            console.log(chalk.blue("│ [ ✅ ] Followed newsletter: " + jid));
            console.log(chalk.blue("╰══════════════════════✦═✦═✦═✦═✦═╯"));
          } else {
            alreadyFollowing.push(jid);
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(chalk.green("│ [ ✅ ] Followed newsletter:"));
            console.log(chalk.red("│ [ 📌 ] Already following: " + jid));
            console.log(chalk.blue("╰══════════════════════✦═✦═✦═✦═✦═╯"));
          }
        } catch (error) {
          failed.push(jid);
          await new Promise(resolve => setTimeout(resolve, 500));
          console.error(chalk.red("│ [ ❌ ] Failed to follow "));
          console.error(chalk.red("│ ❌ Failed: " + jid + ": " + error.message));
          console.error(chalk.red("★★★★★═════════†════════★★★★★★"));
          await XeonBotInc.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
            "text": "Failed to follow " + jid + ": " + error.message
          });
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(chalk.green("╭══════════════════════✦═✦═✦═✦═✦═╮\n│ 📡 Newsletter Follow Status:\n│ ✅ Followed: " + followed.length + "\n│ 📌 Already following: " + alreadyFollowing.length + "\n│ ❌ Failed: " + failed.length + "\n╰══════════════════════✦═✦═✦═✦═✦════─❒"));
    }
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        try {
          rmSync("./session", {
            "recursive": true,
            "force": true
          });
        } catch {}
        console.log(chalk.red("Session logged out. Please re-authenticate."));
        startXeonBotInc();
      } else {
        startXeonBotInc();
      }
    }
  });
  const callSet = new Set();
  return XeonBotInc.ev.on("call", async json => {
    try {
      const {
        readState: readState
      } = require("./commands/anticall");
      const anticallState = readState();
      if (!anticallState.enabled) {
        return;
      }
      for (const call of json) {
        const chatId = call.chatId || call.from || call.peerJid;
        if (!chatId) {
          continue;
        }
        try {
          try {
            if (typeof XeonBotInc.rejectCall === "function" && call.id) {
              await XeonBotInc.rejectCall(call.id, chatId);
            } else {
              if (typeof XeonBotInc.sendCallOfferAck === "function" && call.id) {
                await XeonBotInc.sendCallOfferAck(call.id, chatId, "reject");
              }
            }
          } catch {}
          if (!callSet.has(chatId)) {
            callSet..add(chatId);
            setTimeout(() => callSet.delete(chatId), 60000);
            await XeonBotInc.sendMessage(chatId, {
              "text": "*📵 Calls are not allowed on this number unless you have permission 🚫.*"
            });
          }
        } catch {}
        setTimeout(async () => {
          try {
            await XeonBotInc.updateBlockStatus(chatId, "block");
          } catch {}
        }, 800);
      }
    } catch (e) {}
  });
  XeonBotInc.ev.on("creds.update", saveCreds);
  XeonBotInc.ev.on("group-participants.update", async update => {
    await handleGroupParticipantUpdate(XeonBotInc, update);
  });
  XeonBotInc.ev.on("messages.upsert", async chatUpdate => {
    if (chatUpdate.messages[0].key && chatUpdate.messages[0].key.remoteJid === "status@broadcast") {
      await handleStatus(XeonBotInc, chatUpdate);
    }
  });
  XeonBotInc.ev.on("messages.reaction", async reaction => {
    await handleStatus(XeonBotInc, reaction);
  });
  XeonBotInc.ev.on("status.update", async status => {
    await handleStatus(XeonBotInc, status);
  });
  return XeonBotInc;
}
startXeonBotInc().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update " + __filename));
  delete require.cache[file];
  require(file);
});