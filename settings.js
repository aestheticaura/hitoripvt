const fs = require('fs');
const chalk = require('chalk');

global.owner = ['919778383987'] 
global.author = '𝐿𝑜𝑟𝑑-𝑜𝑓𝑓𝑖𝑐𝑖𝑎𝑙'
global.botname = '𝐋𝐨𝐑𝐃-𝐌𝐃'
global.packname = '𝐋𝐨𝐑𝐃-𝐌𝐃'
global.thumb = require("fs").readFileSync('./src/lord.jpg')
global.HANDLER = ['-']
global.API = require("./src/api");

global.listv = ['*•*']
global.tempatDB = 'database.json'
global.tempatStore = 'mongodb+srv://lordxddd:lordjeevan26@userbotpvt.5gxfeuz.mongodb.net/?retryWrites=true&w=majority&appName=userbotpvt'
global.pairing_code = false
global.number_bot = ''

global.APIKeys = {
	'https://api.hitori.pw': 'htrkey-77eb83c0eeb39d40',
	geminiApikey: ['AIzaSyD0lkGz6ZhKi_MHSSmJcCX3wXoDZhELPaQ','AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU','AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M','AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A','AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA']
}

global.chatLength = 250

//~~~~~~~~~~~~~~~< PROCESS >~~~~~~~~~~~~~~~\\

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
});