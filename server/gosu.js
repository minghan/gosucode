/*****************************
    Configurations
*****************************/

var globals = {
};


/*****************************
    Includes
*****************************/

var sys = require('sys');
var net = require("net");
var fs = require("fs");
var http = require('http');
var path = require("path");

/*****************************
    Variables
*****************************/

var instream = fs.createReadStream("/dev/input/event12",
    {   'flags': 'r',
        'bufferSize': 1024
    }
);


var app = http.createServer(http_handler);
var io = require('socket.io').listen(app);

var allusers = [];

/*****************************
    Classes
*****************************/

function User(socket) {
    this.socket = socket;
}

/*****************************
    Main Stuff
*****************************/

// keyboard

instream.addListener('data', function(chunk) {
    var sendobj = { i : ' ', t: Date.now() }; // minimze payload
    allusers.forEach(function (someuser) {
        someuser.socket.emit('in', sendobj);
    });
    // console.log("ok");
});


// http server

app.listen(80);

function http_handler(req, res) {
    console.log(req);
    fs.readFile(path.join(__dirname, '../client/index.html'),
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        }
    );
}

// socket stuff

io.sockets.on('connection', function (sock) {

    var user = new User(sock);
    allusers.push(user);

    // for fun
    sock.emit('news', { hello: 'world' });
    
    sock.on('disconnect', function() {
        var i = allusers.indexOf(user);
        allusers.splice(i, 1);
    });

});

// io.set('log level', 1); // reduce logging


/*****************************
  Snippets
 *****************************/




/****************************/

console.log("Goso Server Started");

