var express = require('express');
var app = express();
var path = require('path');

var mysql = require('mysql');
var mysql_util = require('./util/mysql_util')

var express_hbr = require('express-handlebars');

var hbr = express_hbr.create({});
app.use(express.static(path.join(__dirname, 'views')));

app.engine('handlebars', hbr.engine);
app.set('view engine', 'handlebars');

app.listen(8080, function(){
    console.log("Server started on port 8080");
});

// This is nececssary because the SQL call happens aysnchronously
function renderUserPage(res, name, id){
    res.render('main',{
        showTitle : true,
        helpers : {
            user: function() { 
                return name;
            },
            id : function() {
                return id; 
            },
        }
    });
}
app.get('/user/:userId', function(req, res){
    var id = parseInt(req.params.userId);
    var query = mysql.format('SELECT username FROM users WHERE ID = ?', [id]);
    var username = "";
    mysql_util.getQuery(query, function(results){
        try {
            renderUserPage(res, results[0].username, id)
        } catch (err){
            console.log("[Rendering Error] " + err);
            renderUserPage(res, "User Not Found");
        }
    });
});

// You need to make a GET AJAX request to /update
app.get('/update', function(req, res){
    
});
