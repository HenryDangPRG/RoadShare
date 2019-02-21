var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, function(){
    console.log("Server started on port 8080");
});

