const mysql = require('mysql');
const fs = require('fs');
const request = require('request');

const imageCdnUrl = 'https://yw-web.yoworld.com/cdn/items';
const swfCdnUrl = '';

!fs.existsSync(`item_images`) && fs.mkdirSync(`item_images`);

const downloadImage = ((uri, path, filename, callback) => {
        request.head(uri, () => {
        let pieces = path.split('/');
        !fs.existsSync(`item_images/${pieces[0]}`) && fs.mkdirSync(`item_images/${pieces[0]}`);
        !fs.existsSync(`item_images/${pieces[0]}/${pieces[1]}`) && fs.mkdirSync(`item_images/${pieces[0]}/${pieces[1]}`);
        request(uri).pipe(fs.createWriteStream(`item_images/${path}/${filename}`)).on('close', callback);
    });
})

const con = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:''
});

const items = [];

con.connect(err => {
    if (err) throw err;
    console.log("Connected to db");

    const sql = "SELECT item_id, filename from mylife_main.items";

    con.query(sql, (err, res) => {
        if(err) throw err;

        for(let item of res) {
            const first = String(item.item_id).substring(0,2);
            const next = String(item.item_id).substring(2,4);
            const path = `${first}/${next}/${item.item_id}`;
            const saveName = `${item.item_id}_60_60.gif`

           /*
            downloadImage(`${imageCdnUrl}/${path}/${saveName}`, `${first}/${next}`, saveName, () => {

                console.log('done');
            });
  */
            items.push({
                itemId:item.item_id,
                filename:item.filename,
                path:`${first}/${next}/${item.item_id}`
            });
        }

        downloadImage('https://yw-web.yoworld.com/cdn/items/29/96/29962/29962_130_100.gif', 'it/works', 'hair.png', function(){
            console.log('done');
        });
    });
})

