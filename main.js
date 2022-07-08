let mysql = require('mysql');

let con = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:''
});

const items = [];

con.connect(err => {
    if (err) throw err;
    console.log("Connected to db");

    let sql = "SELECT item_id, filename from mylife_main.items";

    con.query(sql, (err, res) => {
        if(err) throw err;

        for(let item of res) {
            let first = String(item.item_id).substring(0,2);
            let next = String(item.item_id).substring(2,4);
            items.push({
                itemId:item.item_id,
                filename:item.filename,
                path:`${first}/${next}/${item.item_id}/`
            });
        }

        console.log('done')

    });
})

