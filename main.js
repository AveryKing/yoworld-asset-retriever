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
            items.push({itemId:item.item_id, filename:item.filename});
        }

    })
})