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
    id = parseInt(req.params.userId);
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
    //console.log(req.body)
    res.status(200).send("OK");
    
    var vals = ''
    for (var i; i<dat.length;i++) {
        vals=vals+'(';
        vals=vals+dat[i]['route_id']+',';
        vals=vals+dat[i]['timestamp']+',';
        vals=vals+dat[i]['accelerometer_x']+',';
        vals=vals+dat[i]['accelerometer_y']+',';
        vals=vals+dat[i]['accelerometer_z']+',';
        vals=vals+dat[i]['latitude']+',';
        vals=vals+dat[i]['longitude'];
        vals=vals+'),\n';
    }
    vals+=';'
    var query ='INSERT INTO markers \
                    (route_id, timestamp, accelerometer_x, accelerometer_y, accelerometer_z, latitude, longitude) \
                VALUES \
                    '+vals;
    mysql_util.getQuery(query, function(results) {
        try {
            console.log(results)
        } catch (err) {
            console.log("Error storing markers] " + err);
        }
    });
    
    //msg=""+uid+":"+rid+"-"+dat[0]['timestamp']+" ("+dat[0]['accelerometer_x']+","+dat[0]['accelerometer_y']+")"
    //console.log("Received "+dat.length+" points");
    //console.log(msg);
});