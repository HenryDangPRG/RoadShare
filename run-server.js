var express = require('express');
var app = express();
var path = require('path');
var id;
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
function renderUserPage(res, name, id, route_id){
    res.render('main',{
        showTitle : true,
        helpers : {
            user: function() { 
                return name;
            },
            id : function() {
                return id; 
            },
            route_id : function() {
                return route_id;
            }
        }
    });
}

app.get('/user/:userId/:route_id', function(req, res){
    console.log(req.params)
    id = parseInt(req.params.userId);
    route_id = parseInt(req.params.route_id);
    console.log(route_id);

    var query = mysql.format('SELECT users.username, routes.route_id FROM routes, users WHERE routes.user_id=users.ID && ID = ? && route_id = ?', [id, route_id]);
    mysql_util.getQuery(query, function(results){
        try {
            console.log(results);
            renderUserPage(res, results[0].username, id, results[0].route_id)
        } catch (err){
            console.log("[Rendering Error] " + err);
            renderUserPage(res, "<User Or Route Id Not Found>");
        }
    });
});

app.get('/update', function(req, res){
   
    var sql = mysql.format('SELECT timestamp, latitude, longitude FROM markers, routes, users WHERE  markers.route_id = routes.route_id && user_id = ?', [id]);
    mysql_util.getQuery(sql,function(results){
        try {
                res.status(200).send(JSON.stringify(results)); 
                console.log(JSON.stringify(results));

        } catch (err){
            res.status(200).send({lat:40, lng: -75});
        }
    });   
});

app.get("/newUser", function(req, res){
    var userName = req.query.username;
    var query = mysql.format('INSERT INTO users (username) VALUES (?)', [userName]);

    mysql_util.getQuery(query,function(results){
        try {
            console.log("Added new user : " + userName);

            var query = mysql.format('SELECT id FROM users WHERE userName = ?', [userName]);

            mysql_util.getQuery(query,function(results){
                try {
                    res.sendStatus(200).send(results[results.length-1].id);
                } catch (err){
                    res.sendStatus(400).send("-1");
                    return;
                }
            });   
        } catch (err){
            res.sendStatus(400).send("-1");
            return;
        }
    });   

});
