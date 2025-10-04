const yts = require("yt-search");

(async () => {
    const f = await yts.search("saopaulo");
    let topResults = f.all.slice(0, 3)

    await conn.sendCarouselMsg(m.chat,
        "results:",
        "LoRDx",
        topResults.map(video => ({
            url: video.thumbnail || video.image,
            body: `${video.title}\n ${video.timestamp} -  ${video.views.toLocaleString()} views`,
            footer: `By ${video.author?.name || ""}`,
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Play",
                        id: "fek"
                    })
                }
            ]
        }))
    )
})();