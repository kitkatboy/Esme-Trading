var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");

var server = {};
server.base = [];
server.fe = 0;
server.charge = 0;
server.api = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fwww.investir.fr%2FRSS%2Fcac40.xml'&format=json&diagnostics=true";//&callback=cbfunc";

server.dicoapp = {};

//fonction de chargement du dico
server.readdico = function(){
	server.charge++;
	fs.readFile("../protected/dico2.txt","UTF-8", function(e,d){
		if(e) {
			util.log("ERROR Dictionnaire 1 : " + e);
		} else if (d) {
			server.dico = JSON.parse(d); // Chargement du dictionnaire de mots dans une variable
			
			util.log("Dictionnaire 1 charge");
			server.charge--;
			ev.emit("ok");
			//util.log(util.inspect(server.dico));
		}
		/*
		var i=0;
		for(i in server.dico){
			i++;
		}
		*/
	});
	
};

server.readdico2 = function(){
	server.charge++;
	fs.readFile("../protected/dicomulti.txt","UTF-8", function(e,d){
		if(e) {
			util.log("ERROR Dictionnaire 2 : " + e);
		} else if (d) {
			server.dico2 = JSON.parse(d); // Chargement des adjectifs dans une variable
			
			util.log("Dictionnaire 2 charge");
			server.charge--;
			ev.emit("ok");
			//util.log(util.inspect(server.dico2));
		}
	});
};

//fonction de chargement de la base de donnée des articles
server.readbase = function(){
	server.charge++;
	var i = 0;
	var stmt = "SELECT * FROM basearticle";
    db.each(stmt, function (e, r) {
		if(e){
			util.log("ERROR Base de donnees : " + e);
		} else if (r) {
			server.base[i] = r;
			i++;
		}
    });
	util.log("Base de donnees charge");
	server.charge--;
	ev.emit("ok");	
};

//Fonction de récupération des articles a partir du lien YQL
server.get = function() {
	if(server.charge == 0){
		var b = "";
		util.log("recuperation des articles depuis le lien YQL");
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
	util.log("mise en forme des articles recuperes");
	//util.log(ev._events["test"]);
	for (i in flux.query.results.item) {
		var tmp = {}; 
		tmp.titre = flux.query.results.item[i].title;
		tmp.date = new Date(flux.query.results.item[i].pubDate);
		tmp.description = flux.query.results.item[i].description;
		tmp.image = flux.query.results.item[i].enclosure;
		tmp.lien = flux.query.results.item[i].link;
		tmp.note=0;
		articles[i] = tmp;
		
		//util.log("Article recupere : " + tmp.titre);
		if(tmp.description && tmp.titre){
			//util.log("Fin de la mise en forme");
			ev.emit("test",articles[i]);
		}
    }
};

//Fonction de test des nouveaux articles
server.test1 = function(article){

	var titre;
	var f = "ecris";
	titre = article.titre.split(":");
	article.societe = titre[0];//TO DO
	article.titre = titre[1];
	
	util.log("Comparaison avec la base de donnees : " + article.titre);
	
	if (article.titre) {
		do {
			article.titre = article.titre.replace('?', '.');
		}while((article.titre).indexOf("?") >= 0);
		
		for(b in server.base) {
			if(article.titre == server.base[b].titre){
				f = "";
				util.log("Article deja enregistre : " + article.titre);
				ev.emit("cassetout");
				break;	
			} else {
				util.log("Nouvel article : " + article.titre);
			}
		}
		ev.emit(f,article);
	} else {
		util.log("ERROR - Le titre de l'article n'est pas defini");
	}
};

//Fonction de mise a jour de la base de donnée
server.nouvdatabase = function(article){
	util.log("Enregistrement de l'article dans la database : " + article.titre);

	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO basearticle VALUES (?,?,?,?)");
		stmt.run(article.societe, article.titre,article.date, article.note);
		stmt.finalize();
	});
	
	server.write(article);
};

//Fonction d'écriture des articles dans le fichier articlesFr
server.write = function(article){
	util.log("Ecriture de l'article dans un fichier texte");
	
	fs.writeFile("../protected/articlesfr\\"+article.societe+"-"+article.titre+".txt", JSON.stringify(article), "UTF-8",function (e){
		if (e) {
			util.log("ERROR - " + e);
			util.log("---------------- " + article.societe + "-" + article.titre);
		}
	});
};

bob = function(){
	util.log("Annulation de l'enregistrement des articles");
	ev.removeAllListeners();
	//server.test1 = function(){};
};

//initialisation du dico
server.addnote = function(){
	var b = {'grimpe' : 1, 'décroit' : -1,'baisses' : -1,'bonne':1,'revenu':1,'déficit':-1,'bénéfices':1,'perd':-1,'valorisant':1,'recul':-1,'hausse':1,'progressent':1,'progresse':1,'améliore':1,'amélioration':1,'satisfaisants':1,'plus-value':1,'dévisse':-1,'inquiètent':-1,'dépréciation':-1,'prime':1,'plainte':-1,'antidumping':-1,'défaveur':-1,'prudentes':1,'prudente':1,'bon':1,'gagné':1,'renforcé':1,'contre-offensive':1,'séduire':1};
	fs.writeFile("../protected/dico2.txt", JSON.stringify(b), "UTF-8",function (r){});
	var a = {'très' : 2,'fort':2,'forte':2};
	fs.writeFile("../protected/dicomulti.txt", JSON.stringify(a), "UTF-8",function (r){});
	
};

exports.create = function () {
	util.log("Creation de la base de donnees des articles");
	db.run("CREATE TABLE basearticle (entreprise TEXT, titre TEXT,date TEXT, note TEXT)");
    db.close();
};

//-------------------------------------apprentissage-------------------------------
server.app = function(note, nouvmots){
	//util.log(util.inspect(nouvmots));
	 for(i in nouvmots){
		//nouvmots[i] = {};
		
		if(!server.dicoapp[nouvmots[i]]){
			server.dicoapp[nouvmots[i]]={};
			server.dicoapp[nouvmots[i]].note = note;
			server.dicoapp[nouvmots[i]].nb = 1;
			//util.log(nouvmots[i] +" : "+ util.inspect(server.dicoapp[nouvmots[i]]));
		}
		else{
			server.dicoapp[nouvmots[i]].note += note;
			server.dicoapp[nouvmots[i]].nb++;
		}
	}
	//server.writeapp();
	ev.emit("ecritlapp");
};

server.writeapp = function(){
//util.log("server.fe : "+server.fe);
	if(/*!--server.fe*/server.fe == 40)
	{
		util.log("écriture d'appretissage");
		fs.writeFile("../protected/dicoapp.txt", JSON.stringify(server.dicoapp), "UTF-8",function (r){});
	}
};

server.readdicoapp = function(){
	server.charge++;
	fs.readFile("../protected/dicoapp.txt","UTF-8", function(e,d){
		if(e) {
			util.log("=(");
		} else {
			server.dicoapp = JSON.parse(d);
			
			util.log("dicoapp charge");
			ev.emit("travailapp");
			//util.log(util.inspect(server.dicoapp));
		}
	});
};

server.prepareapp = function(){
	 for(i in server.dicoapp){
		server.dicoapp[i].coef = server.dicoapp[i].note/(server.dicoapp[i].nb*10);
	}
	//util.log(util.inspect(server.dicoapp));
	server.charge--;
	ev.emit("ok");
};


server.note23 = function(article){
	var f= server.fe;
	server.fe++;
	var tmp = article.description;
	reg = new RegExp("[!:;.,?]","g");
	tmp = tmp.replace(reg,"");
	
	tmp = tmp.replace("\'"," ");
	//util.log(tmp);
	//util.puts(tmp);
	var desc = tmp.split(" ");
	var cpt = 0;
	var tmp2 = [];
	for(i in desc){
		if(server.dico[desc[i]]){
			if(server.dico2[desc[i-1]]){ //analyse sémantique
				article.note += server.dico[desc[i]] * server.dico2[desc[i-1]];
				//util.log("multipli : " + desc[i-1] +" = "+server.dico2[desc[i-1]]+ " x " + desc[i]+" = "+server.dico[desc[i]]);
				//util.log(article.note);
			} else{
				article.note += server.dico[desc[i]];
				//util.log("add : " + desc[i]);
			}
		}
		else if((desc[i].length>3)&&(!server.dico2[desc[i]])){
			if(server.dicoapp[desc[i]]){
				if(server.dicoapp[desc[i]].nb > 10){
					article.note += server.dicoapp[desc[i]].coef;
				}
			}
			tmp2[cpt] = desc[i];
			cpt++;
		}
		/*else if((desc[i].length>3)&&(!server.dico2[desc[i]])){
			tmp2[cpt] = desc[i];
			cpt++;
			
		}*/
	}//util.log("tmp = " +util.inspect(tmp2));
	//util.log("note : "+article.note);
	ev.emit("apprend",article.note,tmp2);
	ev.emit("miseajourdatabase",article);
	//ev.emit("miseajourdatabase",article);
	//server.write(article);
};

//----------------------------------fin apprentissage--------------------------------
exports.read = function () {
    var stmt = "SELECT * FROM basearticle ";//WHERE entreprise = 'BOUYGUES '";
	var tmp = [];
	var i = 0;
    db.each(stmt, function (e, r) {
		if(e){
			util.log(e);
		} else if (r) {
			//tmp[i] =  r;
			//i++;
			util.log(util.inspect(r));
		}
    });
    //db.close();
};
//fonction d'initialisation des lisner
server.initlisner = function(){
	//server.f = 0;
	ev.once("read",server.readdico);
	ev.once("read",server.readdico2);
	ev.once("read",server.readbase);
	//ev.once("read",server.get);
	ev.on("ok",server.get);
	//ev.on("ok",server.testemit);
	ev.on("test",server.test1);
	//ev.on("ecris",server.note22);
	ev.on("miseajourdatabase",server.nouvdatabase);
	ev.on("cassetout",bob);
	
	ev.once("read",server.readdicoapp);
	ev.on("apprend",server.app);
	ev.on("ecris",server.note23);
	ev.on("travailapp",server.prepareapp);
	ev.on("ecritlapp",server.writeapp);
	//ev.on("ecris",server.note2);
	util.log("Les listener sont initialises");
	
};
exports.start = function () {
	server.initlisner(); // Initialisation de tous les listener
	ev.emit("read"); // Lancement du processus
};

//exports.create();
//server.addnote();
//exports.read();