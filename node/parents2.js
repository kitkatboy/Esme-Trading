var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();

var pile = [];

var server = require('child_process').fork('./server.js');
var recuperation_articles = require('child_process').fork('../protected/js/recuperation_articles.js');
var flux_cac400 = require('child_process').fork('../protected/js/flux_cac400.js');
var flux_globale = require('child_process').fork('../protected/js/flux_globale.js');
/*
setInterval(function () {
	util.log("-------->"+pile.length);
}, 1000);
*/

server.on('message', function(m) {
	m.pr = 'server';
	pile[pile.length] = m;
	//util.log(util.inspect(m));
	if(pile.length == 1)
	{
		gestion();
	}
});

server.on('disconnect',function(r){
server.kill();
	util.log("server disconnect");
	setTimeout(function(){var server = require('child_process').fork('./server.js')},1000)
	
});
server.on('error',function(r){
	util.log("server error");
	var server = require('child_process').fork('./server.js');
});
server.on('exit',function(r){
	util.log("server exit");
	var server = require('child_process').fork('./server.js');
});
server.on('close',function(r){
	util.log("server clos");
	var server = require('child_process').fork('./server.js');
});

flux_cac400.on('disconnect',function(r){
	util.log("flux_cac400 disconnect");
	var flux_cac400 = require('child_process').fork('../protected/js/flux_cac400.js');
});
flux_cac400.on('error',function(r){
	util.log("flux_cac400 error");
	var flux_cac400 = require('child_process').fork('../protected/js/flux_cac400.js');
});
flux_cac400.on('exit',function(r){
	util.log("flux_cac400 exit");
	var flux_cac400 = require('child_process').fork('../protected/js/flux_cac400.js');
});
flux_cac400.on('close',function(r){
	util.log("flux_cac400 clos");
	var flux_cac400 = require('child_process').fork('../protected/js/flux_cac400.js');
});

flux_globale.on('disconnect',function(r){
	util.log("flux_globale disconnect");
	var flux_globale = require('child_process').fork('../protected/js/flux_globale.js');
});
flux_globale.on('error',function(r){
	util.log("flux_globale error");
	var flux_globale = require('child_process').fork('../protected/js/flux_globale.js');
});
flux_globale.on('exit',function(r){
	util.log("flux_globale exit");
	var flux_globale = require('child_process').fork('../protected/js/flux_globale.js');
});
flux_globale.on('close',function(r){
	util.log("flux_globale clos");
	var flux_globale = require('child_process').fork('../protected/js/flux_globale.js');
});


recuperation_articles.on('message', function(m) {
	m.pr = 'recuperation_articles';
	pile[pile.length] = m;
	util.log("+1");
	if(pile.length == 1)
	{
		gestion();
	}
});

//Fonction de gestion de la pile
var gestion = function(){
	if(pile[0].rw == "read" && pile[0].type == "")
	{
		read(pile[0]);
	}
	else if(pile[0].rw == "readFile" && pile[0].format != "img")
	{
		readFile(pile[0]);
	}
	else if(pile[0].rw == "readFile")
	{
		readFilenl(pile[0]);
	}
	else if(pile[0].rw == "read")
	{
		readbaseget(pile[0]);
	}
	else if(pile[0].rw == "readall")
	{
		readbase(pile[0]);
	}
	else if(pile[0].rw == "write1")
	{
		writedb1(pile[0]);
	}
	else if(pile[0].rw == "write5")
	{
		writedb5(pile[0]);
	}
	else if(pile[0].rw == "write4")
	{
		writedb4(pile[0]);
	}
	else if(pile[0].rw == "writeFile")
	{
		writeFile(pile[0]);
	}
	else if(pile[0].rw == "exist")
	{
		exist(pile[0]);
	}else if(pile[0].rw == "insert")
	{
		insert(pile[0]);
	}
};
//Fonction de depillement
var depile = function(){
	// util.log("depile   "+pile.length);
	for(var i=0;i<(pile.length-1);i++)
	{
		pile[i] = pile[i+1];
	}
	pile.length = pile.length-1;
	
	if(pile.length != 0)
	{
		gestion();
	}
};
//fonction de chargement d'un ficher
var read = function(pile){
	var output;
	var tmp ={};
	fs.readFile(pile.nom,"UTF-8", function(e,d){
		if(e) {
			util.log("ERROR "+pile.nom+" : " + e);
			depile();
		} else if (d) {
			output = JSON.parse(d); // Chargement du dictionnaire de mots dans une variable
			tmp.callback = pile.callback;
			tmp.output = output;
			if(pile.pr == "server")
			{
				server.send(tmp);
			}else if(pile.pr == "recuperation_articles")
			{
				recuperation_articles.send(tmp);
			}
			depile();
		}
	});
	
};

var readFile = function(pile){
// util.log("---------------------------------"+pile.nom);
	fs.readFile(pile.nom,pile.format, function(e,d){
		if(e) {
			// util.log("ERROR "+pile.nom+" : " + e);
			pile.e = e;
			//depile();
		} else if (d) {
			pile.output = d; // Chargement du dictionnaire de mots dans une variable
			// pile.callback = pile.callback;
		}
		if(pile.pr == "server")
		{
			server.send(pile);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(pile);
		}
		depile();
	});
	
};

var readFilenl = function(pile){
	// util.log("//////////////////////////////////"+pile.nom);
	pile.output = "";
	fs.readFile(pile.nom, function(e,d){
		if(e) {
			// util.log("ERROR "+pile.nom+" : " + e);
			pile.e = e;
			//depile();
		} else if (d) {
			pile.output += d; // Chargement du dictionnaire de mots dans une variable
			// util.log("----------origine :"+pile.output.length);
			// util.log("----------string :"+typeof pile.output);
			// util.log(d);
			// pile.callback = pile.callback;
		}
		if(pile.pr == "server")
		{
		
			server.send(pile);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(pile);
		}
		depile();
	});
	
};

var writeFile = function(pile){

	fs.writeFile(pile.nom, pile.arg, "UTF-8",function (e){
		if (e) {
			pile.e = e;
		}
		// tmp.callback = pile.callback;
		if(pile.pr == "server")
		{
			server.send(pile);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(pile);
		}
		depile();
	});
	
	
};

//fonction de chargement d'une base de donnée
var readbase = function(pile){
	// util.log(pile.type);
	var i = 0;
	var stmt = pile.type;
	var base = [];
	var db = new sqlite3.Database(pile.nom);
	var tmp = {};
    db.each(stmt, function (e, r) {
		if(e){
			util.log("ERROR Base de donnees : " + e);
			depile();
		} else {
			base[i] = r;
			i++;
		}
    },function(){
		tmp.callback = pile.callback;
		tmp.output = base;
		//util.log(util.inspect(tmp));
		
		if(pile.pr == "server")
		{
			server.send(tmp);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(tmp);
		}
		depile();
	});	
	//db.close();
};
//fonction de chargement d'une base de donnée
var readbaseget = function(pile){//TO DO
	var i = 0;
	var stmt = pile.type;
	var base = [];
	var db = new sqlite3.Database(pile.nom);
	var tmp = {};
	db.get(stmt, function (e, r) {
		if(e) {
			// console.log("ERROR");
			pile.e = e;
			// depile();
		}
		if(r){
			base = r;
			pile.output = r;
		}else{
			pile.output = 0;
		}
		// tmp.callback = pile.callback;
		// tmp.output = base;
		
		console.log("readwrite ---------- " + util.inspect(pile));
		
		if(pile.pr == "server")
		{
			server.send(pile);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(pile);
		}
		depile();
	});		
};
var writedb5 = function(pile){
	var tmp = {};
	var db = new sqlite3.Database(pile.nom);
	db.serialize( function (e) {
		util.log(e);
		var stmt = db.prepare(pile.type);
		stmt.run(pile.arg1, pile.arg2, pile.arg3, pile.arg4, pile.arg5);
		stmt.finalize();
	});
	tmp.callback = pile.callback;
	if(pile.pr == "server")
	{
		server.send(tmp);
	}else if(pile.pr == "recuperation_articles")
	{
		recuperation_articles.send(tmp);
	}
	depile();
};

var writedb4 = function(pile){
	
	var tmp = {};
	var db = new sqlite3.Database(pile.nom);
	db.serialize( function () {
		var stmt = db.prepare(pile.type,function(e){if(e){
			util.log("==============>"+pile.type+"  "+pile.arg2+"  "+pile.arg3+"  "+pile.arg4);
			util.log("prepare "+e);
			//depile();
			}
		});
		stmt.run(pile.arg1, pile.arg2, pile.arg3, pile.arg4,function(e){if(e){
			util.log("==============>"+pile.type+"  "+pile.arg2+"  "+pile.arg3+"  "+pile.arg4);
			util.log("run "+e);
			//depile();
			}});
		stmt.finalize(function(e){if(e){
			util.log("==============>"+pile.type+"  "+pile.arg2+"  "+pile.arg3+"  "+pile.arg4);
			util.log("finalize "+e);
			//depile();
			}});
		tmp.callback = pile.callback;
		if(pile.pr == "server")
		{
			server.send(tmp);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(tmp);
		}
		depile();
	});
	//util.log("depile");
	// db.close();
	
};

var writedb1 = function(pile){
	tmp = {};
	
	var db = new sqlite3.Database(pile.nom);
	db.serialize( function () {
		var stmt = db.prepare(pile.type);
		stmt.run();
		stmt.finalize();
	});
	tmp.callback = pile.callback;
	if(pile.pr == "server")
	{
		server.send(tmp);
	}else if(pile.pr == "recuperation_articles")
	{
		recuperation_articles.send(tmp);
	}
	depile();
};

var exist = function(pile){
	var tmp ={};
	// console.log(pile.callback);
	 fs.exists(pile.nom, function (exist) {
        if (exist) {
			pile.e = 1;
		}else{
			pile.e = 0;
		}
		if(pile.pr == "server")
		{
			server.send(pile);
		}else if(pile.pr == "recuperation_articles")
		{
			recuperation_articles.send(pile);
		}
		depile();
	});

};


var insert = function(pile){
	tmp = {};
	
	var db = new sqlite3.Database(pile.nom);
	db.insert(pile.arg);
	tmp.callback = pile.callback;
	if(pile.pr == "server")
	{
		server.send(tmp);
	}else if(pile.pr == "recuperation_articles")
	{
		recuperation_articles.send(tmp);
	}
	depile();

};