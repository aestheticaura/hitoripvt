require('../settings');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const FileType = require('file-type');
const PhoneNumber = require('awesome-phonenumber');

const { writeExif } = require('../lib/exif');
const { getBuffer, getSizeMedia } = require('../lib/function');
const { jidNormalizedUser, proto, getBinaryNodeChildren, getBinaryNodeChildString, getBinaryNodeChild, generateMessageIDV2, jidEncode, encodeSignedDeviceIdentity, generateWAMessageContent, generateForwardMessageContent, prepareWAMessageMedia, delay, areJidsSameUser, extractMessageContent, generateMessageID, downloadContentFromMessage, generateWAMessageFromContent, jidDecode, generateWAMessage, toBuffer, getContentType, WAMessageStubType, getDevice } = require('baileys');

async function GroupUpdate(conn, m, store) {
	if (!m.messageStubType || !m.isGroup) return;
	if (global.db?.groups?.[m.chat] && store?.groupMetadata?.[m.chat] && conn.public) {
		const metadata = store.groupMetadata[m.chat];
		const normalizedTarget = m.messageStubParameters[0];
		if (m.messageStubType == 20) {
			store.groupMetadata[m.chat] = await conn.groupMetadata(m.chat).catch(() => ({}));
		} else if (m.messageStubType == 27) {
			if (!metadata.participants.some(a => a.id == normalizedTarget)) {
				metadata.participants.push(metadata.addressingMode === 'lid' ? { id: '', lid: normalizedTarget, admin: null } : { id: normalizedTarget, lid: '', admin: null });
			}
		}
		else if (m.messageStubType == 28 || m.messageStubType == 32) {
			if (m.fromMe && ((jidNormalizedUser(conn.user.id) == normalizedTarget) || (jidNormalizedUser(conn.user.lid) == normalizedTarget))) {
				delete store.messages[m.chat];
				delete store.presences[m.chat];
				delete store.groupMetadata[m.chat];
			}
			if (metadata) {
				metadata.participants = metadata.participants.filter((p) => {
					const key = metadata.addressingMode === 'lid' ? jidNormalizedUser(p.lid) : jidNormalizedUser(p.id);
					return key !== normalizedTarget;
				});
			}
		}
		else { console.log({ messageStubType: m.messageStubType, messageStubParameters: m.messageStubParameters, type: WAMessageStubType[m.messageStubType] }) }
	}
}

async function GroupParticipantsUpdate(conn, { id, participants, action }, store) {
	try {
		function updateAdminStatus(participants, metadataParticipants, status) {
			for (const participant of metadataParticipants) {
				if (participants.includes(jidNormalizedUser(participant.id)) || participants.includes(jidNormalizedUser(participant.lid))) {
					participant.admin = status;
				}
			}
		}
		if (global.db?.groups?.[id] && store?.groupMetadata?.[id]) {
			const metadata = store.groupMetadata[id];
			for (let n of participants) {
				const participant = metadata.participants.find(a => a.id == jidNormalizedUser(n))
				if (action === 'add') {
					if (!participant) metadata.participants.push({ ...(metadata.addressingMode === 'lid' ? { id: '', lid: jidNormalizedUser(n) } : { id: jidNormalizedUser(n), lid: '' }), admin: null });
				} else if (action === 'remove') {
					if ((jidNormalizedUser(conn.user.lid) == jidNormalizedUser(n)) || (jidNormalizedUser(conn.user.id) == jidNormalizedUser(n))) {
						delete store.messages[id];
						delete store.presences[id];
						delete store.groupMetadata[id];
					}
					if (metadata) metadata.participants = metadata.participants.filter(p => !participants.includes(metadata.addressingMode === 'lid' ? jidNormalizedUser(p.lid) : jidNormalizedUser(p.id)));
				} else if (action === 'promote') {
					updateAdminStatus(participants, metadata.participants, 'admin');
				} else if (action === 'demote') {
					updateAdminStatus(participants, metadata.participants, null);
				}
			}
		}
	} catch (e) {
		throw e;
	}
}

async function LoadDataBase(conn, m) {
	try {
		const botNumber = await conn.decodeJid(conn.user.id);
		let user = global.db.users[m.sender] || {};
		let setBot = global.db.set[botNumber] || {};
		global.db.users[m.sender] = user;
		global.db.set[botNumber] = setBot;
		const defaultSetBot = {
			public: false,
			readsw: false,
			autoread: false,
			grouponly: false,
			privateonly: false,
			multiprefix: false,
			author: global.author,
			botname: global.botname,
			packname: global.packname,
			owner: global.owner.map(id => ({ id, lock: true })),
		};
		for (let key in defaultSetBot) {
			if (!(key in setBot)) setBot[key] = defaultSetBot[key];
		}

		const defaultUser = {
			ban: false,
			afkTime: -1,
			afkReason: '',
		};
		for (let key in defaultUser) {
			if (!(key in user)) user[key] = defaultUser[key];
		}

		if (m.isGroup) {
			let group = global.db.groups[m.chat] || {};
			global.db.groups[m.chat] = group;
			const defaultGroup = {
				url: '',
				text: {},
				mute: false,
				leave: false,
				demote: false,
				promote: false,
			};
			for (let key in defaultGroup) {
				if (!(key in group)) group[key] = defaultGroup[key];
			}
		}

	} catch (e) {
		throw e
	}
}

async function MessagesUpsert(conn, message, store) {
	try {
		let botNumber = await conn.decodeJid(conn.user.id);
		const msg = message.messages[0];
		const remoteJid = msg.key.remoteJid;
		store.messages ??= {};
		store.messages[remoteJid] ??= {};
		store.messages[remoteJid].array ??= [];
		store.messages[remoteJid].keyId ??= new Set();
		if (!(store.messages[remoteJid].keyId instanceof Set)) {
			store.messages[remoteJid].keyId = new Set(store.messages[remoteJid].array.map(m => m.key.id));
		}
		if (store.messages[remoteJid].keyId.has(msg.key.id)) return;
		store.messages[remoteJid].array.push(msg);
		store.messages[remoteJid].keyId.add(msg.key.id);
		if (store.messages[remoteJid].array.length > (global.chatLength || 250)) {
			const removed = store.messages[remoteJid].array.shift();
			store.messages[remoteJid].keyId.delete(removed.key.id);
		}
		if (!store.groupMetadata || Object.keys(store.groupMetadata).length === 0) store.groupMetadata ??= await conn.groupFetchAllParticipating().catch(e => ({}));
		const type = msg.message ? (getContentType(msg.message) || Object.keys(msg.message)[0]) : '';
		const m = await Serialize(conn, msg, store)
		require('../LoRD')(conn, m, msg, store);
		if (db?.set?.[botNumber]?.readsw && msg.key.remoteJid === 'status@broadcast') { // If status-view (readsw) is enabled.
			await conn.readMessages([msg.key]);
			if (/protocolMessage/i.test(type)) {
				await conn.sendFromOwner(global.db?.set?.[botNumber]?.owner?.map(x => x.id) || global.owner, `Status from @${msg.key.participant.split('@')[0]} was deleted`, msg, { mentions: [msg.key.participant] });
			}
			if (/(audioMessage|imageMessage|videoMessage|extendedTextMessage)/i.test(type)) {
				let storyInfo = (type === 'extendedTextMessage') ? `Text Story: ${msg.message.extendedTextMessage.text || ''}` : (type === 'imageMessage') ? `Image Story ${msg.message.imageMessage.caption ? 'with caption: ' + msg.message.imageMessage.caption : ''}` : (type === 'videoMessage') ? `Video Story ${msg.message.videoMessage.caption ? 'with caption: ' + msg.message.videoMessage.caption : ''}` : (type === 'audioMessage') ? 'Audio Story' : '\nUnknown type, check manually';
				await conn.sendFromOwner(global.db?.set?.[botNumber]?.owner?.map(x => x.id) || global.owner, `Viewed status from @${msg.key.participant.split('@')[0]}\n${storyInfo}`, msg, { mentions: [msg.key.participant] });
			}
		}
	} catch (e) {
		throw e;
	}
}

async function Solving(conn, store) {
	conn.serializeM = (m) => MessagesUpsert(conn, m, store)
	conn.decodeJid = (jid) => {
		if (!jid) return jid
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {}
			return decode.user && decode.server && decode.user + '@' + decode.server || jid
		} else return jid
	}
	conn.findJidByLid = (lid, store) => {
		for (const contact of Object.values(store.contacts)) {
			if (contact.lid === lid) {
				return contact.id;
			}
		}
		return null;
	}
	conn.getName = (jid, withoutContact = false) => {
		const id = conn.decodeJid(jid);
		if (id.endsWith('@g.us')) {
			const groupInfo = store.contacts[id] || (store.groupMetadata[id] ? store.groupMetadata[id] : (store.groupMetadata[id] = conn.groupMetadata(id))) || {};
			return Promise.resolve(groupInfo.name || groupInfo.subject || PhoneNumber('+' + id.replace('@g.us', '')).getNumber('international'));
		} else {
			if (id === '0@s.whatsapp.net') {
				return 'WhatsApp';
			}
			const contactInfo = store.contacts[id] || {};
			return withoutContact ? '' : contactInfo.name || contactInfo.subject || contactInfo.verifiedName || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
		}
	}
	conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
		let list = []
		for (let i of kon) {
			list.push({
				displayName: await conn.getName(i + '@s.whatsapp.net'),
				vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${await conn.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD` //vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${await conn.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:whatsapp@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/conn_dev\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
			})
		}
		conn.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 });
	}
	conn.profilePictureUrl = async (jid, type = 'image', timeoutMs) => {
		const result = await conn.query({
			tag: 'iq',
			attrs: {
				target: jidNormalizedUser(jid),
				to: '@s.whatsapp.net',
				type: 'get',
				xmlns: 'w:profile:picture'
			},
			content: [{
				tag: 'picture',
				attrs: {
					type, query: 'url'
				},
			}]
		}, timeoutMs);
		const child = getBinaryNodeChild(result, 'picture');
		return child?.attrs?.url;
	}

	conn.extractGroupMetadata = (result) => {
		const group = getBinaryNodeChild(result, 'group');
		const descChild = getBinaryNodeChild(group, 'description');
		const desc = descChild ? getBinaryNodeChildString(descChild, 'body') : undefined;
		const descId = descChild?.attrs?.id;
		const groupId = group.attrs.id.includes('@') ? group.attrs.id : jidEncode(group.attrs.id, 'g.us');
		const eph = getBinaryNodeChild(group, 'ephemeral')?.attrs?.expiration;
		const participants = getBinaryNodeChildren(group, 'participant') || [];
		return {
			id: groupId,
			addressingMode: group.attrs.addressing_mode,
			subject: group.attrs.subject,
			subjectOwner: group.attrs.s_o,
			subjectTime: +group.attrs.s_t,
			creation: +group.attrs.creation,
			size: participants.length,
			owner: group.attrs.creator ? jidNormalizedUser(group.attrs.creator) : undefined,
			desc,
			descId,
			linkedParent: getBinaryNodeChild(group, 'linked_parent')?.attrs?.jid,
			restrict: !!getBinaryNodeChild(group, 'locked'),
			announce: !!getBinaryNodeChild(group, 'announcement'),
			isCommunity: !!getBinaryNodeChild(group, 'parent'),
			isCommunityAnnounce: !!getBinaryNodeChild(group, 'default_sub_group'),
			joinApprovalMode: !!getBinaryNodeChild(group, 'membership_approval_mode'),
			memberAddMode: getBinaryNodeChildString(group, 'member_add_mode') === 'all_member_add',
			ephemeralDuration: eph ? +eph : undefined,
			participants: participants.map(({ attrs }) => ({
				id: attrs.jid.endsWith('@lid') ? attrs.phone_number : attrs.jid,
				lid: attrs.jid.endsWith('@lid') ? attrs.jid : attrs.lid,
				admin: attrs.type || null
			}))
		};
	}
	conn.groupMetadata = async (jid) => {
		const result = await conn.query({
			tag: 'iq',
			attrs: {
				type: 'get',
				xmlns: 'w:g2',
				to: jid
			},
			content: [{ tag: 'query', attrs: { request: 'interactive' } }]
		});
		return conn.extractGroupMetadata(result);
	};
	conn.groupFetchAllParticipating = async () => {
		const result = await conn.query({ tag: 'iq', attrs: { to: '@g.us', xmlns: 'w:g2', type: 'get' }, content: [{ tag: 'participating', attrs: {}, content: [{ tag: 'participants', attrs: {} }, { tag: 'description', attrs: {} }] }] });
		const data = {};
		const groupsChild = getBinaryNodeChild(result, 'groups');
		if (groupsChild) {
			const groups = getBinaryNodeChildren(groupsChild, 'group');
			for (const groupNode of groups) {
				const meta = conn.extractGroupMetadata({
					tag: 'result',
					attrs: {},
					content: [groupNode]
				});
				data[meta.id] = meta;
			}
		}
		conn.ev.emit('groups.update', Object.values(data));
		return data;
	}
	conn.sendPoll = (jid, name = '', values = [], quoted, selectableCount = 1) => {
		return conn.sendMessage(jid, { poll: { name, values, selectableCount } }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 })
	}
	conn.sendFile = async (jid, url, caption, quoted, options = {}) => {
		const quotedOptions = { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 }
		async function getFileUrl(res, mime) {
			if (mime && mime.includes('gif')) {
				return conn.sendMessage(jid, { video: res.data, caption: caption, gifPlayback: true, ...options }, quotedOptions);
			} else if (mime && mime === 'application/pdf') {
				return conn.sendMessage(jid, { document: res.data, mimetype: 'application/pdf', caption: caption, ...options }, quotedOptions);
			} else if (mime && mime.includes('image')) {
				return conn.sendMessage(jid, { image: res.data, caption: caption, ...options }, quotedOptions);
			} else if (mime && mime.includes('video')) {
				return conn.sendMessage(jid, { video: res.data, caption: caption, mimetype: 'video/mp4', ...options }, quotedOptions);
			} else if (mime && mime.includes('webp') && !/.jpg|.jpeg|.png/.test(url)) {
				return conn.sendSticker(jid, res.data, quoted, options);
			} else if (mime && mime.includes('audio')) {
				return conn.sendMessage(jid, { audio: res.data, mimetype: 'audio/mpeg', ...options }, quotedOptions);
			}
		}
		const axioss = axios.create({
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		});
		const res = await axioss.get(url, { responseType: 'arraybuffer' });
		let mime = res.headers['content-type'];
		if (!mime || mime.includes('octet-stream')) {
			const fileType = await FileType.fromBuffer(res.data);
			mime = fileType ? fileType.mime : null;
		}
		const hasil = await getFileUrl(res, mime);
		return hasil
	}
	conn.sendGroupInvite = async (jid, participant, inviteCode, inviteExpiration, groupName = 'Unknown Subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail = null, options = {}) => {
		const msg = proto.Message.fromObject({
			groupInviteMessage: {
				inviteCode,
				inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
				groupJid: jid,
				groupName,
				jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
				caption,
				contextInfo: {
					mentionedJid: options.mentions || []
				}
			}
		});
		const message = generateWAMessageFromContent(participant, msg, options);
		const invite = await conn.relayMessage(participant, message.message, { messageId: message.key.id })
		return invite
	}
	conn.sendFromOwner = async (jid, text, quoted, options = {}) => {
		for (const a of jid) {
			await conn.sendMessage(a.replace(/[^0-9]/g, '') + '@s.whatsapp.net', { text, ...options }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 })
		}
	}
	conn.sendText = async (jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 })
	conn.sendSticker = async (jid, path, quoted, options = {}) => {
		const buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
		const result = await writeExif(buff, options);
		return conn.sendMessage(jid, { sticker: { url: result }, ...options }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 });
	}
	conn.downloadMediaMessage = async (message) => {
		const msg = message.msg || message;
		const mime = msg.mimetype || '';
		const messageType = (message.type || mime.split('/')[0]).replace(/Message/gi, '');
		const stream = await downloadContentFromMessage(msg, messageType);
		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		return buffer
	}
	conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
		const buffer = await conn.downloadMediaMessage(message);
		const type = await FileType.fromBuffer(buffer);
		const trueFileName = attachExtension ? `./database/temp/${filename ? filename : Date.now()}.${type.ext}` : filename;
		await fs.promises.writeFile(trueFileName, buffer);
		return trueFileName;
	}
	conn.getFile = async (PATH, save) => {
		let res;
		let filename;
		let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
		let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' }
		filename = path.join(__dirname, '../database/temp/' + new Date * 1 + '.' + type.ext)
		if (data && save) fs.promises.writeFile(filename, data)
		return {
			res,
			filename,
			size: await getSizeMedia(data),
			...type,
			data
		}
	}
	conn.appendResponseMessage = async (m, text) => {
		let apb = await generateWAMessage(m.chat, { text, mentions: m.mentionedJid }, { userJid: conn.user.id, quoted: m.quoted && m.quoted.fakeObj, ephemeralExpiration: m.expiration || m?.metadata?.ephemeralDuration || store?.messages[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 });
		apb.key = m.key
		apb.key.id = [...Array(32)].map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
		apb.key.fromMe = areJidsSameUser(m.sender, conn.user.id);
		if (m.isGroup) apb.participant = m.sender;
		conn.ev.emit('messages.upsert', {
			...m,
			messages: [proto.WebMessageInfo.fromObject(apb)],
			type: 'append'
		});
	}
	conn.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
		const { mime, data, filename } = await conn.getFile(path, true);
		const botNumber = conn.decodeJid(conn.user.id);
		const isWebpSticker = options.asSticker || /webp/.test(mime);
		let type = 'document', mimetype = mime, pathFile = filename;
		if (isWebpSticker) {
			pathFile = await writeExif(data, {
				packname: options.packname || db?.set?.[botNumber]?.packname || 'X-Asena',
				author: options.author || db?.set?.[botNumber]?.author || 'LoRDx',
				categories: options.categories || [],
			})
			await fs.unlinkSync(filename);
			type = 'sticker';
			mimetype = 'image/webp';
		} else if (/image|video|audio/.test(mime)) {
			type = mime.split('/')[0];
			mimetype = type == 'video' ? 'video/mp4' : type == 'audio' ? 'audio/mpeg' : mime
		}
		let anu = await conn.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ephemeralExpiration: quoted?.expiration || quoted?.metadata?.ephemeralDuration || store?.messages[jid]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0, ...options });
		await fs.unlinkSync(pathFile);
		return anu;
	}
	conn.sendAlbum = async (jid, content = {}, options = {}) => {
		const { album, mentions, contextInfo, ...others } = content;
		for (const media of album) {
			if (!media.image && !media.video) throw new TypeError(`album[i] must have image or video property`);
		}
		if (album.length < 2) throw new RangeError("Minimum 2 media");
		const medias = await generateWAMessageFromContent(jid, {
			albumMessage: {
				expectedImageCount: album.filter(m => m.image).length,
				expectedVideoCount: album.filter(m => m.video).length,
			}
		}, {});
		await conn.relayMessage(jid, medias.message, { messageId: medias.key.id });
		for (const media of album) {
			const msg = await generateWAMessage(jid, { ...others, ...media }, { upload: conn.waUploadToServer });
			msg.message.messageContextInfo = {
				messageAssociation: {
					associationType: 1,
					parentMessageKey: medias.key
				}
			}
			await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
		}
		return medias;
	}

	conn.sendButton = async (jid, content = {}, options = {}) => {
		const { text, caption, footer = '', headerType = 1, ai, contextInfo = {}, buttons = [], mentions = [], ...media } = content;
		const msg = await generateWAMessageFromContent(jid, {
			viewOnceMessage: {
				message: {
					messageContextInfo: {
						deviceListMetadata: {},
						deviceListMetadataVersion: 2,
					},
					buttonsMessage: {
						...(media && typeof media === 'object' && Object.keys(media).length > 0 ? await generateWAMessageContent(media, {
							upload: conn.waUploadToServer
						}) : {}),
						contentText: text,
						footerText: footer,
						buttons,
						headerType: media && Object.keys(media).length > 0 ? Math.max(...Object.keys(media).map((a) => ({ document: 3, image: 4, video: 5, location: 6 })[a] || headerType)) : headerType,
						contextInfo: {
							...contextInfo,
							...options.contextInfo,
							mentionedJid: options.mentions || mentions,
							...(options.quoted ? {
								stanzaId: options.quoted.key.id,
								remoteJid: options.quoted.key.remoteJid,
								participant: options.quoted.key.participant || options.quoted.key.remoteJid,
								fromMe: options.quoted.key.fromMe,
								quotedMessage: options.quoted.message
							} : {})
						}
					}
				}
			}
		}, {});
		const hasil = await conn.relayMessage(msg.key.remoteJid, msg.message, {
			messageId: msg.key.id,
			additionalNodes: [{
				tag: 'biz',
				attrs: {},
				content: [
					{
						tag: 'interactive',
						attrs: { type: 'native_flow', v: '1' },
						content: [{
							tag: 'native_flow',
							attrs: { name: 'quick_reply' }
						}]
					}
				]
			}, ...(ai ? [{ attrs: { biz_bot: '1' }, tag: 'bot' }] : [])]
		})
		return hasil
	}
	conn.sendCarousel = async (jid, body = '', footer = '', cards = [], options = {}) => {
		async function getImageMsg(url) {
			try {
				const { imageMessage } = await generateWAMessageContent(
					{ image: { url } },
					{ upload: conn.waUploadToServer }
				);
				return imageMessage;
			} catch (err) {
				const { imageMessage } = await generateWAMessageContent(
					{ image: { url: "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg" } },
					{ upload: conn.waUploadToServer }
				);
				return imageMessage;
			}
		}
		const cardPromises = cards.map(async (a) => {
			const imageMessage = await getImageMsg(a.url);
			return {
				header: {
					imageMessage: imageMessage,
					hasMediaAttachment: true
				},
				body: { text: a.body },
				footer: { text: a.footer },
				nativeFlowMessage: {
					buttons: a.buttons.map(b => ({
						name: b.name,
						buttonParamsJson: JSON.stringify(b.buttonParamsJson ? JSON.parse(b.buttonParamsJson) : '')
					}))
				}
			};
		});
		const cardResults = await Promise.all(cardPromises);
		const msg = await generateWAMessageFromContent(jid, {
			viewOnceMessage: {
				message: {
					messageContextInfo: {
						deviceListMetadata: {},
						deviceListMetadataVersion: 2
					},
					interactiveMessage: proto.Message.InteractiveMessage.create({
						body: proto.Message.InteractiveMessage.Body.create({ text: body }),
						footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
						carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
							cards: cardResults,
							messageVersion: 1
						})
					})
				}
			}
		}, {});
		const hasil = await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
		return hasil
	}
	//important: false,false x , true,true
	if (conn.user && conn.user.id) {
		const botNumber = conn.decodeJid(conn.user.id);
		if (global.db?.set[botNumber]) {
			conn.public = global.db.set[botNumber].public
		} else conn.public = false
	} else conn.public = false

	return conn
}

async function Serialize(conn, msg, store) {
	const botLid = conn.decodeJid(conn.user.lid);
	const botNumber = conn.decodeJid(conn.user.id);
	const m = { ...msg };
	if (!m) return m
	if (m.key) {
		m.id = m.key.id
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isBot = ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some(a => m.id.startsWith(a) && [12, 16, 20, 22, 40].includes(m.id.length)) || /(.)\1{5,}|[^a-zA-Z0-9]|[^0-9A-F]/.test(m.id) || false
		m.isGroup = m.chat.endsWith('@g.us')
		if (!m.isGroup && m.chat.endsWith('@lid')) m.chat = conn.findJidByLid(m.chat, store) || m.chat;
		m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.key.participant || m.chat || '')
		if (m.isGroup) {
			if (!store.groupMetadata) store.groupMetadata = await conn.groupFetchAllParticipating().catch(e => ({}));
			let metadata = store.groupMetadata[m.chat] ? store.groupMetadata[m.chat] : (store.groupMetadata[m.chat] = await conn.groupMetadata(m.chat).catch(e => ({})))
			if (!metadata) {
				metadata = await conn.groupMetadata(m.chat).catch(e => ({}))
				store.groupMetadata[m.chat] = metadata
			}
			m.metadata = metadata
			m.metadata.size = (metadata.participants || []).length;
			if (metadata.addressingMode === 'lid') {
				const participant = metadata.participants.find(a => a.lid === m.sender)
				m.key.participant = m.sender = participant?.id || m.sender;
				m.metadata.owner = m.metadata?.participants?.find(p => p.lid === m.metadata.owner)?.id || m.metadata.owner;
				m.metadata.subjectOwner = m.metadata?.participants?.find(p => p.lid === m.metadata.subjectOwner)?.id || m.metadata.subjectOwner;
				store.contacts ??= {};
				store.contacts[m.sender] = { ...store.contacts[m.sender], id: m.sender, lid: m.fromMe && conn.user.lid || participant?.lid || m.sender, name: m.pushName };
			}
			m.admins = m.metadata.participants ? (m.metadata.participants.reduce((a, b) => (b.admin ? a.push({ id: b.id, admin: b.admin }) : [...a]) && a, [])) : []
			m.isAdmin = m.admins?.some((b) => b.id === m.sender) || false
			m.participant = m.key.participant
			m.isBotAdmin = !!m.admins?.find((member) => [botNumber, botLid].includes(member.id)) || false
		}
	}
	if (m.message) {
		m.type = getContentType(m.message) || Object.keys(m.message)[0]
		m.msg = (/viewOnceMessage|viewOnceMessageV2Extension|editedMessage|ephemeralMessage/i.test(m.type) ? m.message[m.type].message[getContentType(m.message[m.type].message)] : (extractMessageContent(m.message[m.type]) || m.message[m.type]))
		m.body = m.message?.conversation || m.msg?.text || m.msg?.conversation || m.msg?.caption || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || ''
		m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
		m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
		m.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi.test(m.body) ? m.body.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gi)[0] : ''
		m.command = m.body && m.body.replace(m.prefix, '').trim().split(/ +/).shift()
		m.args = m.body?.trim().replace(new RegExp("^" + m.prefix?.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&'), 'i'), '').replace(m.command, '').split(/ +/).filter(a => a) || []
		m.device = getDevice(m.id)
		m.expiration = m.msg?.contextInfo?.expiration || m?.metadata?.ephemeralDuration || store?.messages?.[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0
		m.timestamp = (typeof m.messageTimestamp === "number" ? m.messageTimestamp : m.messageTimestamp.low ? m.messageTimestamp.low : m.messageTimestamp.high) || m.msg.timestampMs * 1000
		m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath
		if (m.isMedia) {
			m.mime = m.msg?.mimetype
			m.size = m.msg?.fileLength
			m.height = m.msg?.height || ''
			m.width = m.msg?.width || ''
			if (/webp/i.test(m.mime)) {
				m.isAnimated = m.msg?.isAnimated
			}
		}
		m.quoted = m.msg?.contextInfo?.quotedMessage || null
		if (m.quoted) {
			m.quoted.message = extractMessageContent(m.msg?.contextInfo?.quotedMessage)
			m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0]
			m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.device = getDevice(m.quoted.id)
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
			m.quoted.isBot = m.quoted.id ? ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some(a => m.quoted.id.startsWith(a) && [12, 16, 20, 22, 40].includes(m.quoted.id.length)) || /(.)\1{5,}|[^a-zA-Z0-9]|[^0-9A-F]/.test(m.quoted.id) : false
			if (m.msg?.contextInfo?.participant?.endsWith('@lid')) m.msg.contextInfo.participant = m?.metadata?.participants?.find(a => a.lid === m.msg.contextInfo.participant)?.id || m.msg.contextInfo.participant;
			m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
			m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
			m.quoted.text = m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
			m.quoted.msg = extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type]
			m.quoted.mentionedJid = m.quoted?.msg?.contextInfo?.mentionedJid || []
			m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || ''
			m.getQuotedObj = async () => {
				if (!m.quoted.id) return false
				let q = await store.loadMessage(m.chat, m.quoted.id, conn)
				return await Serialize(conn, q, store)
			}
			m.quoted.key = {
				remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
				participant: m.quoted.sender,
				fromMe: areJidsSameUser(conn.decodeJid(m.msg?.contextInfo?.participant), conn.decodeJid(conn?.user?.id)),
				id: m.msg?.contextInfo?.stanzaId
			}
			m.quoted.isGroup = m.quoted.chat.endsWith('@g.us')
			m.quoted.mentions = m.quoted.msg?.contextInfo?.mentionedJid || []
			m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || ''
			m.quoted.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.quoted.body) ? m.quoted.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi.test(m.quoted.body) ? m.quoted.body.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gi)[0] : ''
			m.quoted.command = m.quoted.body && m.quoted.body.replace(m.quoted.prefix, '').trim().split(/ +/).shift()
			m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath
			if (m.quoted.isMedia) {
				m.quoted.fileSha256 = m.quoted[m.quoted.type]?.fileSha256 || ''
				m.quoted.mime = m.quoted.msg?.mimetype
				m.quoted.size = m.quoted.msg?.fileLength
				m.quoted.height = m.quoted.msg?.height || ''
				m.quoted.width = m.quoted.msg?.width || ''
				if (/webp/i.test(m.quoted.mime)) {
					m.quoted.isAnimated = m?.quoted?.msg?.isAnimated || false
				}
			}
			m.quoted.fakeObj = proto.WebMessageInfo.create({
				key: {
					remoteJid: m.quoted.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id
				},
				message: m.quoted,
				...(m.isGroup ? { participant: m.quoted.sender } : {})
			})
			m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
			m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: { remoteJid: m.quoted.chat, fromMe: m.isBotAdmins ? false : true, id: m.quoted.id, participant: m.quoted.sender } })
		}
	}
	m.download = () => conn.downloadMediaMessage(m)
	m.copy = () => Serialize(conn, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)))
	m.edit = (u, f) => conn.sendMessage(m.chat, { text: u, edit: f.key });
	m.react = (u) => conn.sendMessage(m.chat, { react: { text: u, key: m.key } })
	m.reply = async (content, options = {}) => {
		const { quoted = m, chat = m.chat, caption = '', ephemeralExpiration = m.expiration || m?.metadata?.ephemeralDuration || store?.messages[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0, mentions = (typeof content === 'string' || typeof content.text === 'string' || typeof content.caption === 'string') ? [...(content.text || content.caption || content).matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') : [], ...validate } = options;
		if (typeof content === 'object') {
			return conn.sendMessage(chat, content, { ...options, quoted, ephemeralExpiration })
		} else if (typeof content === 'string') {
			try {
				if (/^https?:\/\//.test(content)) {
					const data = await axios.get(content, { responseType: 'arraybuffer' });
					const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data)).mime
					if (/gif|image|video|audio|pdf|stream/i.test(mime)) {
						return conn.sendMedia(chat, data.data, '', caption, quoted, content)
					} else {
						return conn.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration })
					}
				} else {
					return conn.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration })
				}
			} catch (e) {
				return conn.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration })
			}
		}
	}
	return m
}

module.exports = {
	GroupUpdate,
	GroupParticipantsUpdate,
	LoadDataBase,
	MessagesUpsert,
	Solving
}