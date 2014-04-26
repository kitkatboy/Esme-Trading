var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");

var server = {};
server.base = [];
server.f = 0;
server.fe = 0;
server.api = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fwww.investir.fr%2FRSS%2Fcac40.xml'&format=json&diagnostics=true";//&callback=cbfunc";


//fonction de chargement du dico
server.readdico = function(){
server.f++;
fs.readFile("../protected/dico2.txt","UTF-8", function(e,d){
		if(e) {
			util.log("=(" + e);
		} else {
			server.dico = JSON.parse(d);
			
			util.log("dico charge");
			ev.emit("ok");
			util.log(util.inspect(server.dico));
		}
		var i=0;
for(a in server.dico){
	i++;
}
console.log(i);
	});
	
};
server.readdico2 = function(){
server.f++;
fs.readFile("../protected/dicomulti.txt","UTF-8", function(e,d){
		if(e) {
			util.log("=(");
		} else {
			server.dico2 = JSON.parse(d);
			
			util.log("dico charge");
			ev.emit("ok");
			util.log(util.inspect(server.dico2));
		}
		var i=0;
for(a in server.dico2){
	i++;
}
console.log(i);
	});
};

//fonction de chargement de la base de donnée des articles
server.readbase = function(){
	server.f ++;
	var i = 0;
	var stmt = "SELECT * FROM basearticle";
    db.each(stmt, function (e, r) {
		if(e){
			util.log(e);
		}
        server.base[i] = r;
		i++;
		util.log(i);
		
    });
	ev.emit("ok");	
};

//Fonction de récupération des articles a partir du lien YQL
server.get = function() {
console.log("ok");
	if(!--server.f){
			util.log("ok!");
		server.f ++;
		var b = "";
		util.log("récupération d'articles");
		http.get(server.api, function (r) {
			r.on("data", function (d) {
				b += d;
			});
			r.on("end", function() {
				b = JSON.parse(b);
				if(b.query.results) {
					server.mef(b);
				}
			});
		});
	}
};

//Fonction de mise en forme des articles
server.mef = function(flux){
	var articles = [];
	util.log("mise en forme d'articles");
	for (i in flux.query.results.item) {
		var tmp = {}; 
		tmp.titre = flux.query.results.item[i].title;
		tmp.date = new Date(flux.query.results.item[i].pubDate);
		tmp.description = flux.query.results.item[i].description;
		tmp.image = flux.query.results.item[i].enclosure;
		tmp.lien = flux.query.results.item[i].link;
		tmp.note=0;
		articles[i] = tmp;
		if(tmp.description){
			ev.emit("test",articles[i]);
		}
    }
};

//Fonction de test des nouveaux articles
server.test1 = function(article){
	var titre;
	var f = "ecris";
	util.log("comparaison");
	titre = article.titre.split(":");
	article.societe = titre[0];//TO DO
	article.titre = titre[1];
	
	for(b in server.base) {
		if(titre[1] == server.base[b].titre){
			f = "";
			util.log("non");
			ev.emit("cassetout");
			break;	
		}
	}
	ev.emit(f,article);
};

//Fonction de notation des articles
server.note2 = function(article){
	var f= server.fe;
	server.fe++;
	var tmp = article.description;
	reg = new RegExp("[!:;.,?]","g");
	tmp = tmp.replace(reg,"");
	tmp = tmp.replace("\'"," ");
	util.puts(tmp);
	var desc = tmp.split(" ");
	for(i in desc){
		if(server.dico[desc[i]]){
			article.note += server.dico[desc[i]];
		}
	}
	ev.emit("miseajourdatabase",article);
	server.write(article);
};

server.note22 = function(article){
	var f= server.fe;
	server.fe++;
	var tmp = article.description;
	reg = new RegExp("[!:;.,?]","g");
	tmp = tmp.replace(reg,"");
	tmp = tmp.replace("\'"," ");
	util.puts(tmp);
	var desc = tmp.split(" ");
	for(i in desc){
		if(server.dico[desc[i]]){
			if(server.dico2[desc[i-1]]){
				article.note += server.dico[desc[i]] * server.dico2[desc[i-1]];
			}
			else{
				article.note += server.dico[desc[i]];
			}
		}
	}
	ev.emit("miseajourdatabase",article);
	server.write(article);
};

//Fonction de mise a jour de la base de donnée
server.nouvdatabase = function(article,f){
	util.log("mise a jour database");
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO basearticle VALUES (?,?,?,?)");
		stmt.run(article.societe, article.titre,article.date, article.note);
		stmt.finalize();
	});
};

//Fonction d'écriture des articles dans le fichier articlesFr
server.write = function(article){
	util.log("------------------------------------------------ écriture d'articles");
	
	fs.writeFile("../protected/articlesfr\\"+article.titre+".txt", JSON.stringify(article), "UTF-8",function (r){});
};

bob = function(){
	console.log("bob");
	ev.removeAllListeners();
	server.test1 = function(){console.log("plus rien");};
};

//fonction d'initialisation des lisner
server.initlisner = function(){
	server.f = 0;
	ev.once("read",server.readdico);
	ev.once("read",server.readdico2);
	ev.once("read",server.readbase);
	//ev.once("read",server.get);
	ev.on("ok",server.get);
	//ev.on("ok",server.testemit);
	ev.on("ecris",server.note22);
	ev.on("miseajourdatabase",server.nouvdatabase);
	ev.on("test",server.test1);
	ev.on("cassetout",bob);
	//ev.on("ecris",server.note2);
	console.log("You");
};

//initialisation du dico
server.addnote = function(){
	var b = {'grimpe' : 1, 'décroit' : -1,'baisses' : -1,'bonne':1,'revenu':1,'déficit':-1,'bénéfices':1,'perd':-1,'valorisant':1,'recul':-1,'hausse':1,'progressent':1,'progresse':1,'améliore':1,'amélioration':1,'satisfaisants':1,'plus-value':1,'dévisse':-1,'inquiètent':-1,'dépréciation':-1,'prime':1,'plainte':-1,'antidumping':-1,'défaveur':-1,'prudentes':1,'prudente':1,'bon':1,'gagné':1,'renforcé':1,'contre-offensive':1,'séduire':1};
	fs.writeFile("../protected/dico2.txt", JSON.stringify(b), "UTF-8",function (r){});
	var a = {'très' : 2,'fort':2,'forte':2};
	fs.writeFile("../protected/dicomulti.txt", JSON.stringify(a), "UTF-8",function (r){});
	
};
create = function () {
	db.run("CREATE TABLE basearticle (entreprise TEXT, titre TEXT,date TEXT, note TEXT)");
    db.close();
};
read = function () {
    var stmt = "SELECT * FROM basearticle ";//WHERE entreprise = 'BOUYGUES '";
	var tmp = [];
	var i = 0;
    db.each(stmt, function (e, r) {
		if(e){
			util.log(e);
		}
			tmp[i] =  r;
			i++;
			console.log(/*r.titre +":" +*/r.note);
    });
    //db.close();
};

exports.start = function () {
	console.log("Yeh");
	server.initlisner();
	console.log("Yop");
	ev.emit("read");
};

//create();
//server.addnote();
//read();