var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 4000);

console.log('Server running..... Different');
console.log('Successfull on %s',server.address().port);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));                                //static files cached

app.get('/',function(req,res){
  res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection',function(socket){
        connections.push(socket);
        console.log('Connected: %s sockets connected',connections.length);
        //disconnect
        socket.on('disconnect',function(data){

          users.splice(users.indexOf(socket.username),1);
          updateUsernames();
          connections.splice(connections.indexOf(socket),1);
          console.log('Disconnected: %s sockets connected',connections.length);
        });

        //send message
        socket.on('send message',function(data){
          io.sockets.emit('new message',{msg:data, user:socket.username});
        });

        //new user
        socket.on('new user',function(data, callback){
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
        });
        function updateUsernames(){
            io.sockets.emit('get users',users);
        }
});
