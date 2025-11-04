e> await conn.relayMessage(m.chat, {
    interactiveMessage: {
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "testt",
                body: '',
                thumbnailUrl: "https://telegra.ph/file/4e60fce32bf5179c2eaf4.jpg",
                sourceUrl: `https://whyu-me.vercel.app`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        },
        header: {
            documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc",
                mimetype: "application/pdf",
                fileSha256: "+gmvvCB6ckJSuuG3ZOzHsTBgRAukejv1nnfwGSSSS/4=",
                fileLength: "999999999999",
                pageCount: 0,
                mediaKey: "MWO6fI223TY8T0i9onNcwNBBPldWfwp1j1FPKCiJFzw=",
                fileName: "whyuxD",
                fileEncSha256: "ZS8v9tio2un1yWVOOG3lwBxiP+mNgaKPY9+wl5pEoi8=",
                directPath: "/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc",
                mediaKeyTimestamp: "1756370084",
            },
            hasMediaAttachment: true,
        },
        body: {
            text: null
        },
        footer: {
            text: "gtw mw taro ap"
        },
        nativeFlowMessage: {
            messageParamsJson: JSON.stringify({
                limited_time_offer: {
                    text: "gtw mw taro ap",
                    url: "https://t.me/whyuxD",
                    copy_code: "whyuxD",
                    expiration_time: Date.now() * 999
                },
                bottom_sheet: {
                    in_thread_buttons_limit: 2,
                    divider_indices: [1, 2, 3, 4, 5, 999],
                    list_title: "select here",
                    button_title: "whyux"
                },
                tap_target_configuration: {
                    title: " X ",
                    description: "bomboclard",
                    canonical_url: "https://t.me/yumevtc",
                    domain: "shop.example.com",
                    button_index: 0
                }
            }),
            buttons: [
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "list selection",
                        sections: [
                            {
                                title: "gw putyh btw",
                                highlight_label: "🤤",
                                rows: [
                                    { title: "Title #1", description: "Description #1", id: "id#1" },
                                    { title: "Title #2", description: "Description #2", id: "id#2" }
                                ]
                            }
                        ],
                        has_multiple_buttons: true
                    })
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "url site",
                        url: "https://whyu-me.vercel.app",
                        has_multiple_buttons: true
                    })
                },
                {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "copy",
                        copy_code: '𝚋𝚢 whyuxD',
                        has_multiple_buttons: true
                    })
                },
            ],
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    in_thread_buttons_limit: 1,
                    divider_indices: [1, 2, 3],
                    list_title: "List Button baru",
                    button_title: "kau hytam ya?"
                }
            })
        }
    }
}, {
    messageId: m.key.id,
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
    }, [{ attrs: { biz_bot: '1' }, tag: 'bot' }]]
})