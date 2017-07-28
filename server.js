/**
 * Created by lydialai on 2017/7/10.
 */
var chatters = new Array();
var users= new Array();
var express = require('express');
var app = express(),
    server = require('http').createServer(app);
var name;
app.use("/style", express.static(__dirname + '/style'));
app.use("/content",express.static(__dirname + '/content'));
app.use("/room",express.static(__dirname + '/room'));
app.get( '/untitled2', function (req, res,next) {
   // res.sendFile(__dirname + "/" + "room.html");
    res.sendFile(__dirname + "/" + "init.html");

});



var roomno = 1;
var io = require('socket.io')(server);
var chatter;
io.on('connection', function (socket) {
    socket.emit('news','hi');
    socket.on('userName', function (name) {

        this.name = name;
        //console.log("inusername"+socket.name);
       socket.name=name;
       if (users.indexOf(name)>-1){
           console.log("name has existed");
           socket.emit('nameExisted');
       }
       else
       {
           users.push(name);
           console.log(users);
           socket.emit('success',name);
           socket.emit('displayExistingName', users);
           //io.emit('addName', name);
           socket.broadcast.emit('addName',name);
       }

       // socket.on('remove', function (data) {
       //      users.splice(users.indexOf(data)-1,1);
       //      // console.log(data);
       //  });
    });
    
    socket.on('sendMsg',function (msg) {
        // console.log(msg);
        socket.emit('postMyMsg',{
            username: socket.name,
            message: msg
        });
        socket.broadcast.emit('postOthers',{

            username: socket.name,
            message: msg
        });
    });

    socket.on('connectToRoom',function (data) {
        if(io.nsps['/'].adapter.rooms[roomno] && io.nsps['/'].adapter.rooms[roomno].length > 1)
            roomno++;
        socket.join(roomno);
        io.sockets.in(roomno).emit('joinRoom', "You are in room no. "+roomno);

        if (chatters.indexOf(data)>-1){

            console.log(chatters);
            console.log("name has existed");
            socket.emit('nameExisted');
        }
        else
        {
            chatters.push(data);
chatter=data;
            console.log(chatters);
            socket.emit('success',data);
            socket.emit('displayChatter',{
                chatter:chatter,
                chatters:chatters
            });
            io.sockets.in(roomno).emit('usersInRoom',data)
        }

        socket.on('sendChat',function (data) {
          //  console.log(socket.name);
            socket.emit('post',{

                username: chatter,
                message: data
            });
            socket.broadcast.to(roomno).emit('postOthers',{
                username: chatter,
                message: data
            });
        })


    });

    socket.on('disconnect',function (data) {
        console.log("disconn" + socket.name);
        users.splice(users.indexOf(socket.name),1);
        console.log("after"+users);
        socket.broadcast.emit('userLeft',{
            user:socket.name,
            users:users
        })
    });






});

server.listen(80);
console.log("success");



