const { Blob } = require("buffer");

class client {
  constructor(base, routes) {
    this.base = base
    this.routes = routes
  }
  resolvePath(path) {
    return path.split(".").reduce((o, k) => (o ? o[k] : null), this.routes)
  }
  buildQuery(params) {
    if (!params || Object.keys(params).length === 0) return ""
    return "?" + new URLSearchParams(params).toString()
  }
  async get(path, params = {}) {
    const route = this.resolvePath(path)
    if (!route) throw new Error(`Route not found: ${path}`)
    const url = this.base + route + this.buildQuery(params)
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
  async post(path, buffer, filename = "file.jpg") {
    const route = this.resolvePath(path);
    if (!route) throw new Error(`Route not found: ${path}`);
    const url = this.base + route;
    const form = new FormData();
    form.append("file", new Blob([buffer]), filename);
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

const API_BASE = "https://lordx.koyeb.app"
const API_ROUTES = {
  ai:{
    gpt: "/api/ai/gpt",
    gemini: "/api/ai/gemini",
    deepseek: "/api/ai/deepseek",
    imgen: "/api/ai/imgen"
  },
  anime: {
    quotes: "/api/anime/quotes",
    info: "/api/anime",
    sfw: "/api/anime/sfw/",
    waifu: "/api/anime/waifu",
    find: "/api/anime/find"
  },
  fun: {
    joke: "/api/joke",
    quotes: "/api/quotes"
  },
  media: {
    movie: "/api/movie",
    dl: "/api/movie/dl",
    sub: "/api/subtitle",
    lyrics: "/api/lyrics",
    spotify: "/api/spotify",
    pin: "/api/pinterest",
    yt: "/api/ytdl",
    ig: "/api/igdl",
    story: "/api/story",
    x: "/api/x"
  },
  tools: {
    tgs: "/api/tg/sticker",
    js: "/api/js",
    fdroid: "/api/fdroid",
    gLens: "/api/g-lens",
    trt: "/api/trt",
    ghibli: "/api/converter/ghibli",
    upscale: "/api/tools/upscale",
    web2zip: "/api/web2zip",
    removeBg: "/api/tools/rmbg",
    currency: "/api/currency"
  },
  ecom: {
    amazon: "/api/amazon"
  },
  nsfw: {
    gen: "/api/nsfw/waifu",
    anime: "/api/anime/nsfw/"
  }
}

module.exports = new client(API_BASE, API_ROUTES);