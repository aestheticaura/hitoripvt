conn.sendMessage(m.chat, {
    document: { url: "https://wa.me" },
    jpegThumbnail: await conn.resize(thumb, 300, 150),
    caption: "test",
    fileName: "testt",
    contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        businessMessageForwardInfo: {
            businessOwnerJid: bisnis
        }
    }
}, { quoted: m });