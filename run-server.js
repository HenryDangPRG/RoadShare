var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var mysql_util = require('./util/mysql_util');

var express_hbr = require('express-handlebars');
var bodyParser = require('body-parser');

var interpsuite = require('./util/interp');

var everpolate = require('everpolate')

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

    var start_lat = req.query.start_lat;
    var start_long = req.query.start_long;

    var end_lat = req.query.end_lat;
    var end_long = req.query.end_long;

    console.log(start_date);
    var query = mysql.format('INSERT INTO routes (user_id, route_name, start_date) VALUES (?,?,?)', [user_id, route_name, start_date]);
    console.log(query); 
    mysql_util.getQuery(query,function(results){
        try {
            console.log("Added new route for user : " + user_id);

            var query = mysql.format('SELECT route_id FROM routes WHERE user_id = ?', [user_id]);

            mysql_util.getQuery(query,function(results){
                try {
                    var insertQuery = mysql.format("INSERT INTO checkpoints (route_id, name, latitude, longitude) VALUES (?, 'start', ?, ?)",
                        [results[results.length-1].route_id, start_lat, start_long]);
                    var insertQuery2 = mysql.format("INSERT INTO checkpoints (route_id, name, latitude, longitude) VALUES (?, 'end', ?, ?)",
                        [results[results.length-1].route_id, end_lat, end_long]);
                    //console.log(results);
                    //console.log(results[results.length-1].route_id.toString());

                    // res.status(200).send("11");
                    res.write((results[results.length-1].route_id).toString());
                    res.end();

                    mysql_util.getQuery(insertQuery, function(results){
                        mysql_util.getQuery(insertQuery2, function(results){});
                    });
                    // res.status(200).send("ERROR");
                } catch (err){
                    console.log(err);
                    res.write("ERROR");
                    res.end();
                    return;
                }
            });   
        } catch (err){
            res.sendStatus(400).send("-1");
            return;
        }
    });   
})

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

app.get("/calculate", function(req, res){
    console.log(req.query);
    var route_id = parseInt(req.query.routeId);
    var user_id = parseInt(req.query.userId);
    var numHours = parseInt(req.query.numHours);

    var query = 'SELECT timestamp, latitude, longitude FROM markers WHERE markers.route_id = ?'
    var query = mysql.format(query, [route_id]);

    mysql_util.getQuery(query, function(results){
        times = []
        lats = []
        longs = []

        for(var i = 0; i < results.length; i++){
            times.push(results[i].timestamp);
            lats.push(results[i].latitude);
            longs.push(results[i].longitude);
        }

        linear = everpolate.linear;
        firstData = results[0];
        console.log("Passed : " + numHours);

        oneHourLater = times[results.length - 1] + (numHours * 3600);
        interpolatedLat = linear([oneHourLater], times, lats)
        interpolatedLong = linear([oneHourLater], times, longs)

        console.log(interpolatedLat);
        console.log(interpolatedLong);
        dist = getDistanceFromLatLonInKm(firstData.latitude, firstData.longitude, interpolatedLat[0], interpolatedLong[0]);
        distInMeters = dist * 1000;
        res.write(distInMeters.toString());
        //res.write(deltaMag.toString());
        //console.log("Final result is : " + deltaMag);
        res.end();
    });
});


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
