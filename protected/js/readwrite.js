var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
exports.evx = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
//var child = require('child_process').fork('../protected/js/chil_readwrite.js');

//ev.setMaxListeners(100);
var pile = [];
process.on('message', function(m) {
// util.log(util.inspect(m));
	ev.emit(m.callback,m.e,m.output);
});

exports.each = function(enom,etype,ecallback){

	tmp = {}
	tmp.rw = "readall";
	tmp.nom = enom;
	tmp.type = etype;
	
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
	//child.send(tmp);
};
exports.get = function(enom,etype,ecallback){
	tmp = {};
	tmp.rw = "read";
	tmp.nom = enom;
	tmp.type = etype;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
	//child.send(tmp);
};
exports.readfile = function(enom,ecallback){
	tmp = {};
	
	tmp.rw = "read";
	tmp.nom = enom;
	tmp.type = "";
	tmp.callback = "";
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	tmp.callback = Math.floor(Math.random()*10000000000);
	//tmp.callback = JSON.stringify(tmp.callback);
	//util.log(tmp.callback);
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
	//child.send(tmp);

};

exports.readFile = function(enom,format,ecallback){//true
	tmp = {};
	tmp.format = format;
	tmp.rw = "readFile";
	tmp.nom = enom;
	tmp.output = 0;
	tmp.e = 0;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
};

exports.writeFile = function(enom,arg,format,ecallback){
	tmp = {};
	tmp.format = format;
	tmp.rw = "writeFile";
	tmp.nom = enom;
	tmp.arg = arg;
	tmp.output = 0;
	tmp.e = 0;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));;
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
};



exports.dbwrite5 = function(enom,req,arg1,arg2,arg3,arg4,arg5,ecallback){
	tmp = {};
	tmp.rw = "write5";
	tmp.nom = enom;
	tmp.type = req;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	tmp.arg1 = arg1;
	tmp.arg2 = arg2;
	tmp.arg3 = arg3;
	tmp.arg4 = arg4;
	tmp.arg5 = arg5;
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
	//child.send(tmp);

};
exports.dbwrite1 = function(enom,req,ecallback){
	//util.log(ecallback);
	tmp = {};
	tmp.rw = "write1";
	tmp.nom = enom;
	tmp.type = req;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);
	//child.send(tmp);

};
exports.dbwrite4 = function(enom,req,arg1,arg2,arg3,arg4,ecallback){
	tmp = {};
	tmp.rw = "write4";
	tmp.nom = enom;
	tmp.type = req;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
	tmp.arg1 = arg1;
	tmp.arg2 = arg2;
	tmp.arg3 = arg3;
	tmp.arg4 = arg4;
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);

};
exports.exists = function(enom,ecallback){
	tmp = {};
	tmp.rw = "exist";
	tmp.nom = enom;
	tmp.callback = (enom+Math.floor(Math.random()*10000000000));
		tmp.output = 0;
	tmp.e = 0;

	ev.once(tmp.callback,ecallback);
	process.send(tmp);
};

exports.insert = function(enom,arg,ecallback){
	tmp = {};
	tmp.rw = "insert";
	tmp.nom = enom;
	tmp.callback =(enom+Math.floor(Math.random()*10000000000));
	tmp.arg = arg;
	
	ev.once(tmp.callback,ecallback);
	process.send(tmp);

};