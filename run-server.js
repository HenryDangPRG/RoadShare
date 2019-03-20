var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var mysql_util = require('./util/mysql_util');

var express_hbr = require('express-handlebars');
var bodyParser = require('body-parser');

var interpsuite = require('./util/interp');

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
    var id = parseInt(req.query.id);
    var route_id = parseInt(req.query.route_id);

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

app.get('/login', function(req, res){
    //var query = `SELECT user_name FROM user2 WHERE user_name =${userid} && password=${password}`;
    var Userid = req.query.userid; 
    var password = req.query.password; 
    var query = mysql.format('SELECT user_name FROM user2 WHERE user_name =? && password=?', [Userid,password]);
    console.log(query);
    console.log(Userid, password);
    mysql_util.getQuery(query, function(results){
        try {
             res.status(200).send(JSON.stringify(results));
             console.log(results); 
        } catch (err){
            console.log(err); 
        }
    });
});

app.get('/adduser',function(req,res){
    res.redirect('./signup.html');
});
app.get('/signup', function (req, res) {
    console.log("i am in SignUP"); 
    var Userid = req.query.userid; 
    var password = req.query.password; 
    var query = mysql.format('INSERT INTO user2 (user_name, password) VALUES (?,?)', [Userid,password]);
    console.log(query); 
    mysql_util.getQuery(query, function(results){
        try {
            res.status(200).send("SUCCESS");
             console.log(results); 
        } catch (err){
            res.status(200).send("ERROR"); 
        }
    });
});

app.get('/welcome',function(req,res){
    res.redirect('./welcome.html');
}); 


app.get('/update', function(req, res){
    var sql = mysql.format('SELECT timestamp, latitude, longitude FROM markers, routes, users WHERE  markers.route_id = routes.route_id && user_id = ?', [id]);
    // var sql = mysql.format('SELECT timestamp, latitude, longitude FROM markers, routes, users WHERE  markers.route_id = routes.route_id && routes.route_id = ? && user_id = ?', [route, id]);
    console.log(sql); 
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
    var uid = parseInt(req.query.userId);
    var rid = parseInt(req.query.routeId);
    var dat = req.body.points;

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
})

app.get("/newRoute", function(req, res){
    var user_id = req.query.user_id;
    var route_name = req.query.route_name;
    var start_date = req.query.start_date;
    var query = mysql.format('INSERT INTO routes (user_id, route_name, start_date) VALUES (?)', [user_id, route_name, start_date]);

    mysql_util.getQuery(query,function(results){
        try {
            console.log("Added new route for user : " + user_id);

            var query = mysql.format('SELECT route_id FROM routes WHERE user_id = ?', [user_id]);

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
})

app.get("/calculate", function(req, res){
    console.log(req.query);
    var user_id = parseInt(req.query.user_id);
    var route_id = parseInt(req.query.route_id);

    var query = 'SELECT timestamp, accelerometer_x, accelerometer_y FROM markers WHERE markers.route_id = ?'
    var query = mysql.format(query, [route_id]);

    mysql_util.getQuery(query, function(results){
        try {
            n=results.length;
            pointsxy=[];
            for (var i=0; i<results.length;i++)
                pointsxy.append([results['timestamp'],results['accelerometer_x'],results['accelerometer_y']]);
            res.write(""+interpsuite.getDeltaMag_m(pointsxy));
            res.end();
        } catch (err){
            console.log("[CalcError] Error calculating displacement: " + err);
        }
    });
});


// TODO : Finish this endpoint
app.get('/startend', function(req, res){
    var route_id = parseInt(req.query.route_id);

    var queryStart = 'SELECT latitude, longitude FROM checkpoints, routes WHERE checkpoints.route_id=routes.route_id && checkpoints.route_id = ? && checkpoints.name="start"';
    var queryStart = mysql.format(queryStart, [route_id]);

    var queryEnd = 'SELECT latitude, longitude FROM checkpoints, routes WHERE checkpoints.route_id=routes.route_id && checkpoints.route_id = ? && checkpoints.name="end"';
    var queryEnd = mysql.format(queryEnd, [route_id]);

    mysql_util.getQuery(queryStart, function(results){
        try {
            start_lat = results[0].latitude;
            start_long = results[0].longitude;
            mysql_util.getQuery(queryEnd, function(results_2){
                end_lat = results_2[0].latitude;
                end_long = results_2[0].longitude;
                res.json({
                    "start_lat" : start_lat,
                    "start_long" : start_long,
                    "end_lat" : end_lat,
                    "end_long" : end_long,
                });
                res.end();
            });
        } catch (err){
            console.log("[MySQL Error] " + err);
        }
    });
});
