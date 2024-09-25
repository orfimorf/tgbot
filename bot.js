const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function getRandomLineFromCSV() {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'quotes.csv');
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                // Когда файл полностью прочитан, выбираем случайную строку
                const randomIndex = Math.floor(Math.random() * rows.length);
                resolve(rows[randomIndex]);
            })
            .on('error', (error) => {
                reject(`Ошибка при чтении файла: ${error}`);
            });
    });
}

const bot = new Telegraf(process.env.TG_TOKEN);
bot.start((ctx) => ctx.reply('Welcome'));
bot.command('motivation', async (ctx) => {
    const {Author, Quote} = await getRandomLineFromCSV()
    ctx.reply(`'${Quote}'\n - ${Author}`)
});
bot.help((ctx) => ctx.reply('/start\n/motivation\n\nТак же можете написать смс или скинуть стикер'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.on('message', (ctx) => ctx.reply(`Your message\n${ctx.update.message.text}`))

bot.launch(()=> console.log('Started'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));