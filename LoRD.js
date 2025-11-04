process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

require('./settings');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const chalk = require('chalk');
const webp = require('node-webpmux');
const { exec } = require('child_process');
const baileys = require('baileys');
const yts = require("yt-search");
const { GroupUpdate, LoadDataBase } = require('./src/message');
const Func = require('./lib/function');
const { toAudio, CUT } = require("./lib/converter");

module.exports = conn = async (conn, m, msg, store) => {
    const botNumber = conn.decodeJid(conn.user.id);
    const errorCache = {};
    const ownerNumber = db?.set?.[botNumber]?.owner?.map(x => x.id) || owner;
    try {
        await LoadDataBase(conn, m);
        await GroupUpdate(conn, m, store);
        const body = ((m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'reactionMessage') ? m.message.reactionMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type == 'interactiveResponseMessage' && m.quoted) ? (m.message.interactiveResponseMessage?.nativeFlowResponseMessage ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') : (m.type == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || '') : (m.type == 'editedMessage') ? (m.message.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') : (m.type == 'protocolMessage') ? (m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.protocolMessage?.editedMessage?.conversation || m.message.protocolMessage?.editedMessage?.imageMessage?.caption || m.message.protocolMessage?.editedMessage?.videoMessage?.caption || '') : '') || '';
        const budy = (typeof m.text == 'string' ? m.text : '')
        const isCreator = isOwner = [botNumber, ...ownerNumber].filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0])
        const isAllowed = isOwner = [botNumber].filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0])
        const cases = db.cases ? db.cases : (db.cases = [...fs.readFileSync('./LoRD.js', 'utf-8').matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]));
        const prefix = HANDLER.find(a => body?.startsWith(a));
        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const quoted = m.quoted ? m.quoted : m
        const text = q = args.join(' ')
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        const author = db?.set?.[botNumber]?.author || 'LoRDx';
        const packname = db?.set?.[botNumber]?.packname || 'X-Asena';
        const readmore = String.fromCharCode(8206).repeat(999)

        //FAKE
        const qsticker = {
            key: {
                remoteJid: "0@s.whatsapp.net",
                fromMe: false,
                participant: '0@s.whatsapp.net'
            },
            message: {
                stickerMessage: {
                    url: 'https://mmg.whatsapp.net/v/t62.15575-24/11947109_1483660162620343_3717431073569425975_n.enc?ccb=11-4&oh=01_Q5Aa2AGQfiqV-_zlZXW4C1bZS9czI4TSKwgl4t31N5MNa0xy7Q&oe=689E780B&_nc_sid=5e03e0&mms3=true',
                    fileSha256: 'NvwwT8u2zGFv92QJTyACQijYNzTatn82+cYTc+OC3Jw=',
                    fileEncSha256: 'GF5RRFkMmwAg9VUu8O5hiFtaXNs/ysdj//lPwpZ6B9g=',
                    mediaKey: 'BM4BD298A6LZxQVpJjrDAlRD6jZlUhlM6bD9HSvKxPk=',
                    mimetype: 'image/webp',
                    height: 64,
                    width: 64,
                    directPath: '/v/t62.15575-24/11947109_1483660162620343_3717431073569425975_n.enc?ccb=11-4&oh=01_Q5Aa2AGQfiqV-_zlZXW4C1bZS9czI4TSKwgl4t31N5MNa0xy7Q&oe=689E780B&_nc_sid=5e03e0',
                }
            }
        };
        const fgc = {
            "key": {
                "fromMe": false,
                "participant": "0@s.whatsapp.net",
                "remoteJid": "0@s.whatsapp.net"
            },
            "message": {
                "groupInviteMessage": {
                    "groupJid": "919778383987-1633449038@g.us",
                    "inviteCode": "lordxddd",
                    "groupName": "Basement",
                    "caption": "Basement",
                    'jpegThumbnail': global.thumb
                }
            }
        }
        const qcont = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                participant: '0@s.whatsapp.net',
                fromMe: false,
                id: 'LoRDx'
            },
            message: {
                contactMessage: {
                    displayName: (m.pushName || author),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${m.pushName || author},;;;\nFN:${m.pushName || author}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                    sendEphemeral: true
                }
            }
        }
        const qlive = {
            key: {
                participant: "0@s.whatsapp.net",
                ...(m.chat ? { remoteJid: `0@s.whatsapp.net` } : {}),
            },
            message: {
                liveLocationMessage: { caption: `LoRDx`, jpegThumbnail: "" },
            },
        };
        const qaudio = {
            key: {
                participant: "0@s.whatsapp.net",
                ...(m.chat ? { remoteJid: `0@s.whatsapp.net` } : {}),
            },
            message: { audioMessage: { seconds: 777, ptt: true } },
        };
        const qpayment = {
            key: {
                remoteJid: "0@s.whatsapp.net",
                fromMe: false,
                id: `lordxdd`,
                participant: "0@s.whatsapp.net",
            },
            message: {
                requestPaymentMessage: {
                    currencyCodeIso4217: "USD",
                    amount1000: 777,
                    requestFrom: "0@s.whatsapp.net",
                    noteMessage: { extendedTextMessage: { text: "LoRD-MD" } },
                    expiryTimestamp: 99999,
                    amount: { value: 777, offset: 1000, currencyCode: "USD" },
                },
            },
        };
        const replay = async (teks, namee, urll) => {
            await conn.sendMessage(m.chat, { text: teks, contextInfo: { externalAdReply: { title: namee, body: "", previewType: "PHOTO", thumbnailUrl: "", thumbnail: await Func.getBuffer(urll), sourceUrl: "" } } }, { quoted: m });
        };

        async function sendText(text, text1) {
            const msg = await baileys.generateWAMessageFromContent(m.chat, {
                interactiveMessage: baileys.proto.Message.InteractiveMessage.create({
                    body: baileys.proto.Message.InteractiveMessage.Body.create({ text: text1 || "" }),
                    footer: baileys.proto.Message.InteractiveMessage.Footer.create({ text: text }),
                    nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: [] })
                }),
            }, { quoted: m });
            return await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
        }

        //DB
        const set = db.set[botNumber]

        // Set Mode
        if (!isCreator) {
            if ((set.grouponly === set.privateonly)) {
                if (!conn.public && !m.key.fromMe) return
            } else if (set.grouponly) {
                if (!m.isGroup) return
            } else if (set.privateonly) {
                if (m.isGroup) return
            }
        }

        // Group Settings
        if (m.isGroup) {
            if (db.groups[m.chat].mute && !isCreator) {
                return
            }
        }

        // Auto Read
        if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && conn.public) || isCreator) {
                conn.readMessages([m.key]);
                console.log(chalk.black(chalk.bgWhite('[MESG]:'), chalk.bgWhite(budy || m.type), '\n' + chalk.bgWhite('[FROM]:'), chalk.bgYellow(m.pushName || (isCreator ? 'Bot' : 'Anonim')), chalk.bgWhite('\n[ IN ]:'), chalk.bgHex('#FF5700')(m.isGroup ? m.metadata.subject : m.chat.endsWith('@newsletter') ? 'Newsletter' : 'Private Chat'), chalk.bgBlue('(' + m.chat + ')'), "\n"));
            }
        }

        // Filter Bot & Ban
        if (m.isBot) return
        if (db.users[m.sender]?.ban && !isCreator) return

        // Cmd Media
        let fileSha256;
        if (m.isMedia && m.msg.fileSha256 && db.cmd && (m.msg.fileSha256.toString('base64') in db.cmd)) {
            let hash = db.cmd[m.msg.fileSha256.toString('base64')]
            fileSha256 = hash.text
        }

        // AFK
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
        for (let jid of mentionUser) {
            let user = db.users[jid]
            if (!user) continue
            let afkTime = user.afkTime
            if (!afkTime || afkTime < 0) continue
            let reason = user.afkReason ? `_Reason: ${user.afkReason}_\n` : ''
            let duration = Func.clockString(new Date - afkTime)
            m.reply(`\n_@${jid.split('@')[0]} is currently AFK_\n` + reason + `_Duration: ${duration}_\n`);
        }

        if (db.users[m.sender].afkTime > -1) {
            let user = db.users[m.sender]
            let duration = Func.clockString(new Date - user.afkTime)
            m.reply(`\n_Welcome back @${m.sender.split('@')[0]}!_\n` + (user.afkReason ? `_You were AFK for:_ *${user.afkReason}*\n` : '') + `_Duration: ${duration}_\n`);
            user.afkTime = -1
            user.afkReason = ''
        }

        switch (fileSha256 || command) {
            case '19rujxl1e': {
                console.log('.')
            }
                break
            case 'ban': {
                if (!conn.public) return;
                if (!isCreator) return;
                let userr = (m.quoted ? m.quoted.sender : null);
                if (!userr) return m.reply('User?');
                if (!db.users[userr]) db.users[userr] = { ban: false };
                db.users[userr].ban = true;
                await m.reply(`@${userr.split('@')[0]} has been *banned* from using bot.`, { mentions: [userr] });
            }
                break;
            case 'unban': {
                if (!conn.public) return;
                if (!isCreator) return;
                let userr = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
                if (!userr) return m.reply('User?');
                if (!db.users[userr]) db.users[userr] = { ban: false };
                db.users[userr].ban = false;
                await m.reply(`@${userr.split('@')[0]} has been *unbanned*.`, { mentions: [userr] });
            }
                break;
            case 'shutdown': {
                if (!isCreator) return;
                await m.reply(`*Shutting Down...*`).then(() => { process.exit(0) })
            }
                break
            case 'join': {
                if (!isCreator) return;
                if (!text) return m.reply('Link?')
                if (!Func.isUrl(args[0]) && !args[0].includes('whatsapp.com')) return m.reply('_Invalid link!_')
                const result = args[0].split('https://chat.whatsapp.com/')[1]
                m.reply(mess.wait)
                await conn.groupAcceptInvite(result).catch((res) => {
                    switch (res.data) {
                        case 400: return m.reply('_Group not found!_');
                        case 401: return m.reply('_Bot was kicked from that group!_');
                        case 409: return m.reply('_Bot is already in that group!_');
                        case 410: return m.reply('_Group URL has been reset!_');
                        case 500: return m.reply('_Group is full!_');
                        default: return m.reply('_Error!_');
                    }
                });
            }
                break
            case 'leave': {
                if (!isCreator) return;
                await conn.groupLeave(m.chat);
            }
                break
            case 'clearchat': {
                if (!isCreator) return;
                await conn.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }] }, m.chat).catch((e) => m.reply('Error!'))
            }
                break
            case 'getmsgstore':
            case 'storemsg': {
                if (!isCreator) return;
                let [teks1, teks2] = text.split`|`
                if (teks1 && teks2) {
                    const msgnya = await store.loadMessage(teks1, teks2)
                    if (msgnya?.message) await conn.relayMessage(m.chat, msgnya.message, {})
                    else m.reply('Message Not Found!')
                } else m.reply(`Example: ${prefix + command} 123xxx@g.us|3EB0xxx`)
            }
                break
            case 'block': {
                if (!isCreator) return;
                if (text || m.quoted) {
                    const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
                    await conn.updateBlockStatus(numbersOnly, 'block').then((a) => m.reply(mess.done)).catch((err) => m.reply('Error!'))
                } else m.reply(`_Reply to a person or mention_`)
            }
                break
            case 'unblock': {
                if (!isCreator) return;
                if (text || m.quoted) {
                    const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
                    await conn.updateBlockStatus(numbersOnly, 'unblock').then((a) => m.reply(mess.done)).catch((err) => m.reply('Error!'))
                } else m.reply(`_Reply to a person or mention_`)
            }
                break
            case 'addowner': {
                if (!isCreator) return;
                if (!text || isNaN(text)) return m.reply(`_Tag/send Number!_`)
                const nmrnya = text.replace(/[^0-9]/g, '')
                const onWa = await conn.onWhatsApp(nmrnya)
                if (!onWa.length > 0) return m.reply('_Number not on WhatsApp!_')
                if (db?.set?.[botNumber]?.owner) {
                    if (db.set[botNumber].owner.find(a => a.id === nmrnya)) return m.reply('_Already owner._')
                    db.set[botNumber].owner.push({ id: nmrnya, lock: false });
                }
                m.reply('_Success!_');
            }
                break
            case 'addcase': {
                if (!isCreator) return;
                if (!text && !text.startsWith('case')) return m.reply('_Invalid!_')
                fs.readFile('LoRD.js', 'utf8', (err, data) => {
                    if (err) return;
                    const posisi = data.indexOf("case '19rujxl1e':");
                    if (posisi !== -1) {
                        const codeBaru = data.slice(0, posisi) + '\n' + `${text}` + '\n' + data.slice(posisi);
                        fs.writeFile('LoRD.js', codeBaru, 'utf8', (err) => { if (err) { m.reply('_Error while writing the file_') } else m.reply('_Case added successfully_') });
                    } else m.reply('_Error adding case!_');
                });
            }
                break
            case 'getcase': {
                if (!isCreator) return m.reply(mess.owner)
                if (!text) return;
                try {
                    const getCase = (cases) => {
                        return "case" + `'${cases}'` + fs.readFileSync("LoRD.js").toString().split('case \'' + cases + '\'')[1].split("break")[0] + "break"
                    }
                    m.reply(`${getCase(text)}`)
                } catch (e) {
                    m.reply(`_case ${text} not found!_`)
                }
            }
                break
            case 'delcase': {
                if (!isCreator) return m.reply(mess.owner)
                if (!text) return;
                fs.readFile('LoRD.js', 'utf8', (err, data) => {
                    if (err) return;
                    const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
                    const modifiedData = data.replace(regex, '');
                    fs.writeFile('LoRD.js', modifiedData, 'utf8', (err) => { if (err) { m.reply('_Error while writing the file_') } else m.reply('_Case removed successfully_') });
                });
            }
                break
            case 'add': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
                    try {
                        await conn.groupParticipantsUpdate(m.chat, [numbersOnly], 'add').then(async (res) => {
                            for (let i of res) {
                                let invv = await conn.groupInviteCode(m.chat)
                                const statusMessages = {
                                    200: `Successfully added @${numbersOnly.split('@')[0]} to the group!`,
                                    401: 'Blocked!',
                                    409: 'Already joined!',
                                    500: 'Group is full!'
                                };
                                if (statusMessages[i.status]) {
                                    return m.reply(statusMessages[i.status]);
                                } else if (i.status == 408) {
                                    await m.reply(`@${numbersOnly.split('@')[0]} Just Left This Group!\n\nBecause the userr is Private\n\nInvitations Will Be Sent To\n-> wa.me/${numbersOnly.replace(/\D/g, '')}\nVia Private`)
                                    await m.reply(`${'https://chat.whatsapp.com/' + invv}\n------------------------------------------------------\n\nAdmin: @${m.sender.split('@')[0]}\nInviting you to this group.`, {
                                        detectLink: true,
                                        chat: numbersOnly,
                                        quoted: qcont
                                    }).catch((err) => m.reply('Error Sending Invitation!'))
                                } else if (i.status == 403) {
                                    let a = i.content.content[0].attrs
                                    await conn.sendGroupInvite(m.chat, numbersOnly, a.code, a.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nInviting you to this group.\nPlease join if you wish🙇`, null, {
                                        mentions: [m.sender]
                                    })
                                    await m.reply(`@${numbersOnly.split('@')[0]} Cannot Be Added\n\nBecause the userr is Private\n\nInvitations Will Be Sent To\n-> wa.me/${numbersOnly.replace(/\D/g, '')}\nVia Private`)
                                } else m.reply('_Error Adding User_\nStatus : ' + i.status)
                            }
                        })
                    } catch (e) {
                        m.reply('_Error Adding User_')
                    }
                } else m.reply(`Example: ${prefix + command} 91xxx`)
            }
                break
            case 'kick': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
                    await conn.groupParticipantsUpdate(m.chat, [numbersOnly], 'remove').catch((err) => m.reply('_Error!_'))
                } else m.reply(`Example: ${prefix + command} 91xxx`)
            }
                break
            case 'promote': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
                    await conn.groupParticipantsUpdate(m.chat, [numbersOnly], 'promote').catch((err) => m.reply('_Error!_'))
                } else m.reply(`Example: ${prefix + command} 91xxx`)
            }
                break
            case 'demote': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
                    await conn.groupParticipantsUpdate(m.chat, [numbersOnly], 'demote').catch((err) => m.reply('_Error!_'))
                } else m.reply(`Example: ${prefix + command} 91xxx`)
            }
                break
            case 'delete':
            case 'del': {
                if (!m.quoted) return m.reply('_Reply to the message!_')
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: m.isBotAdmin ? false : true, id: m.quoted.id, participant: m.quoted.sender } });
            }
                break
            case 'invite': {
                if (!m.isGroup);
                if (!m.isAdmin);
                if (!m.isBotAdmin);
                let response = await conn.groupInviteCode(m.chat)
                await m.reply(`\n_https://chat.whatsapp.com/${response}_\n`, { detectLink: true });
            }
                break
            case 'revoke': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                await conn.groupRevokeInvite(m.chat).then((a) => m.reply(`_Success!_`)).catch((err) => m.reply('Error!'));
            }
                break
            case 'totalcmds': {
                m.reply(Func.totalcmd());
            }
                break
            case 'ping': {
                let t1 = Date.now();
                let fek = await conn.sendMessage(m.chat, { text: "_Pinging..._" }, { quoted: m });
                await m.edit(`*Pong!*\n${Date.now() - t1}ms`, fek);
            }
                break;
            case 'vv': {
                if (!m.quoted) return m.reply(`_Reply to a view once message_`)
                try {
                    if (m.quoted.msg.viewOnce) {
                        delete m.quoted.chat
                        m.quoted.msg.viewOnce = false
                        await m.reply({ forward: m.quoted })
                    } else m.reply(`_Reply view once message_`)
                } catch (e) {
                    m.reply('_Invalid Media!_')
                }
            }
                break
            case 'afk': {
                let user = db.users[m.sender]
                user.afkTime = + new Date
                user.afkReason = text
                m.reply(`@${m.sender.split('@')[0]} AFK${text ? ': ' + text : ''}`)
            }
                break
            case 'addmsg': {
                if (!m.quoted || !text) return m.reply('_Reply to the message with a name you want to save_');
                let msgs = db.database;
                let key = text.toLowerCase();
                if (key in msgs) return m.reply(`_'${text}' is already registered in the message list._`);
                msgs[key] = { ...m.quoted };
                delete msgs[key].chat;
                m.reply(`_Successfully added message as '${text}'_\nAccess with: ${prefix}getmsg ${text}\nView list with: ${prefix}listmsg`);
            }
                break;
            case 'delmsg': {
                if (!text) return m.reply('_Message do you want to delete?_');
                let msgs = db.database;
                let key = text.toLowerCase();
                if (key === 'allmsg') {
                    db.database = {};
                    return m.reply('_Deleted all messages._');
                }
                if (!(key in msgs)) return m.reply(`_'${text}' is not in the message list._`);
                delete msgs[key];
                m.reply(`_Removed '${text}' from the message list._`);
            }
                break;
            case 'getmsg': {
                if (!text) return m.reply(`_Example: ${prefix + command} name_\n\nView the message list with: ${prefix}listmsg`);
                let msgs = db.database;
                let key = text.toLowerCase();
                if (!(key in msgs)) return m.reply(`_'${text}' is not in the message list._`);
                await conn.relayMessage(m.chat, msgs[key], {});
            }
                break;
            case 'listmsg': {
                let entries = Object.entries(db.database).map(([name, msg]) => ({ name, type: getContentType(msg)?.replace(/Message/i, '') || 'Unknown' }));
                if (entries.length === 0) return m.reply('_The message list is empty._');
                let teks = '「 MESSAGE LIST 」\n\n';
                for (let i of entries) {
                    teks += `${listv} *Name:* ${i.name}\n${listv} *Type:* ${i.type}\n───────────────\n`;
                }
                m.reply(teks);
            }
                break;
            case 'setcmd': {
                if (!m.quoted) return m.reply('_Reply to message!_')
                if (!m.quoted.fileSha256) return m.reply('_SHA256 Hash Missing!_')
                if (!text) return m.reply(`_Example : ${prefix + command} CMD Name_`)
                let hash = m.quoted.fileSha256.toString('base64')
                if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('_You have no permission to change this sticker command!_')
                global.db.cmd[hash] = { creator: m.sender, locked: false, at: +new Date, text }
                m.reply('_Done!_')
            }
                break
            case 'delcmd': {
                if (!m.quoted) return m.reply('_Reply to the message!_')
                if (!m.quoted.fileSha256) return m.reply('_SHA256 Hash Missing!_')
                let hash = m.quoted.fileSha256.toString('base64')
                if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('_You have no permission to change this sticker command!_')
                delete global.db.cmd[hash];
                m.reply('_Done!_')
            }
                break
            case 'listcmd': {
                let teks = `*CMD LIST - HASH*\n\n*INFO:* *Bold hash is Locked*\n${Object.entries(global.db.cmd).map(([key, value], index) => `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`).join('\n')}`.trim()
                await sendText(teks);
            }
                break
            case 'lockcmd':
            case 'unlockcmd': {
                if (!isCreator) return;
                if (!m.quoted) return m.reply('_Reply to the message!_')
                if (!m.quoted.fileSha256) return m.reply('_SHA256 Hash Missing!_')
                let hash = m.quoted.fileSha256.toString('base64')
                if (!(hash in global.db.cmd)) return m.reply('_You have no permission to change this sticker command!_')
                global.db.cmd[hash].locked = !/^un/i.test(command)
            }
                break
            case 'warn': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (!db.groups[m.chat]) db.groups[m.chat] = {};
                if (!db.groups[m.chat].warn) db.groups[m.chat].warn = {};
                if (text || m.quoted) {
                    const target = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    if (!db.groups[m.chat].warn[target]) {
                        db.groups[m.chat].warn[target] = 1;
                        m.reply('_Warning 1/4!_');
                    }
                    else if (db.groups[m.chat].warn[target] >= 3) {
                        await conn.groupParticipantsUpdate(m.chat, [target], 'remove').catch(() => m.reply('_Error!_'));
                        delete db.groups[m.chat].warn[target];
                    }
                    else {
                        db.groups[m.chat].warn[target] += 1;
                        m.reply(`_Warning ${db.groups[m.chat].warn[target]}/4!_`);
                    }
                } else {
                    m.reply(`_Reply to any user!_`);
                }
            }
                break;
            case 'unwarn': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (!db.groups[m.chat]) db.groups[m.chat] = {};
                if (!db.groups[m.chat].warn) db.groups[m.chat].warn = {};
                if (text || m.quoted) {
                    const target = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    if (db.groups[m.chat].warn[target]) {
                        db.groups[m.chat].warn[target] -= 1;
                        if (db.groups[m.chat].warn[target] <= 0) {
                            delete db.groups[m.chat].warn[target];
                            m.reply('_All warnings cleared!_');
                        } else {
                            m.reply(`_Removed 1 warning._ \n*Current: ${db.groups[m.chat].warn[target]}/4*`);
                        }
                    } else {
                        m.reply('_user have no warnings_');
                    }
                } else {
                    m.reply(`_Reply to any user!_`);
                }
            }
                break;
            case 'delwarn': {
                if (!m.isGroup) return;
                if (!m.isAdmin) return;
                if (!m.isBotAdmin) return;
                if (!db.groups[m.chat]) db.groups[m.chat] = {};
                if (!db.groups[m.chat].warn) db.groups[m.chat].warn = {};
                if (text || m.quoted) {
                    const target = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    if (db.groups[m.chat]?.warn?.[target]) {
                        delete db.groups[m.chat].warn[target];
                        m.reply('_Removed all warnings!_');
                    }
                } else {
                    m.reply(`_Reply to any user!_`);
                }
            }
                break;
            case 'q':
            case 'quoted': {
                if (!m.quoted) return m.reply('_Reply to a message!_')
                if (text) {
                    delete m.quoted.chat
                    await m.reply({ forward: m.quoted })
                } else {
                    const anu = await m.getQuotedObj()
                    if (!anu) return m.reply('_Not Available!_')
                    if (!anu.quoted) return m.reply('_The message you replied to does not contain a reply._')
                    await conn.relayMessage(m.chat, { [anu.quoted.type]: anu.quoted.msg }, {})
                }
            }
                break
            case "get": {
                if (!text) return m.reply(`_Enter url!_`);
                try {
                    const gt = await axios.get(text, {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            Referer: "https://www.google.com/",
                            "Referrer-Policy": "strict-origin-when-cross-origin",
                            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                        },
                        responseType: "arraybuffer"
                    });
                    const contentType = gt.headers["content-type"];
                    if (/json/i.test(contentType)) {
                        const jsonData = JSON.parse(Buffer.from(gt.data, "binary").toString("utf8"));
                        return m.reply(JSON.stringify(jsonData, null, 2));
                    } else if (/text/i.test(contentType)) {
                        const textData = Buffer.from(gt.data, "binary").toString("utf8");
                        return m.reply(textData);
                    } else if (text.includes("webp")) {
                        return conn.sendMessage(m.chat, { sticker: { url: text } }, { quoted: m });
                    } else if (/image/i.test(contentType)) {
                        return m.reply({ image: { url: text } }, { quoted: m });
                    } else if (/video/i.test(contentType)) {
                        return m.reply({ video: { url: text } }, { quoted: m });
                    } else if (/audio/i.test(contentType) || text.includes(".mp3")) {
                        return m.reply({ audio: { url: text } }, { quoted: m });
                    } else if (/application\/zip/i.test(contentType) || /application\/x-zip-compressed/i.test(contentType)) {
                        return m.reply({ document: { url: text }, fileName: ``, mimetype: text }, { quoted: m });
                    } else if (/application\/pdf/i.test(contentType)) {
                        return m.reply({ document: { url: text }, fileName: ``, mimetype: text }, { quoted: m });
                    } else {
                        return m.reply(`\nMIME : ${contentType}\n\n${gt.data}\n`);
                    }
                } catch (error) {
                    console.error(error);
                    m.reply("_Error!_");
                }
            }
                break
            case 'p': {
                if (!isCreator) return;
                if (!/^https?:\/\//.test(text)) return m.reply('_Start with https://_');
                try {
                    const proxy = `https://lordx.koyeb.app/api/pvt/proxy/get?url=${encodeURIComponent(Func.isUrl(text) ? Func.isUrl(text)[0] : text)}`;
                    const res = await axios.get(proxy)
                    if (!/text|json|html|plain/.test(res.headers['content-type'])) {
                        await m.reply(text)
                    } else m.reply(util.format(res.data))
                } catch (e) {
                    m.reply(String(e))
                }
            }
                break
            case 'ptv': {
                if (!/video/.test(mime)) return m.reply(`_Send/Reply to the Video You Want to Make into a PTV Message with a Caption_`)
                if ((m.quoted ? m.quoted.type : m.type) === 'videoMessage') {
                    const anu = await quoted.download()
                    const message = await baileys.generateWAMessageContent({ video: anu }, { upload: conn.waUploadToServer })
                    await conn.relayMessage(m.chat, { ptvMessage: message.videoMessage }, {})
                } else m.reply('_Reply to the video that you want to convert!_')
            }
                break
            case 'toqr': {
                if (!text) return m.reply(`_Change Text to Qr with *${prefix + command}* text_`)
                m.reply(mess.wait)
                await m.reply({ image: { url: 'https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=' + text }, caption: '' })
            }
                break
            case 'readmore': {
                let teks1 = text.split`|`[0] ? text.split`|`[0] : ''
                let teks2 = text.split`|`[1] ? text.split`|`[1] : ''
                m.reply(teks1 + readmore + teks2)
            }
                break
            case 'photo': {
                if (!/sticker|webp/.test(quoted.type)) return m.reply("_Reply to a sticker!_");
                await m.reply({ image: await m.quoted.download() })
            }
                break
            case 'getexif': {
                if (!m.quoted) return m.reply(`_Reply to a sticker_`)
                if (!/sticker|webp/.test(quoted.type)) return m.reply(`_Reply to a sticker_`)
                const img = new webp.Image()
                await img.load(await m.quoted.download())
                m.reply(util.format(JSON.parse(img.exif.slice(22).toString())))
            }
                break
            case 'sticker': {
                if (!/image|video|sticker/.test(quoted.type)) return m.reply(`_Send/Reply to image/video/gif\nVideo/Gif Duration 1-9 Seconds_`)
                let media = await quoted.download()
                let teks1 = text.split`|`[0] ? text.split`|`[0] : packname
                let teks2 = text.split`|`[1] ? text.split`|`[1] : author
                if (/image|webp/.test(mime)) {
                    await conn.sendSticker(m.chat, media, m, { packname: teks1, author: teks2 })
                } else if (/video/.test(mime)) {
                    if ((qmsg).seconds > 11) return m.reply('_Max 10 sec!_')
                    await conn.sendSticker(m.chat, media, m, { packname: teks1, author: teks2 })
                } else m.reply(`_Send/Reply to image/video/gif with caption ${prefix + command}\nVideo/Gif Duration 1-9 Seconds_`)
            }
                break
            case 'bass':
            case 'deep':
            case 'fast':
            case 'nightcore':
            case 'reverse':
            case 'slow': {
                const ffpth = require("@ffmpeg-installer/ffmpeg").path;
                try {
                    let set;
                    if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20'
                    if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3'
                    if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
                    if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25'
                    if (/reverse/.test(command)) set = '-filter_complex "areverse"'
                    if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
                    if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'
                    if (/audio/.test(mime)) {
                        let media = await conn.downloadAndSaveMediaMessage(qmsg)
                        let ran = `./database/temp/${Func.getRandom('.mp3')}`;
                        exec(`${ffpth} -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
                            fs.unlinkSync(media)
                            if (err) return m.reply(err)
                            let buff = fs.readFileSync(ran)
                            m.reply({
                                audio: buff,
                                mimetype: 'audio/mpeg'
                            })
                            fs.unlinkSync(ran)
                        });
                    } else m.reply(`_Reply to a audio with *${prefix + command}*_`)
                } catch (e) {
                    console.log(e)
                    m.reply('_Error!_')
                }
            }
                break
            case 'gitclone': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} https://github.com/Lord-official/LoRD-MD`)
                if (!Func.isUrl(args[0]) && !args[0].includes('github.com')) return m.reply('Not a github url!')
                let [, user, repo] = args[0].match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || []
                try {
                    m.reply({ document: { url: `https://api.github.com/repos/${user}/${repo}/zipball` }, fileName: repo + '.zip', mimetype: 'application/zip' }).catch((e) => m.reply(mess.error))
                } catch (e) {
                    m.reply('_Error!_')
                }
            }
                break
            case 'npmjs': {
                if (!text) return m.reply(`Example: ${prefix + command} axios`)
                try {
                    let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`)
                    let { objects } = await res.json()
                    if (!objects.length) return m.reply('_Not found_')
                    let txt = objects.map(({ package: pkg }) => {
                        return `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`
                    }).join`\n\n`
                    m.reply(txt)
                } catch (e) {
                    m.reply('_Not found_')
                }
            }
                break
            case 'tomp3': {
                if (!/video|audio/.test(mime)) return m.reply(`_Reply to Audio/video_`)
                let media = await quoted.download();
                let audio = await toAudio(media, 'mp4')
                await m.reply({ audio: audio, mimetype: 'audio/mpeg', fileName: `${text}.mp3` || "song.mp3" })
            }
                break
            case 'delsession': {
                if (!isCreator) return;
                fs.readdir('./session', async function (err, files) {
                    if (err) return m.reply(err);
                    let filteredArray = await files.filter(item => ['session-', 'pre-key', 'sender-key', 'app-state'].some(ext => item.startsWith(ext)));
                    let teks = `Detected ${filteredArray.length} files\n\n`
                    if (filteredArray.length == 0) return m.reply(teks);
                    filteredArray.map(function (e, i) {
                        teks += (i + 1) + `. ${e}\n`
                    })
                    if (text && text == 'true') {
                        let { key } = await m.reply('Deleting Files..')
                        await filteredArray.forEach(function (file) {
                            fs.unlinkSync('./session/' + file)
                        });
                        Func.sleep(2000)
                        m.reply('Done!', { edit: key })
                    } else m.reply(teks + `\nType _${prefix + command} true_\nTo Delete`)
                });
            }
                break
            case 'insta': {
                if (!Func.isUrl(text)) return m.reply(`_Url?_`);
                try {
                    const res = await API.get("media.ig", { url: text });
                    const result = res.result;
                    if (!result.url.length === 0) return await m.reply("_Not Found!_");
                    if (result.url.length > 1) {
                        const album = await Promise.all(
                            result.url.map(async (mediaUrl) => {
                                const { type, url } = await Func.getTypeUrlMedia(mediaUrl);
                                if (type.startsWith("image/")) {
                                    return { image: { url }, mimetype: type };
                                } else if (type.startsWith("video/")) {
                                    return { video: { url }, mimetype: type };
                                }
                            })
                        );
                        const aalbum = album.filter(Boolean);
                        return await conn.sendAlbum(m.chat, { album: aalbum });
                    } else {
                        return await conn.sendFile(m.chat, result.url[0] || result.url || res.url, "", m);
                    }
                } catch (e) {
                    console.error(e);
                    m.reply('_Retrying..._');
                    try {
                        const { result } = await API.get("media.ig", { url: text });
                        await conn.sendFile(m.chat, result.url, "", m);
                    } catch (err) {
                        m.reply('_Error!_');
                    }
                }
            }
                break;
            case 'play':
            case 'yta':
            case 'song': {
                if (!text) return m.reply(`_Enter query!_`);
                const res = await yts(text);
                const video = res.videos[0];
                if (!video) throw new Error("No video found!");
                const { title, url, views, ago, thumbnail, author } = video;
                await sendText(`*Downloading ${title}...*`)
                const { result } = await API.get("media.yt", { url });
                const thumb = Buffer.from((await axios.get(thumbnail, { responseType: "arraybuffer" })).data);
                const msgg = {
                    document: { url: result.url }, mimetype: "audio/mp3", fileName: `${title}.mp3`, contextInfo: {
                        externalAdReply: { title: ``, body: `${Func.frmtView(views)} views • ${ago}`, sourceUrl: "", mediaUrl: "", mediaType: 1, renderLargerThumbnail: true, thumbnail: thumb, thumbnailUrl: "" }
                    }
                };
                await conn.sendMessage(m.chat, msgg);
            }
                break;
            case 'story': {
                if (!Func.isUrl(text)) return m.reply(`\n_Enter url!_\n`);
                try {
                    const res = await API.get("media.story", { url: text });
                    const result = res.result;
                    if (!Array.isArray(result) || result.length === 0) return m.reply("_Not Found!_");
                    await conn.sendFile(m.chat, result[0].url, "", m);
                } catch (e) {
                    console.error(e);
                    m.reply('_Error!_');
                }
            }
                break;
            case 'spotify': {
                if (!text) return m.reply(`_Enter query!_`);
                try {
                    const { result } = await API.get("media.spotify", { q: text });
                    if (!result || result.length === 0) return m.reply('_No results found!_');
                    const cap = result.map((song, index) => `──────────────────\n*No:* ${index + 1}\n*Title:* ${song.title}\n*Artist:* ${song.artist}\n*Duration:* ${song.duration}\n*Url:* ${song.url}`).join('\n\n');
                    const thumb = Buffer.from((await axios.get(result[0].thumbnail, { responseType: "arraybuffer" })).data);
                    return await m.reply({ image: thumb, caption: cap.trim() });
                } catch (e) {
                    console.error(e);
                    m.reply('_Error!_');
                }
            }
                break;
            case 'spotifydl': {
                if (!Func.isUrl(text)) return m.reply(`_Example: ${prefix + command} https://open.spotify.com/track/ABCD_`)
                if (!Func.isUrl(text) && !args[0].includes('open.spotify.com/track')) return m.reply('_Url Invalid!_')
                try {
                    const { result } = await API.get("media.spotify", { url: text });
                    const thumb = Buffer.from((await axios.get(result.thumb, { responseType: "arraybuffer" })).data);
                    const msgg = {
                        document: { url: result.url }, mimetype: "audio/mp3", fileName: `${result.title}.mp3`, contextInfo: {
                            externalAdReply: { title: ``, body: `${result.artist} • ${result.duration}`, sourceUrl: "", mediaUrl: "", mediaType: 1, renderLargerThumbnail: true, thumbnail: thumb, thumbnailUrl: "" },
                        },
                    };
                    await conn.sendMessage(m.chat, msgg);
                } catch (e) {
                    console.log(e)
                    m.reply('_Error!_')
                }
            }
                break
            case 'pinterest': {
                if (!text) return m.reply('_Enter query!_')
                let [query, count] = text.split('|')
                query = query?.trim()
                count = parseInt(count) || 6
                const ress = await API.get("media.pin", { q: query });
                if (Array.isArray(ress.result) && ress.result.length > 1) {
                    const imgc = Math.min(count, ress.result.length, 10)
                    const mixx = ress.result.sort(() => 0.5 - Math.random())
                    const random = mixx.slice(0, imgc)
                    const album = random.map(url => ({ image: { url } }))
                    await conn.sendAlbum(m.chat, { album }, { quoted: m });
                } else {
                    m.reply('_Error!_')
                }
            }
                break;
            case 'lyrics': {
                if (!text) return m.reply(`\n_Enter query!_\n`);
                try {
                    const { result } = await API.get("media.lyrics", { q: text });
                    if (!Array.isArray(result) || result.length === 0) return m.reply("_Not Found!_");
                    let three = result.slice(0, 3);
                    let buttons = three.map((song, i) => ({ buttonId: `${prefix}getlyrics ${song.url}`, buttonText: { displayText: `${i + 1}. ${song.title} - (${Func.minToSec(song.duration)})` }, type: 1 }));
                    let caption = `\n*Matching Results for:* ${text}\n`
                    await conn.sendButton(m.chat, { text: caption, footer: "LoRDx", buttons }, { quoted: m });
                } catch (e) {
                    console.error(e);
                    m.reply('_Error!_');
                }
            }
                break;
            case 'getlyrics': {
                if (!text) return;
                try {
                    const { result } = await Func.fetchJson(text);
                    await conn.sendMessage(m.chat, { text: result.lyrics, contextInfo: { externalAdReply: { title: `${result.title} - ${result.artist}`, mediaType: 1 } } });
                } catch (e) {
                    console.log(e);
                    m.reply('_Error!_');
                }
            }
                break;
            case 'gpt': {
                if (!text) return m.reply("_Enter text!_");
                const { result } = await API.get("ai.gpt", { q: text });
                await replay(result, "ChatGPT", "https://files.catbox.moe/8zkrmz.png");
            }
                break;
            case 'gemini': {
                if (!text) return m.reply("_Enter text!_");
                const { result } = await API.get("ai.gemini", { q: text });
                await replay(result, "Gemini", "https://files.catbox.moe/7mssif.png");
            }
                break;
            case 'find': {
                if (!m.quoted) return m.reply("_Reply to an audio or image!_");
                if (/video|audio/.test(mime)) {
                    try {
                        const audioBuffer = await m.quoted.download();
                        const audbuf = await CUT(audioBuffer, '00:00:01', '00:00:15', 'mp4');
                        const result = await Func.acrCloud(audbuf);
                        if (result.status.code === 0 && result.metadata?.music?.length > 0) {
                            const music = result.metadata.music[0];
                            const artists = music.artists?.map(artist => artist.name).join(", ");
                            const album = music.album?.name;
                            let cappp = `\n*Song Found!*\n\n`;
                            cappp += `*Title:* ${music.title}\n`;
                            if (artists) cappp += `*Artist:* ${artists}\n`;
                            if (album) cappp += `*Album:* ${album}\n`;
                            await m.reply(cappp);
                        } else {
                            await m.reply("_EErr!_");
                        }
                    } catch (err) {
                        console.error(err.response?.data || err.message);
                        await m.reply("_Error!_");
                    }
                } else if (/image/.test(mime)) {
                    try {
                        let res = await API.post("anime.find", await m.quoted.download());
                        const similarity = (res.similarity * 100).toFixed(2);
                        let capp = `\n*Anime Found!*\n*${similarity}% match*\n\n*Name:* ${res.info.name}\n*Type:* ${res.info.type}\n*Episodes:* ${res.info.episodes}\n*Status:* ${res.info.status}\n`;
                        await m.reply({ image: { url: res.info.image }, caption: capp });
                    } catch (e) {
                        console.error(e);
                        m.reply("_Error!_");
                    }
                } else m.reply("_Reply to audio/video or an image!_");
            }
                break;
            case 'url': {
                if (!m.quoted) return;
                try {
                    const buff = await m.quoted.download();
                    const fName = m.quoted.message?.fileName || `${Date.now()}`;
                    const res = await Func.gdrive(buff, fName);
                    await m.reply(`\n*URL:* ${res.url}\n*Size:* ${res.size}\n`);
                } catch (e) {
                    m.reply('_Error!_')
                }
            }
                break;
            case 'rmbg': {
                if (/image/.test(mime)) {
                    try {
                        const buff = await m.quoted.download();
                        await m.reply({ image: await Func.rmbg(buff) });
                    } catch (e) {
                        m.reply('_Error!_')
                    }
                } else m.reply("_Reply to an image!_")
            }
                break;
            case 'lens': {
                if (/image/.test(mime)) {
                    try {
                        const buff = await m.quoted.download();
                        const { url } = await Func.gdrive(buff, `${Date.now()}`);
                        const res = await API.get("tools.gLens", { url });
                        await conn.sendCarousel(m.chat, "ㅤ", "*results:*",
                            res.result.map(res => ({
                                url: res.image,
                                body: `\n*${res.no}. ${res.title}*\n\n*${res.link}*`,
                                footer: res.source,
                                buttons: []
                            }))
                        );
                    } catch (e) {
                        console.log(e)
                        m.reply('_Error!_')
                    }
                } else m.reply("_Reply to an image!_")
            }
                break;
            case 'ytv': {
                if (!text) return m.reply("_Enter url/query!_");
                let [urll, qty] = text.split(',').map(v => v.trim());
                qty = qty || "360";
                let video;
                if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(urll)) {
                    video = { url: urll };
                } else {
                    const res = await yts(urll);
                    video = res.all[0];
                }
                if (!video?.url) return m.reply("_Not Found!_");
                const { title = "video", url } = video;
                await sendText(`*Downloading ${title}...*`);
                try {
                    const { result } = await API.get("media.yt", { url, q: qty });
                    if (!result?.url) return m.reply("_url not found!_");
                    await conn.sendMessage(m.chat, {
                        document: { url: result.url },
                        mimetype: "video/mp4",
                        fileName: `${result.title}.mp4`
                    }, { quoted: m }
                    );
                } catch (e) {
                    console.error(e);
                    m.reply("_Error!_");
                }
            }
                break;
            case 'menu': {
                let menuMessage = "\t\t\t*INFO*\n\n";
                menuMessage += `◦ *USER:* ${m.pushName ? m.pushName : ''}\n`;
                menuMessage += `◦ *WORK TYPE:* ${conn.public ? 'Public' : 'Private'}\n`;
                menuMessage += `◦ *VERSION:* ${require("./package.json").version}\n`;
                menuMessage += `◦ *TOTAL PLUGINS:* 58\n`;
                menuMessage += `◦ *UPTIME:* ${Func.runtime(process.uptime())}\n`;
                menuMessage += `◦ *MEMORY USAGE:* ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\n`;
                menuMessage += `◦ *HOSTNAME:* ${require("os").hostname()}\n\n`;
                menuMessage += `${readmore}`;
                menuMessage += require("./src/menu");
                const imageBuffer = await Func.createN(`HI ${m.pushName}!`);
                const buttonMessage = {
                    image: imageBuffer, caption: menuMessage, footer: "LoRDx", headerType: 4, contextInfo: {
                        externalAdReply: { title: "", body: "", sourceUrl: "", mediaUrl: "", mediaType: 1, showAdAttribution: true, renderLargerThumbnail: true, thumbnailUrl: "https://drive.google.com/uc?id=191CL6-SG793yj9hgJAIQeH6xFvldYjMC&export=download" }
                    },
                };
                await conn.sendMessage(m.chat, buttonMessage, { mentions: [m.sender] });
            }
                break;
            default:
                if (budy.startsWith('<e')) {
                    if (!isAllowed) return
                    try {
                        let evaled = await eval(`(async () => { return ${budy.slice(2)} })()`)
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        await sendText(evaled)
                    } catch (err) {
                        await sendText(String(err))
                    }
                }
                if (budy.startsWith('e>')) {
                    if (!isAllowed) return
                    try {
                        let evaled = await eval(`(async () => { ${budy.slice(2)} })()`)
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        await sendText(evaled)
                    } catch (err) {
                        await sendText(String(err))
                    }
                }
                if (budy.startsWith('e$')) {
                    if (!isAllowed) return
                    if (!text) return
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(`${err}`)
                        if (stdout) return m.reply(stdout)
                    })
                }
                if (!isCmd && isCreator && budy?.toLowerCase()) {
                    if (m.chat.endsWith('broadcast')) return;
                    let key = budy.toLowerCase();
                    if (!(key in db.database)) return;
                    await conn.relayMessage(m.chat, db.database[key], {});
                }
        }

    } catch (e) {
        console.log(e);
        if (e?.message?.includes('No sessions')) return;
        const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || 'unknown_error';
        const now = Date.now();
        if (!errorCache[errorKey]) errorCache[errorKey] = [];
        errorCache[errorKey] = errorCache[errorKey].filter(ts => now - ts < 600000);
        if (errorCache[errorKey].length >= 3) return;
        errorCache[errorKey].push(now);
        m.reply('\nError: ' + (e?.name || e?.code || e?.output?.statusCode || e?.status || 'Unknown') + '\n')
        return conn.sendFromOwner(ownerNumber, `\nVersion : *${require('./package.json').version}*\n\n*Error:*\n\n` + util.format(e), m, {
            contextInfo: { isForwarded: true }
        });
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
});