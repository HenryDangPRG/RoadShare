var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var mysqlConfig = require('./config/mysql_config');
var databaseOptions = mysqlConfig.databaseOptions;

var con = mysql.createConnection(databaseOptions);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, function(){
    console.log("Server started on port 8080");
    con.connect(function(err){
        if(err){
            throw err;
        } else {
            console.log("Successfully connected to MySQL database on port "
                + databaseOptions["port"]);
            con.query("SELECT * FROM users", function (err, result){
                console.log(result);
            });
        }
    });
});

