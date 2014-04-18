var util = require("util");
var http = require('http');
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");

var server = {};
server.dicoapp = {};
server.base = [];
server.f = 0;
server.fe = 0;
server.articles = [];
server.base = [];
output = "";

server.readarticle = function(titre,entreprise){
	//console.log("Ici --------------------");
	if (titre) {//----------------------------------------------------------------------------
		//util.log(titre.substring(1));
		fs.readFile("../protected/articlesfr/"+titre.substring(1)+".txt","UTF-8", function(e,d){
			if(e) {
				//util.log("=( :"+e);
				server.fe --;
				//util.log("erreur charge: " + server.fe+titre);
			} else {
				//server.fe --;
				var article = JSON.parse(d);		
				//util.log("fin article charge: " + server.fe+titre);
				//article.note = 0;
				
				ev.emit("ecris",article,entreprise);
				//util.log("8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888"+server.fe);
			}
		});
	}else{
		server.fe --;
	}
};


server.readbase = function(rc,entreprise){
	//console.log("-------->>>>>>>---------------");
	server.f ++;
	var i = 0;
	if(rc == "all"){
		var stmt = "SELECT * FROM basearticle";
	}
	else{
		var stmt = "SELECT entreprise FROM basearticle WHERE entreprise = \'" + rc  + "\'";
	}
    db.each(stmt, function (e, r) {
		if(e){
			util.log(e);
		}
		else{
			//util.log("        " + server.fe);
			server.fe ++;
			//util.log("debut article charger: "+ server.fe+r.titre);
			ev.emit("charge",r.titre,entreprise);
			server.base[i] = r;
			i++;
			
			ev.emit("ok");
		}
    });
	//util.log("ok3");
};

server.mef = function(article,entreprise){
	server.articles[server.articles.length] = article;
	
	if(!--server.fe){
		util.log("ok");
		var color = "";
		var image = "";
		
		for(i in server.articles){
			if (server.articles[i].note >= 1) {
				color = " success";
			} else if (server.articles[i].note <= (-1)) {
				color = " danger";
			} else {
				color = "";
			}
			
			if (server.articles[i].image) {
				image = server.articles[i].image.url;
			} else if (!(server.articles[i].image)) {
				image = "../images/NotFound.jpg";
			}
			
			output += '<tr class="accordion-toggle '+color+'" data-toggle="collapse" data-target="#collapse'+i+'">'+
					  ' <td style="width:80px"><img src="'+image+'" width=50 height=50></td>'+
					  ' <td><span class="text-left"><style type="text/css">a:link{text-decoration:none}</style><small><font color="blue">'+server.articles[i].titre+'</small></font></span></td>'+
					  '</tr>'+
					  '<td colspan="6" class="hiddenRow  active">'+
					  ' <div class="accordian-body collapse container-fluid" id="collapse'+i+'">'+
					  '  <small>'+server.articles[i].description+'<a href="'+server.articles[i].lien+'" target="_blank"> Lire l\'article</a></small>'+
					  ' </div>'+
					  '</td>';
		}
		server.that[server.fonc](output);
	}
};
server.sortie = function(entreprise){
	util.log("flux deja cree-------------------------------*****************------------");
	server.that[server.fonc](JSON.stringify(output[entreprise]));
};
exports.start = function(that,fonc){
	var entreprise = "all";
	//console.log("--------------------------------->");
	//server.fe = 0;
	server.fonc = fonc;
	server.that = that;
	//ev.on("ok",server.readarticle);
	ev.on("ecris",server.mef);
	//ev.on("vay",server.sortie);
	ev.on("charge",server.readarticle);
	util.log("ok");
	//server.readbase("all");
	if(output[entreprise])
	{
		server.sortie(entreprise);
	}
	else{
		server.readbase(entreprise);
	}
	util.log("ok");
};

