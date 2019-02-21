var express = require('express');
var app = express();
var path = require('path');
var mysql_util = require('./util/mysql_util')

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, function(){
    console.log("Server started on port 8080");
});

