var util = require("util");
var fs = require("fs");
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");

var server = {};
server.base = [];
server.fe = 0;
server.articles = [];
//server.output = "";

server.readbase = function(/*entreprise*/) {
	var i = 0;
	//if(entreprise == "all"){
		var stmt = "SELECT * FROM basearticle ORDER BY date";
	/*} else {
		var stmt = "SELECT * FROM basearticle WHERE entreprise = '" + entreprise + " '";
	}*/
	
	/*db.serialize(function () {
		db.get(stmt, function (e, r) {
			if (e) {
				util.log(e);
			} else if (r) {*/
				db.each(stmt, function (e, r) {
					if (e) {
						util.log(e);
					} else if (r) {
						server.fe ++;
						ev.emit("charge", r.entreprise, r.titre);
						server.base[i] = r;
						i++;
					}
				});/*
				setTimeout(function () {
					//console.log("----------------------------- lalala");
					server.readarticle();
				}, 2)*/
				
				
			/*} else {
				server.that[server.fonc]("no result");
				ev._events = {};
			}
		});
	});*/
};

server.readarticle = function(entreprise, titre) {
	//if (server.base.length != 0) {
		//for (var i = 0; i < server.base.length; i++) {
			//console.log("------" + server.base[i].entreprise + " ----- " + server.base[i].titre);
			if (entreprise && titre) {
				fs.readFile("../protected/articlesfr/"+entreprise.substring(0, entreprise.length - 1)+" - "+titre.substring(1)+".txt","UTF-8", function (e,d){
					if (e) {
						server.fe --;
						util.log(e);
					} else {
						var article = JSON.parse(d);
						ev.emit("ecris", article);
					}
				});
			} else {
				server.fe --;
				util.log("INFO : Nom de l'entreprise ou titre de l'article manquant");
			}
		//}
	/*} else {
		util.log("INFO : Les articles n'ont pas pu etre charges");
	}*/
};

server.envoi = function(article){
	//var color;
	//var image;
	server.articles[server.articles.length] = article;
	if(!--server.fe){
		/*for(i in server.articles){
			if (server.articles[i].note >= 1) {
				color = " success";
			} else if (server.articles[i].note <= (-1)) {
				color = " danger";
			} else {
				color = " active";
			}
			
			if (server.articles[i].image) {
				image = server.articles[i].image.url;
			} else if (!(server.articles[i].image)) {
				image = "../images/NotFound.jpg";
			}
			
			server.output += '<tr class="accordion-toggle '+color+'" data-toggle="collapse" data-target="#collapse'+i+'">'+
							 ' <td style="width:80px"><img src="'+image+'" width=50 height=50></td>'+
							 ' <td><span class="text-left"><small><font color="MediumBlue">'+server.articles[i].titre+'</small></font></span></td>'+
							 '</tr>'+
							 '<td colspan="6" class="hiddenRow" style="text-align:justify;" onmouseover="this.style.cursor=\'default\'">'+
							 ' <div class="accordian-body collapse container-fluid" id="collapse'+i+'">'+
							 '  <small><font color="#AAA">'+(server.articles[i].date).substring(0,10)+
							 '</font><br/>'+server.articles[i].description+'<br/>'+
							 '<a href="'+server.articles[i].lien+'" target="_blank" onmouseover="this.style.cursor=\'pointer\'"><font color="Orchid">Lire l\'article</font></a></small>'+
							 ' </div>'+
							 '</td>';
		}*/
		server.that[server.fonc](server.articles);
		ev._events = {};
		server.articles.length = 0;
		server.base.length = 0;
		//server.output = "";
	}
};

exports.start = function(that, fonc/*, search*/){
	server.fonc = fonc;
	server.that = that;
	//var entreprise;
	/*
	if (search == "") {
		entreprise = "all";
	} else {
		search = search.toUpperCase();
		entreprise = search.replace(" SA","");
	}
	*/
	ev.on("ecris",server.envoi);
	ev.on("charge",server.readarticle);
	
	server.readbase(/*entreprise*/);
};

