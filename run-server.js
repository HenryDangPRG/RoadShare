var express = require('express');
var app = express();
var path = require('path');
var id;
var mysql = require('mysql');
var mysql_util = require('./util/mysql_util')

var express_hbr = require('express-handlebars');
var bodyParser = require('body-parser')

var hbr = express_hbr.create({});
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.engine('handlebars', hbr.engine);
app.set('view engine', 'handlebars');

app.listen(8080, function(){
    console.log("Server started on port 8080");
});

// This is nececssary because the SQL call happens aysnchronously
function renderUserPage(res, name, id, route_id){
    res.render('main_develop',{
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

app.get('/user', function(req, res){
    id = parseInt(req.query.id);
    route_id = parseInt(req.query.route_id);

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

app.post('/data', function(req, res) {
    uid = parseInt(req.query.userId);
    rid = parseInt(req.query.routeId);
    dat = req.body.points;

    res.status(200).send("OK");

    var vals = '';
    for (var i=0; i<dat.length;i++) {
        vals=vals+'(';
        vals=vals+dat[i]['route_id']+',';
        vals=vals+dat[i]['timestamp']+',';
        vals=vals+dat[i]['accelerometer_x']+',';
        vals=vals+dat[i]['accelerometer_y']+',';
        vals=vals+dat[i]['accelerometer_z']+',';
        vals=vals+dat[i]['latitude']+',';
        vals=vals+dat[i]['longitude'];
        vals=vals+')'
        if (i<dat.length-1) vals=vals+', ';
    }
    vals=vals+';'
    var query ='INSERT INTO markers'
                    +' (route_id, timestamp, accelerometer_x, accelerometer_y, accelerometer_z, latitude, longitude ) '
                +' VALUES '
                    +vals;
    
    mysql_util.getQuery(query, function(results) {
        try {
            console.log(results)
        } catch (err) {
            console.log("Error storing markers " + err);
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
