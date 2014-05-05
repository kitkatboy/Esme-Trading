var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();

var pile = [];

exports.get = function(erw,etype,enom,ecallback){
	pile[pile.length] = {};
	
	pile[pile.length-1].rw = erw;
	pile[pile.length-1].nom = enom;
	pile[pile.length-1].type = etype;
	pile[pile.length-1].callback = ecallback;
	
	if(pile.length == 1)
	{
		gestion();
	}
};
//Fonction de gestion de la pile
var gestion = function(){
	if(pile[0].rw == "read" && pile[0].type == "")
	{
		read(pile[0].nom,pile[0].callback);
	}
	else if(pile[0].rw == "read")
	{
		readbase(pile[0].nom,pile[0].type,pile[0].callback);
	}
};
//Fonction de depillement
var depile = function(){
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
var read = function(nom,callback){
	var output;
	fs.readFile(nom,"UTF-8", function(e,d){
		if(e) {
			util.log("ERROR "+nom+" : " + e);
		} else if (d) {
			output = JSON.parse(d); // Chargement du dictionnaire de mots dans une variable
			util.log(nom+" charge");
			depile();
			callback(output);
		}
	});
	
};
//fonction de chargement d'une base de donnée
var readbase = function(nom,type,callback){
	var i = 0;
	var stmt = type;
	var base = [];
	var db = new sqlite3.Database(nom);
    db.each(stmt, function (e, r) {
		if(e){
			util.log("ERROR Base de donnees : " + e);
		} else if (r) {
			base[i] = r;
			i++;
		}
    },function(){
		util.log(nom + " charge");
		callback(base);
		depile();
	});		
};