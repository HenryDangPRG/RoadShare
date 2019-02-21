# RoadShare
A real-time location sharer using JavaScript and NodeJS that works even if you lose connection.

NOTE : The config file for the MySQL server should technically be private, but it isn't,
because this is a toy project, and setting up a system using environmental variables is
not worth the effort since this project is private anyway.

Your settings must be as follows :
```
host : "localhost",
database : "roadshare",
user : "roadshare",
password : "password",
port : "3306"
```

Once you have this setup, you will need to use the roadshare.sql file, which is
a MySQL dump of the table configuration that you need. Simply load the sql file
and you are set.
