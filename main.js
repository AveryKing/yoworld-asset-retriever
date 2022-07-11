'use strict'

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const mysql = require('mysql')

const cdnUrl = 'https://yw-web.yoworld.com/cdn/items'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

async function downloadSwf(url, filename) {
    const path = Path.resolve(__dirname, 'items', filename)

    const response = await Axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {'User-Agent': 'Mozilla/5.0'}
    })
        .catch((err) => {
            console.log('error downloading ' + filename)
        })

    if(response) {
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
    } else {
        console.log(`Error downloading ${filename}`)
    }

}


let items = [];

con.connect(err => {
    if (err) throw err;
    console.log("Connected to db");

    const sql = "SELECT item_id, filename from mylife_main.items";

    con.query(sql, async (err, res) => {
        if (err) throw err;

        console.log('Reading items from db...')
        let itemnum = 0;
        for (let item of res) {
            const first = String(item.item_id).substring(0, 2);
            const next = String(item.item_id).substring(2, 4);
            const path = `${first}/${next}/${item.item_id}`;
            const saveName = `${item.item_id}.swf`
            const swfUrl = `${cdnUrl}/${path}/${saveName}`
            if (item.item_id > 999) {
                items.push({
                    swfUrl,
                    filename: item.filename
                });
            }
        }

        const invalid = ['', 'null', null];
        const filteredItems = items.filter(x => x.hasOwnProperty('filename') && !invalid.some(y => x.filename == y));
        let remaining = filteredItems.length;

        for(let i of filteredItems) {
                await downloadSwf(i.swfUrl, `${i.filename}.swf`)
                remaining--;
                console.log(`${remaining} items remaining`)
        }

        console.log('Done.')

    });
})
