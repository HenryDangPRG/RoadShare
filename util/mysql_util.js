var mysql = require('mysql');
var mysql_config = require('../config/mysql_config');
var pool = mysql.createPool(mysql_config.databaseOptions);

// Wraps your query with error-handling so that you don't have to
// keep doing if(error) throw err each time
function getQuery(query, callback){
    pool.query(query, function(err, results, fields) {
        if(err){
            throw "[MySQL] " + err
        } else {
            callback(results);
        }
    });
}

module.exports  = {
    pool : pool,
    getQuery : getQuery,
}
