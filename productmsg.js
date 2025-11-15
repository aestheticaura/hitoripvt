const baileys = require("baileys");

async function sendd() {
    const msg = await conn.generateWAMessageFromContent(m.chat, {
        productMessage: baileys.proto.Message.ProductMessage.fromObject({
            product: {
                productId: "9197783839877",
                title: "title",
                description: "desc",
                currencyCode: "INR",
                priceAmount1000: "777777",
                retailerId: "LoRDx",
                url: "https://lordx.cursed.in",
                productImageCount: 1,
                productImage: await (async () => {
                    const { imageMessage } = await baileys.generateWAMessageContent(
                        { image: { url: "https://i.pinimg.com/736x/00/65/51/00655109f18218cfc183a27b5947022b.jpg" } },
                        { upload: conn.waUploadToServer }
                    )
                    return imageMessage
                })(),
            },
        }),
        businessOwnerJid: "919778383987@s.whatsapp.net",
    }, { quoted: m });
    return conn.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id,
    });
}

sendd();


let msg = await baileys.generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                body: {
                    text: "test"
                },
                header: {
                    title: "lordx",
                    hasMediaAttachment: true,
                    productMessage: {
                        product: {
                            productImage: await(async () => {
                                const { imageMessage } = await baileys.generateWAMessageContent(
                                    { image: { url: "https://i.pinimg.com/736x/00/65/51/00655109f18218cfc183a27b5947022b.jpg" } },
                                    { upload: conn.waUploadToServer }
                                )
                                return imageMessage
                            })(),
                            productId: "9116471035103640",
                            title: "lord",
                            description: "ggg",
                            currencyCode: "INR",
                            priceAmount1000: "5000200",
                            retailerId: "4144242",
                            url: "https://github.com",
                            productImageCount: 1
                        },
                        businessOwnerJid: "919778383987@s.whatsapp.net"
                    }
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            "name": "single_select",
                            "buttonParamsJson": "{\"has_multiple_buttons\":true}"
                        },
                        {
                            name: "cta_catalog",
                            buttonParamsJson: `{"business_phone_number": "6283189053897", "catalog_product_id": "9116471035103640"}`
                        },
                    ]
                }
            }
        }
    }
},
    { quoted: m })

await conn.relayMessage(msg.key.remoteJid, msg.message, {
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
    }]
})

