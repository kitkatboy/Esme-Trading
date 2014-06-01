var util = require("util");
var readwrite = require("./readwrite.js");

var server = {};
server.base = [];
server.fe = 0;
server.articles = [];

var readbase = function(e,input){
	for(i in input)
	{
		server.fe++;
		readwrite.readFile("../protected/articlesfr/"+input[i].entreprise.substring(0, input[i].entreprise.length - 1)+" - "+input[i].titre.substring(1)+".txt",'utf-8',envoi);
	}
};
var envoi = function(e,article){
	server.articles[server.articles.length] = JSON.parse(article);
	if(!--server.fe){
		server.that[server.fonc](server.articles);
		server.articles.length = 0;
		server.base.length = 0;
	}
}
exports.start = function(that, fonc){
	server.fonc = fonc;
	server.that = that;
	
	readwrite.each("../protected/basearticle.db","SELECT * FROM basearticle ORDER BY date DESC",readbase);
};