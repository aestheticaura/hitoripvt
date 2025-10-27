const axios = require("axios");

async function sendd() {
    const img = await axios.get("https://telegra.ph/file/4e60fce32bf5179c2eaf4.jpg", { responseType: "arraybuffer" });
    const thumb = new Uint8Array(img.data);
    const msg = await baileys.generateWAMessageFromContent(m.chat, {
        interactiveMessage: baileys.proto.Message.InteractiveMessage.create({
            header: baileys.proto.Message.InteractiveMessage.Header.create({
                documentMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc",
                    mimetype: "application/msword",
                    fileSha256: "+gmvvCB6ckJSuuG3ZOzHsTBgRAukejv1nnfwGSSSS/4=",
                    fileLength: "999999999999",
                    pageCount: 0,
                    mediaKey: "MWO6fI223TY8T0i9onNcwNBBPldWfwp1j1FPKCiJFzw=",
                    fileName: "whyuxD",
                    fileEncSha256: "ZS8v9tio2un1yWVOOG3lwBxiP+mNgaKPY9+wl5pEoi8=",
                    directPath: "/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc",
                    mediaKeyTimestamp: "1756370084",
                    jpegThumbnail: thumb,
                },
                hasMediaAttachment: true,
            }),
            body: baileys.proto.Message.InteractiveMessage.Body.create({ text: "" }),
            footer: baileys.proto.Message.InteractiveMessage.Footer.create({ text: "testt" }),
            nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: [] })
        }),
    }, { quoted: m });

    return conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

sendd();





const axios = require("axios");

async function sendd() {
    const img = await axios.get("https://telegra.ph/file/4e60fce32bf5179c2eaf4.jpg", { responseType: "arraybuffer" });
    const thumb = new Uint8Array(img.data);
    const msg = await baileys.generateWAMessageFromContent(m.chat, {
        interactiveMessage: baileys.proto.Message.InteractiveMessage.create({
            header: baileys.proto.Message.InteractiveMessage.Header.create({
                documentMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc",
                    mimetype: "application/msword",
                    fileLength: "999999999999",
                    fileName: "whyuxD",
                    jpegThumbnail: thumb,         
                },
                hasMediaAttachment: true,
            }),
            body: baileys.proto.Message.InteractiveMessage.Body.create({ text: "" }),
            footer: baileys.proto.Message.InteractiveMessage.Footer.create({ text: "testt" }),
            nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: [] })
        }),
    }, { quoted: m });

    return conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

sendd();