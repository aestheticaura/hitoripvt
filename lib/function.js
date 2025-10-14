const fs = require('fs');
const util = require('util');
const Jimp = require('jimp');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const FormData = require("form-data");
const fetch = require('node-fetch');
const FileType = require('file-type');
const moment = require('moment-timezone');
const { createCanvas } = require("canvas");
const { sizeFormatter } = require('human-readable');
const { exec, execSync } = require('child_process');

const host = "identify-eu-west-1.acrcloud.com";
const accessKey = "8c21a32a02bf79a4a26cb0fa5c941e95";
const accessSecret = "NRSxpk6fKwEiVdNhyx5lR0DP8LzeflYpClNg1gze";
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');

const unsafeAgent = new https.Agent({ rejectUnauthorized: false });

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

const generateMessageTag = (epoch) => {
	let tag = (0, unixTimestampSeconds)().toString();
	if (epoch)
		tag += '.--' + epoch;
	return tag;
}

const processTime = (timestamp, now) => {
	return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

const webApi = (a, b, c, d, e, f) => {
	const hasil = a + b + c + d + e + f;
	return hasil;
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const getBuffer = async (url, options = {}) => {
	try {
		const { data } = await axios.get(url, {
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			responseType: 'arraybuffer',
			httpsAgent: unsafeAgent,
			...options
		})
		return data
	} catch (e) {
		try {
			const res = await fetch(url, { agent: unsafeAgent });
			const anu = await res.buffer()
			return anu
		} catch (e) {
			return e
		}
	}
}

const fetchJson = async (url, options = {}) => {
	try {
		const { data } = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
			},
			httpsAgent: unsafeAgent,
			...options
		})
		return data
	} catch (e) {
		try {
			const res = await fetch(url, { agent: unsafeAgent });
			const anu = await res.json()
			return anu
		} catch (e) {
			return e
		}
	}
}

const runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

const clockString = (ms) => {
	let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
	let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
	let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const sleep = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const getTime = (format, date) => {
	if (date) {
		return moment(date).locale('in').format(format)
	} else {
		return moment.tz('Asia/Kolkatha').locale('in').format(format)
	}
}

const formatDate = (n, locale = 'id') => {
	let d = new Date(n)
	return d.toLocaleDateString(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	})
}

const formatp = sizeFormatter({
	std: 'JEDEC',
	decimalPlaces: 2,
	keepTrailingZeroes: false,
	render: (literal, symbol) => `${literal} ${symbol}B`,
})

const jsonformat = (string) => {
	return JSON.stringify(string, null, 2)
}

const reSize = async (image, ukur1 = 100, ukur2 = 100) => {
	return new Promise(async (resolve, reject) => {
		try {
			const read = await Jimp.read(image);
			const result = await read.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

const toHD = async (image) => {
	return new Promise(async (resolve, reject) => {
		try {
			const read = await Jimp.read(image);
			const newWidth = read.bitmap.width * 4;
			const newHeight = read.bitmap.height * 4;
			const result = await read.resize(newWidth, newHeight).getBufferAsync(Jimp.MIME_JPEG)
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

const logic = (check, inp, out) => {
	if (inp.length !== out.length) throw new Error('Input and Output must have same length')
	for (let i in inp)
		if (util.isDeepStrictEqual(check, inp[i])) return out[i]
	return null
}

const generateProfilePicture = async (buffer) => {
	const jimp = await Jimp.read(buffer)
	const min = jimp.getWidth()
	const max = jimp.getHeight()
	const cropped = jimp.crop(0, 0, min, max)
	return {
		img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
		preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
	}
}

const bytesToSize = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const normalize = s => s.replace(/\s+/g, '').split('').sort().join('');

const getSizeMedia = async (path) => {
	return new Promise((resolve, reject) => {
		if (typeof path === 'string' && /http/.test(path)) {
			axios.get(path).then((res) => {
				let length = parseInt(res.headers['content-length'])
				if (!isNaN(length)) resolve(bytesToSize(length, 3))
			})
		} else if (Buffer.isBuffer(path)) {
			let length = Buffer.byteLength(path)
			if (!isNaN(length)) resolve(bytesToSize(length, 3))
		} else {
			reject(0)
		}
	})
}

const parseMention = (text = '') => {
	return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

const getGroupAdmins = (participants) => {
	let admins = []
	for (let i of participants) {
		i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
	}
	return admins || []
}

const getHashedPassword = (password) => {
	const sha256 = crypto.createHash('sha256');
	const hash = sha256.update(password).digest('base64');
	return hash;
}

const generateAuthToken = (size) => {
	return crypto.randomBytes(size).toString('hex').slice(0, size);
}

const cekMenfes = (tag, nomer, db_menfes) => {
	let x1 = false
	Object.keys(db_menfes).forEach((i) => {
		if (db_menfes[i].id == nomer) {
			x1 = i
		}
	})
	if (x1 !== false) {
		if (tag == 'id') {
			return db_menfes[x1].id
		}
		if (tag == 'teman') {
			return db_menfes[x1].teman
		}
	}
	if (x1 == false) {
		return null
	}
}

function generateToken() {
	let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*';
	let token = '';
	for (let i = 0; i < 8; i++) {
		let randomIndex = Math.floor(Math.random() * characters.length);
		token += characters.charAt(randomIndex);
	}
	return token;
}

function randomText(len) {
	const result = [];
	for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
	return result.join('');
}

function isEmoji(str) {
	const emojiRegex = /[\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/u;
	return emojiRegex.test(str);
}

function readFileTxt(file) {
	return new Promise((resolve, reject) => {
		const data = fs.readFileSync(file, 'utf8');
		const array = data.toString().split('\n');
		const random = array[Math.floor(Math.random() * array.length)];
		resolve(random.replace('\r', ''));
	})
}

function readFileJson(file) {
	return new Promise((resolve, reject) => {
		const jsonData = JSON.parse(fs.readFileSync(file));
		const index = Math.floor(Math.random() * jsonData.length);
		const random = jsonData[index];
		resolve(random);
	})
}

async function getTypeUrlMedia(url) {
	return new Promise(async (resolve, reject) => {
		try {
			const buffer = await axios.get(url, { responseType: 'arraybuffer' });
			const type = buffer.headers['content-type'] || (await FileType.fromBuffer(buffer.data)).mime
			resolve({ type, url })
		} catch (e) {
			reject(e)
		}
	})
}

function frmtView(num) {
	if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
	if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
	if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
	return num.toString();
}

function minToSec(sec) {
	let minutes = Math.floor(sec / 60);
	let seconds = sec % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function pickRandom(list) {
	return list[Math.floor(list.length * Math.random())]
}

function convertTimestampToDate(timestamp) {
	return timestamp ? new Date(timestamp * 1000).toISOString().replace("T", " ").split(".")[0] : 'N/A'
}

function isCommandAvailable(command) {
	try {
		execSync(`command -v ${command}`);
		return true;
	} catch (error) {
		return false;
	}
}

async function getAllHTML(urls) {
	try {
		const htmlArr = [];
		for (const url of urls) {
			const response = await axios.get(url);
			htmlArr.push(response.data);
		}
		return htmlArr;
	} catch (error) {
		console.error(error);
	}
}

function tarBackup(source, output) {
	return new Promise((resolve, reject) => {
		exec(`tar -czf ${output} --exclude=${output} --exclude='./node_modules' ${source}`, (err, stdout, stderr) => {
			if (err) return reject(err);
			resolve(output);
		})
	})
}

function totalcmd() {
	return ((fs.readFileSync('./LoRD.js').toString()).match(/case '/g) || []).length
}

//acss: 8a660e6ee5d01b2c1bbf73a121191b43
//sec: IlweYfC0SskirgB4qNe1jEjaHPkEENJAA4zrXRtx
const acrCloud = async (audioBuffer) => {
	const httpMethod = "POST";
	const httpUri = "/v1/identify";
	const dataType = "audio";
	const signatureVersion = "1";
	const timestamp = Math.floor(Date.now() / 1000);
	const stringToSign = [
		httpMethod,
		httpUri,
		accessKey,
		dataType,
		signatureVersion,
		timestamp
	].join("\n");
	const signature = crypto
		.createHmac("sha1", accessSecret)
		.update(stringToSign)
		.digest("base64");
	const formData = new FormData();
	formData.append("sample", audioBuffer, { filename: "sample.mp3" });
	formData.append("access_key", accessKey);
	formData.append("data_type", dataType);
	formData.append("signature_version", signatureVersion);
	formData.append("signature", signature);
	formData.append("sample_bytes", audioBuffer.length);
	formData.append("timestamp", timestamp);
	const url = `https://${host}${httpUri}`;
	const res = await axios.post(url, formData, {
		headers: formData.getHeaders(),
		timeout: 20000,
	});
	return res.data;
};

async function createN(text) {
	const W = 2048;
	const H = 282;
	const canvas = createCanvas(W, H);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
	ctx.font = "64px Sans";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = "rgba(255,255,255,0.8)";
	ctx.shadowBlur = 8;
	ctx.fillText(text, W / 2, H / 2);
	return canvas.toBuffer("image/jpeg");
};

async function gdrive(buffer, fname) {
	const form = new FormData();
	form.append("file", buffer, fname);
	const res = await axios.post("https://lordxddcdn.onrender.com/upload", form, {
		headers: form.getHeaders(),
		maxContentLength: Infinity,
		maxBodyLength: Infinity,
	});
	return res.data;
}
const path = require("path");

module.exports = {
	upload: async (buffer, fileExtension) => {
		const tempFileName = `${getRandom('.' + fileExtension)}`;
		const tempFilePath = path.join(__dirname, tempFileName);
		fs.writeFileSync(tempFilePath, buffer);
		const form = new FormData();
		form.append("file", fs.createReadStream(tempFilePath));
		try {
			const res = await axios.post("https://cdn.lordx.dpdns.org/upload", form, {
				headers: form.getHeaders(),
			});
			fs.unlink(tempFilePath, (err) => {
				if (err) console.log(err.message);
			});
			return res.data;
		} catch (error) {
			throw error;
		}
	},
	rmbg: async (buffer) => {
		const tmpPth = path.join(require("os").tmpdir(), `upscale-${Date.now()}.jpg`);
		fs.writeFileSync(tmpPth, buffer);
		const form = new FormData();
		form.append('file', fs.createReadStream(tmpPth));
		const headers = { ...form.getHeaders() };
		try {
			const response = await axios.post('https://lordx.koyeb.app/api/tools/rmbg', form, { headers, responseType: 'arraybuffer' });
			fs.unlinkSync(tmpPth);
			return response.data;
		} catch (err) {
			fs.unlinkSync(tmpPth);
			return err;
		}
	},
	gdrive,
	createN,
	acrCloud,
	frmtView,
	minToSec,
	totalcmd,
	unixTimestampSeconds,
	generateMessageTag,
	processTime,
	webApi,
	getRandom,
	getBuffer,
	fetchJson,
	runtime,
	clockString,
	sleep,
	isUrl,
	getTime,
	formatDate,
	formatp,
	jsonformat,
	reSize,
	toHD,
	logic,
	generateProfilePicture,
	bytesToSize,
	normalize,
	getSizeMedia,
	parseMention,
	getGroupAdmins,
	readFileTxt,
	readFileJson,
	isCommandAvailable,
	getHashedPassword,
	generateAuthToken,
	cekMenfes,
	generateToken,
	randomText,
	isEmoji,
	getTypeUrlMedia,
	pickRandom,
	convertTimestampToDate,
	getAllHTML,
	tarBackup
};