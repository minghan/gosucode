/*****************************
    Configurations
*****************************/

var globals = {
    port: 8080
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

var instream = fs.createReadStream("/dev/input/event3",
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

/* global stats of the session so far*/
var metastats = { 
    
    mood : 0,
    decay: 0,
    cur_cpm : 0,    
    odo : 0,
    time_elapsed: 0,
    idle_elapsed: 0,
    active_elapse: 0,
    idle_ratio : 0,
    active_ratio : 0
};

var inputQueue = new Array();


/* meta stat digest */
/*

   */

var timer_period = 2000;
var MOOD_SLACK = 0;
var MOOD_CODE = 1;
var MOOD_SPAM = 2;
var MOOD_SPAM_BAR = 200;
var MOOD_CODE_BAR = 50;

function timer_handler()
{
    metastats.time_elapsed += timer_period;

    var len = inputQueue.length;
    if(len > 0) 
    {

        
        var dt = inputQueue[len-1]-inputQueue[0];
        metastats.idle_elapsed += timer_period-dt;
        metastats.active_elapsed += dt;
        metastats.cur_cpm = (len*10000)/dt;
        metastats.odo+=len;
    }
    else
    {
        metastats.cur_cpm = 0;
        metastats.idle_elapse+= timer_period;
    }


    metastats.idle_ratio = metastats.idle_elapsed/metastats.time_elapsed;
    metastats.active_ratio = metastats.active_elapsed/metastats.time_elapsed;
    compute_mood();

    // clear the queue 
    inputQueue = new Array();
    //emit metadata
     allusers.forEach(function (someuser) {
        someuser.socket.emit('meta', metastats);
    });

}

function compute_mood()
{ 
    if(metastats.mood == MOOD_SLACK)
    {
        if(metastats.cur_cpm >0)
        {
            metastats.decay = 5;
            metastats.mood = MOOD_CODE;
        }
    }
    else if(metastats.mood == MOOD_CODE)
    {
        if(metastats.cur_cpm <=0)
        {   
            metastats.decay--;
            if(metastats.decay<0)
            {
                metastats.mood = MOOD_SLACK;
            }
        }
        if(metastats.cur_cpm > MOOD_SPAM_BAR)
        {
            metastats.decay = 1;
            metastats.mood = MOOD_SPAM;
        }
    }
    else
    {
        if(metastats.cur_cpm< MOOD_SPAM_BAR)
        {
            metastats.decay--;
            if(metastats.decay<0)
            {
                metastats.mood = MOOD_CODE;
            }
        }
    }
}

setInterval(timer_handler, timer_period);

// keyboard instant poke
instream.addListener('data', function(chunk) {
    inputQueue.push(Date.now());
    var sendobj = { i : ' ', t: Date.now() }; // minimze payload
    allusers.forEach(function (someuser) {
        someuser.socket.emit('in', sendobj);
    });
    // console.log("ok");
});


// http server

app.listen(globals.port);

function http_handler(req, res) {
    console.log("-> Request: " + req.url);
    var filepath;
    if (req.url == '/') {
        filepath = "index.html";
    } else {
        filepath = req.url;
    }
    filepath = path.join(__dirname, '../client/', filepath);
    
    var extname = path.extname(filepath);

    path.exists(filepath, function (exists) {
        if (exists) {
            var contentType = 'text/html';
            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.htm':
                case '.html':
                    contentType = 'text/html';
                    break;
                default:
                    contentType = 'text/plain';
                    break;
            };

            fs.readFile(filepath,
                function (err, data) {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Error loading index.html');
                    }

                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data, 'utf-8');
                }
            );
        } else {
            res.writeHead(404);
            res.end();
        }
    });
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

io.set('log level', 1); // reduce logging


/*****************************
  Snippets
 *****************************/




/****************************/

console.log("Goso Server Started");

