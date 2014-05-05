var util = require("util");
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");
var readwrite = require("./readwrite.js");

var server = {};
server.base = [];
server.fe = 0;
server.articles = [];

var readbase = function(input){
	for(i in input)
	{
		server.fe++;
		readwrite.get("read","","../protected/articlesfr/"+input[i].entreprise.substring(0, input[i].entreprise.length - 1)+" - "+input[i].titre.substring(1)+".txt",envoi);
	}
};
var envoi = function(article){
	server.articles[server.articles.length] = article;
	if(!--server.fe){
		server.that[server.fonc](server.articles);
		ev._events = {};
		server.articles.length = 0;
		server.base.length = 0;
	}
}
exports.start = function(that, fonc){
	server.fonc = fonc;
	server.that = that;
	
	readwrite.get("read","SELECT * FROM basearticle","../protected/basearticle.db",readbase);
};