var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../basearticle.db");

var server = {};
server.dicoapp = {};
server.base = [];
server.f = 0;
server.fe = 0;


server.note22 = function(article){
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
				util.log(article.note);
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
	util.log("note : "+article.note);
	ev.emit("apprend",article.note,tmp2);
	//ev.emit("miseajourdatabase",article);
	//server.write(article);
};

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
		fs.writeFile("../dicoapp.txt", JSON.stringify(server.dicoapp), "UTF-8",function (r){});
	}
};
server.readdicoapp = function(){
	server.f++;
	fs.readFile("../dicoapp.txt","UTF-8", function(e,d){
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
	util.log(util.inspect(server.dicoapp));
	ev.emit("ok");
};
 
 
 server.readarticle = function(){
	if(!--server.f)
	{
		/*fs.readFile("articlesfr\\test.txt","UTF-8", function(e,d){
			if(e) {
				util.log("=( :"+e);
			} else {
				var article = JSON.parse(d);
				
				util.log("article charge");
				article.note = 0;
				//ev.emit("ecris",article);
				util.log(util.inspect(article));
				server.readarticle2(article.titre);
			}
		});*/
		server.readarticleall();
	}
	
};
server.readarticle2 = function(text){

		fs.readFile("../articlesfr\\"+text+".txt","UTF-8", function(e,d){
			if(e) {
				util.log("=( :"+e);
			} else {
				var article = JSON.parse(d);
				
				util.log("article charge");
				//article.note = 0;
				//ev.emit("ecris",article);
				util.log(util.inspect(article));
			}
		});
};
server.readarticleall = function(){
	for(i in server.base)
	{
		server.fe++;
		fs.readFile("../articlesfr\\"+server.base[i].titre+".txt","UTF-8", function(e,d){
			if(e) {
				util.log("=( :"+e);
			} else {
				var article = JSON.parse(d);
				
				//util.log("article charge");
				article.note = 0;
				ev.emit("ecris",article);
				//util.log(util.inspect(article));
			}
		});
	}
};
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
 
 
 
//fonction de chargement du dico
server.readdico = function(){
server.f++;
fs.readFile("../dico2.txt","UTF-8", function(e,d){
		if(e) {
			util.log("=(");
		} else {
			server.dico = JSON.parse(d);
			
			util.log("dico charge");
			ev.emit("ok");
			//util.log(util.inspect(server.dico));
		}
	});
	
};
server.readdico2 = function(){
server.f++;
fs.readFile("../dicomulti.txt","UTF-8", function(e,d){
		if(e) {
			util.log("=(");
		} else {
			server.dico2 = JSON.parse(d);
			
			util.log("dico charge");
			ev.emit("ok");
			//util.log(util.inspect(server.dico2));
		}
	});
	
};
//fonction d'initialisation des lisner
server.initlisner = function(){
	server.f = 0;
	ev.once("read",server.readdico);
	ev.once("read",server.readdico2);
	ev.once("read",server.readdicoapp);
	ev.once("read",server.readbase);
	ev.on("apprend",server.app);
	ev.on("travailapp",server.prepareapp);
	//ev.once("read",server.get);
	//ev.on("ok",server.get);
	ev.on("ok",server.readarticle);
	//ev.on("ok",server.testemit);
	ev.on("ecris",server.note22);
	//ev.on("miseajourdatabase",server.nouvdatabase);
	//ev.on("test",server.test1);
	//ev.on("ecris",server.note2);
	ev.on("ecritlapp",server.writeapp);
};

server.initlisner();
ev.emit("read");