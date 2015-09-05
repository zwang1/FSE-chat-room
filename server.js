/**
 * Created by zhengyiwang on 8/29/15.
 */
/*
 will use the following development stack:
 Framework:
    Express
 Middleware:
    Body parser
 Libs:
    HTTP, Underscore, SocketIO
 Database:
    SQLite
 */
var express = require('express'),
    app = express(),
    httpserver = require('http').createServer(app),
    io = require('socket.io')(httpserver),
    bodyParser = require('body-parser'),
    _ = require('underscore');


// Server config
app.set('ipaddr', '127.0.0.1');
app.set('port', 8080);

//Jade
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//Static files
app.use(express.static('public'));

//Support JSON requests
app.use(bodyParser.json());

//route handler
app.get('/', function(request, response) {
    response.render('index');
});

//connected users list
var currentusers = {};
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');

db.serialize(function(){
    db.run('CREATE TABLE IF NOT EXISTS chatting (name TEXT, message TEXT, time DATE)');

});



// Socket.IO events
io.on('connection', function(socket){
    console.log('socket connected');



    //when a new user login request comes
    socket.on('newuser',function(data){

        this.db = db;

        //if same name has login in current user list, deny
        if(currentusers.hasOwnProperty(data.name)){
            io.sockets.emit('newuserdenied');
            console.log('one user denied');
        }
        // TODO ---------if name is in DB,get all messages and emit to client---ONLY this client
        else {
            var nameExist = false;
            db.get('SELECT *  FROM chatting ', function(err,row){
                nameExist = true;
            });
            db.get('select * from chatting', function(err,row){
                console.log('hhhhh');
            });
            if(nameExist ){
                console.log(row.name + 'returned');
                var dt = new Date();
                dt.setDate(dt.getDate() - 1);
                console.log('dt');
                db.all('SELECT name, message,time FROM chatting WHERE name = ?', [data.name],function(err, row){
                    console.log(row.name  + row.message + row.time);
                    //io.sockets.connected[data.id].emit('returninguser',{mess:'i will give you all messages'});
                });

                //TODO--------
            }
            else
            {
                currentusers[data.name] = data.id;
                io.sockets.connected[data.id].emit('newuseraccepted');
                console.log('new user login' + data.name);
            }

        }

    })



    socket.on('leaveRoom', function(data) {
        delete currentusers[data.name];
        console.log('a user left  '+ data.name);
    });

    socket.on('disconnect', function() {
        for (var k in currentusers){
            if (currentusers[k] === this.id){
                delete currentusers[k];
                console.log('a user left   '+ k);
                break;
            }
        }

    });

    socket.on('IHaveSomethingNew',function(data){
        console.log(typeof(data.time));
        data.time.t
        socket.broadcast.emit('newmessagecoming',data);
        db.run('INSERT INTO chatting (name, message, time) VALUES(?,?,?)', [data.name, data.message, data.time]);
    })


});


//Start the http server
httpserver.listen(app.get('port'), app.get('ipaddr'), function() {
    console.log('Server up and running. Go to http://' + app.get('ipaddr') + ':' + app.get('port'));
});