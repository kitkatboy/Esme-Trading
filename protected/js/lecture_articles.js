var util = require("util");
var readwrite = require("./readwrite.js");

var server = {};
server.base = [];
server.fe = 0;
server.articles = [];

var readbase = function(input){
	for(i in input)
	{
		server.fe++;
		readwrite.readfile("../protected/articlesfr/"+input[i].entreprise.substring(0, input[i].entreprise.length - 1)+" - "+input[i].titre.substring(1)+".txt",envoi);
	}
};
var envoi = function(article){
	server.articles[server.articles.length] = article;
	if(!--server.fe){
		server.that[server.fonc](server.articles);
		server.articles.length = 0;
		server.base.length = 0;
	}
}
exports.start = function(that, fonc){
	server.fonc = fonc;
	server.that = that;
	
	readwrite.bd("SELECT * FROM basearticle ORDER BY date DESC","../protected/basearticle.db",readbase);
};