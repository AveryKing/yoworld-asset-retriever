'use strict'

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const mysql = require('mysql')

const cdnUrl = 'https://yw-web.yoworld.com/cdn/items'

const con = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:''
});

async function downloadSwf (url, filename) {
    const path = Path.resolve(__dirname, 'items', filename)
    const response = await Axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    })
        .catch((err) => {
            console.log('error downloading ' + filename)
        })
    response.data.pipe(Fs.createWriteStream(path))

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            console.log(`Downloaded ${filename}`)
            resolve()
        })
        response.data.on('error', (err) => {
            console.log(err)
            reject()
        })
    })
}

const items = [];

con.connect(err => {
    if (err) throw err;
    console.log("Connected to db");

    const sql = "SELECT item_id, filename from mylife_main.items";

    con.query(sql, async (err, res) => {
        if(err) throw err;

        console.log('Reading items from db...')

        for(let item of res) {
            const first = String(item.item_id).substring(0,2);
            const next = String(item.item_id).substring(2,4);
            const path = `${first}/${next}/${item.item_id}`;
            const saveName = `${item.item_id}.swf`
            const swfUrl = `${cdnUrl}/${path}/${saveName}`
            if(item.item_id > 999) {
                if(item.hasOwnProperty("filename")) {
                    if(typeof(items.filename) !== null) items.push({ swfUrl, filename: `${item.filename}.swf`})
                }

            }
        }

        console.log('Done.')

        console.log('Starting asset retrieval...')

        for(let item of items) {
            await downloadSwf(item.swfUrl, item.filename);
        }

        console.log('Done.')
    });
})
