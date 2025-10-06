

const f = await API.get("media.spotify", { q: "sao paulo" });
let topResults = f.result.slice(0, 5)
await conn.sendCarousel(m.chat,
    "results:",
    "LoRDx",
    topResults.map(res => ({
        url: res.thumbnail,
        body: `* title: ${res.title}*\n(${res.duration})`,
        footer: `By ${res.artist || ""}`,
        buttons: [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copy",
                    url: res.url
                })
            }
        ]
    }))
);