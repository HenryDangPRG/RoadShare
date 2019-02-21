var assert = require('assert');
var mysql_util = require('../util/mysql_util');

describe("Check Tables Exist", function(){
    it("should find the USERS table", function(){
        mysql_util.getQuery("SHOW TABLES LIKE 'users'", function(results){
            assert.ok(results[0] != undefined); 
        });
    });
});
