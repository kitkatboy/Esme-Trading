var util = require('util');
var http = require('http');
var fs = require('fs');
var events = require("events");
var ev = new events.EventEmitter();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/basearticle.db");
//var server = {};
var s = {};
var sem = 0;
var server = {};
var outputar = 0;
var cptx = 0;
var tmp = [];
var flou = [];
var ent = "";
var boite = "";
var that;
var fonc;
// fonction d'appartenance de type GAUSSIENNE v1 = varrience , m1 = moyenne/////////////////////////////////////////////
/*
var gauss  = function(v1, m1, x){

if (v1 <= 0 ) {
    throw new Error('la VARIANCE doit etre positive');
  }
var y = 0;  
y = Math.exp(- 1/2 *(Math.pow(x - m1, 2) / (Math.pow(v1, 2))));
return y;
};
*/
//console.log(gauss(5, 0, 4));
//POIDS JOUR
server.borneSupJour = 1;
server.borneInfJour = -1;
//POIDS SEMAINE
server.borneSupSemaine = 5;
server.borneInfSemaine = -5;
//VARRIANCE JOUR
server.borneSuppJour = 10;
server.borneInffJour = 5;
//VARRIANCE SEMAINE
server.borneSuppSemaine = 140;
server.borneInffSemaine = 80;
var logiqueFloue = function(nom,tps){

	fs.readFile('../protected/entreprises_cac40.json', 'utf-8', 'r+', function (err, data) {
		if (err) throw err;
		data = JSON.parse(data);
		var i=0;
		for(i==0; i< data.nom.length; i++)
		{	
			if(data.nom[i].name==nom){
				nom = data.nom[i].nom;
			}
		}
		var prevision={};
		prevision.nom_entreprise=nom;
		fs.exists('../protected/cac_40.json', function(exist){														
			if(exist)
			{	
				fs.exists('../protected/tmpFichier', function(ex){														
					if(ex)						
					{
						fs.readFile('../protected/cac_40.json', 'utf-8', 'r+', function (err, data) { // LE FICHIER PEUT EXISTER ET ETRE VIDE ! 
						if(err) throw err;
						data = JSON.parse(data);
			
							for(i in data.entreprise)
							{
								if(data.entreprise[i] !=null){
									if(data.entreprise[i].nom_entreprise == nom){
										if(tps=="jour"){	
											var  variance_jour = +(data.entreprise[i].variance_jour);
											//console.log(variance_jour);
											prevision.variance_jour = triAnsemble(server.borneInffJour, server.borneSuppJour, variance_jour);
											var  poids_jour = (data.entreprise[i].poids_jour);
											prevision.poids_jour = triAnsemble(server.borneInfJour, server.borneSupJour, poids_jour);
											//console.log("variance ET poids "+ util.inspect(prevision));
											prevision.temps=tps;
											ev.emit("jour", prevision);
										}
										if(tps=="semaine"){
											var  variance_semaine = +(data.entreprise[i].variance_semaine);
											prevision.variance_semaine = triAnsemble(server.borneInffSemaine, server.borneSuppSemaine, variance_semaine);
											var  poids_semaine = (data.entreprise[i].poids_semaine);
											prevision.poids_semaine = triAnsemble(server.borneInfSemaine, server.borneSupSemaine, poids_semaine);
											//console.log("variance "+ util.inspect(prevision));
											prevision.temps=tps;
											ev.emit("semaine",prevision);
										}
										
									}
								}
							}
						});
					}
				});
			}
		});
	});
};
//logiqueFloue("Crédit Agricole","semaine");
//logiqueFloue("Crédit Agricole","jour");
//logiqueFloue("Accor SA (AC.PA)","semaine");
//logiqueFloue("Accor SA (AC.PA)","jour");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
ev.on("jour", function(prevision){
	
	var output = {};
	var probabilite = {};
	output.nom = prevision.nom_entreprise;
	output.temps = prevision.temps;
	// VARRIENCE PRES MOYEN ET COURS STABLE 
	if(prevision.variance_jour.e3==0 && prevision.poids_jour.e2 >= prevision.poids_jour.e1 && prevision.poids_jour.e2 >= prevision.poids_jour.e3){
		output.prevision = "stable";
		output.probabilite = (prevision.variance_jour.e1 * (-4) + prevision.variance_jour.e2 );
		
	}
	// VARRIENCE PRES MOYEN ET COURS HAUSSE OU BAISSE
	if(prevision.variance_jour.e3==0  && (prevision.poids_jour.e1 >= prevision.poids_jour.e2 || prevision.poids_jour.e3 >= prevision.poids_jour.e2)){
		if((prevision.poids_jour.e1 >= prevision.poids_jour.e2)&& (prevision.poids_jour.e1) != 0){
			output.prevision = "baisse";
		}else if((prevision.poids_jour.e3 >= prevision.poids_jour.e2)&& (prevision.poids_jour.e3) != 0){
			output.prevision = "hausse";
		}
		output.probabilite = (prevision.variance_jour.e1 * (-4) + prevision.variance_jour.e2 );
	}
	// VARRIENCE MOYEN LOING ET COURS STABLE
	if(prevision.variance_jour.e1==0  && prevision.poids_jour.e2 >= prevision.poids_jour.e1 && prevision.poids_jour.e2 >= prevision.poids_jour.e3){
		output.prevision = "stable";
		output.probabilite = (prevision.variance_jour.e3 * 4 + prevision.variance_jour.e2 );
	}
	// VARRIENCE MOYEN LOING ET COURS HAUSSE OU BAISSE
	if(prevision.variance_jour.e1==0  &&( prevision.poids_jour.e1 >= prevision.poids_jour.e2 || prevision.poids_jour.e3 >= prevision.poids_jour.e2)){
		if(prevision.poids_jour.e1 > prevision.poids_jour.e2){
				output.prevision = "baisse";
			}else if(prevision.poids_jour.e3 > prevision.poids_jour.e2){
				output.prevision = "hausse";
			}
		output.probabilite = (prevision.variance_jour.e3 * 4 + prevision.variance_jour.e2 );
	}
	//console.log(output);
	ev.emit("defuzzification",output,"jour");
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
ev.on("semaine", function(prevision){

	var output = {};
	var probabilite = {};
	output.nom = prevision.nom_entreprise;
	output.temps = prevision.temps;
	// VARRIENCE PRES MOYEN ET COURS STABLE 
	if(prevision.variance_semaine.e3==0 && prevision.poids_semaine.e2 >= prevision.poids_semaine.e1 && prevision.poids_semaine.e2 >= prevision.poids_semaine.e3){
		output.prevision = "stable";
		output.probabilite =output.probabilite = (prevision.variance_semaine.e1 * (-4) + prevision.variance_semaine.e2 );
	}
	// VARRIENCE PRES MOYEN ET COURS HAUSSE OU BAISSE
	if(prevision.variance_semaine.e3==0 && (prevision.poids_semaine.e1 >= prevision.poids_semaine.e2 || prevision.poids_semaine.e3 >= prevision.poids_semaine.e2)){
		if(prevision.poids_semaine.e1 >= prevision.poids_semaine.e2 && (prevision.poids_semaine.e1 !=0)){
			output.prevision = "baisse";
		}else if(prevision.poids_semaine.e3 >= prevision.poids_semaine.e2&& (prevision.poids_semaine.e3 !=0)){
			output.prevision = "hausse";
		}
		output.probabilite = (prevision.variance_semaine.e1 * (-4) + prevision.variance_semaine.e2 );
		
	}
	// VARRIENCE MOYEN LOING ET COURS STABLE
	if(prevision.variance_semaine.e1==0 && prevision.poids_semaine.e2 >= prevision.poids_semaine.e1 && prevision.poids_semaine.e2 >= prevision.poids_semaine.e3){
		output.prevision = "stable";
		output.probabilite = (prevision.variance_semaine.e3 * 4 + prevision.variance_semaine.e2 );
	}
	// VARRIENCE MOYEN LOING ET COURS HAUSSE OU BAISSE
	if(prevision.variance_semaine.e1==0 && ( prevision.poids_semaine.e1 >= prevision.poids_semaine.e2 || prevision.poids_semaine.e3 >= prevision.poids_semaine.e2)){
		if(prevision.poids_semaine.e1 >= prevision.poids_semaine.e2 && (prevision.poids_semaine.e1 !=0)){
			output.prevision = "baisse";
		}else if(prevision.poids_semaine.e3 >= prevision.poids_semaine.e2 && (prevision.poids_semaine.e3 !=0)){
			output.prevision = "hausse";
		}
		output.probabilite = (prevision.variance_semaine.e3 * 4 + prevision.variance_semaine.e2 );
	}

	//console.log(output);
	ev.emit("defuzzification",output,"semaine");
});


ev.on("defuzzification", function(output,jour){
	var resultat = {}; 
	resultat.prevision = output.prevision;
	resultat.probabilite = triAnsemble(-4, 4, output.probabilite); // todo -4 a 4

	if(resultat.probabilite.e3==0 && resultat.probabilite.e2==0 &&resultat.probabilite.e1>=resultat.probabilite.e2 ){
		resultat.probabilite = resultat.probabilite.e1 * 1;
	}	
	if(resultat.probabilite.e3==0 && resultat.probabilite.e1>=resultat.probabilite.e2 && resultat.probabilite.e2!=0){
		resultat.probabilite = (resultat.probabilite.e1 * 0.75) + (resultat.probabilite.e2 * 0.25);
	}
	if(resultat.probabilite.e1==0 && resultat.probabilite.e2==0 && (resultat.probabilite.e3>=resultat.probabilite.e2) ){
		resultat.probabilite = (resultat.probabilite.e3 * 0) ;
	}
	if(resultat.probabilite.e1==0 && resultat.probabilite.e3>=resultat.probabilite.e2 && resultat.probabilite.e2!=0){
		resultat.probabilite = (resultat.probabilite.e3 * 0.25) + (resultat.probabilite.e2 * 0.75);
	}
	if(resultat.probabilite.e3==0 && resultat.probabilite.e2>resultat.probabilite.e1 ){
		resultat.probabilite = (resultat.probabilite.e1 * 0.34) + (resultat.probabilite.e2 * 0.66);
	}
	if(resultat.probabilite.e1==0 && resultat.probabilite.e2>resultat.probabilite.e3 ){
		resultat.probabilite = (resultat.probabilite.e3 * 0.34) + (resultat.probabilite.e2 * 0.66);
	}
	//console.log("Resultat logique floue  "+util.inspect(resultat));
	flou[boite].chiffre[jour].r = resultat;
	flou[boite].chiffre.date = new Date();
	ev.emit("sortie");
	//ev.emit("save", resultat); TODO ENLEVER LE COM
});
/*
ev.on("save", function(resultat){
	fs.writeFile(resultat.nom+""+"_logiqueFloue_"+resultat.temps, JSON.stringify(resultat), function(err){ 
			if(err) throw err;
			console.log(resultat.nom);
			console.log('on a enregiste le buffer dans un fichier');
	});
});
*/

var triAnsemble = function(borne1, borne2, val){

	var res = {};
	var borne0 = (borne2+borne1)/2;
	
	var a1 = 1/(borne0-borne1);
	var a2 = 1/(borne2-borne0);

	if(val <= borne1){
		res.e1=1;
		res.e2 =0;
		res.e3 = 0;
	}else if(val > borne1 && val < borne0){

		res.e2 = a1*(val-borne1);
		res.e1 = 1 - res.e2;
		res.e3 = 0;
	}else if(val > borne0 && val < borne2){

		res.e1 = 0;
		res.e3 = a2*(val-borne0);
		res.e2 = 1 - res.e3;
	}else if(val >= borne2){

		res.e1 = 0;
		res.e2 = 0;
		res.e3 = 1;
	}else if(val == borne0){

		res.e1 = 0;
		res.e2 = 1;
		res.e3 = 0;
	}
	return res;
}

var logique = function(note,date){
	d1 = new Date();
	d1 = d1.valueOf();
	var l = triAnsemble(-4,4,note);
	var d = triAnsemble((d1+(864000*2)),(d1+(864000*7)),date);
	var appartenance = {};
	cpt =0;
	
	appartenance.desc = 0;
	appartenance.neutre = 0;
	appartenance.monte = 0;
	//util.log(util.inspect(l));
	//util.log(util.inspect(d));
	if(d.e3 && l.e3){
		appartenance.neutre += 0.5 + l.e3/2;
		appartenance.monte += l.e3 -d.e2/2 -d.e3;
		//util.log("ok"+appartenance.monte);
		//util.log("------neutre-----"+appartenance.neutre);
		cpt++;
	}
	if(d.e3 && l.e1){
		appartenance.neutre += 0.5 + l.e1/2;
		appartenance.desc += l.e1 - d.e2/2 -d.e3;
		//util.log("ok11");
		//util.log("------neutre-----"+appartenance.neutre);
		//util.log(l.e1);
		cpt++;
	}
	if(d.e2 && l.e3 && !d.e3){
		appartenance.monte +=  l.e3 - d.e2/2;
		appartenance.neutre += d.e2/2;
		//util.log(l.e3);
		//util.log("------monte-----"+appartenance.monte);
		//util.log("ok2");
		cpt ++;
	}
	else if(d.e2 && l.e1 && !d.e3){
		//util.log("ok3");
		appartenance.desc +=  l.e1- d.e2/2;
		appartenance.neutre += d.e2/2;
		//util.log("-----desc------"+appartenance.desc);
		//util.log(l.e1);
		//util.log(l.e2);
		cpt++;
	}
	if(d.e1 && !d.e2){
		appartenance.desc += l.e1;
		appartenance.neutre += l.e2;
		appartenance.monte += l.e3;
		//util.log("ok4");
		cpt++;
	}
	
	//util.log(cpt + util.inspect(appartenance));
	if(appartenance.monte>1){
		appartenance.monte = 1;
	}
	if(appartenance.neutre>1){
		appartenance.neutre = 1;
	}
	if(appartenance.desc>1){
		appartenance.desc = 1;
	}
	//util.log(util.inspect(appartenance));
	defloutage(appartenance);
};

var defloutage = function(appartenance){
	var cpt = 0;
	var x;
	var mbx =0;var dbx =0;var nbx =0;
	var y;var mby =0;var dby =0;var nby =0;
	if(appartenance.monte>=1)
	{
		mbx = 6.5/4; 
		mby = 2/4;
		cpt ++;
		//util.log(mbx);
	}
	if(appartenance.monte>0 && appartenance.monte<1)
	{
		mbx = (appartenance.monte+1+4+1)/4;
		mby = appartenance.monte;
		cpt ++;
		//util.log("OK");
		//util.log(mbx);

	}
	if(appartenance.neutre)
	{
		nbx = 1;
		nby = 1/3;
		cpt ++;
	}
	
	if(appartenance.desc>=1)
	{
		dbx = 1.5/4; 
		dby = 2/4;
		cpt ++;
	}
	if(appartenance.desc>0 && appartenance.desc<1)
	{
		dbx = (1-appartenance.desc+1)/4;
		dby = 1-appartenance.desc;
		cpt ++;
	}
	x = (mbx + dbx + nbx)/cpt;
	y = (mby + dby + nby)/cpt;
	//util.log("OK");
	//util.log("x : "+x+" y : "+y);
	//util.log("x : "+x+" mbx : "+mbx+" dbx : "+dbx+" nbx : "+nbx);
	//util.log("sortie :  " + util.inspect(triAnsemble(0.5,1.5,x)));
	
	var s = triAnsemble(0.5,1.5,x);
	if(s.e1){
		//sortie = -s.e1+s.e2*0.25;
		if(s.e1<1)
		{
			sortie = (s.e1-s.e2*0.25);
			sortie = -affine(0.4,0.66,sortie);
			//sortie = ((1/(0.66-0.4))*sortie)+(0.4/(0.66-0.4));
		}
		else
		{
			sortie = -1;
		}
	}
	else if(s.e3){
		if(s.e3<1)
		{
			sortie = (s.e3-(s.e2*0.25));
			sortie = affine(0.4,0.66,sortie);
			//sortie = ((1/(0.66-0.4))*sortie)-(0.4/(0.66-0.4));
		}
		else
		{
			sortie = 1;
		}
	}
	else{
		sortie =0;
	}
	//var sortie = - s.e1*s.e2 + s.e3*s.e2;
	//util.log("sortie :  " + sortie);

	//sem--;
	outputar += sortie;
	
};

var affine = function(b1,b2,e){
	
	return ((1/(b2-b1))*sortie)-(b1/(b2-b1))
};


var readbase = function(entreprise){

	entreprise = entreprise.toUpperCase();
	entreprise = entreprise.replace(" SA","");
	
	var cpt = 0;
	
	//server.f ++;
	var i = 0;
	//var stmt = "SELECT * FROM basearticle";
	var stmt = "SELECT * FROM basearticle WHERE entreprise = '" + entreprise + " '";
    
	db.each(stmt, function (e, r) {
		if(e){
			util.log("ERROR Base de donnees : " + e);
		} else if (r) {
			//server.base[i] = r;
			//sem++;
			//util.log("-----1");
			ev.emit("flou",r.note,r.date);
			//for(i=0;i<10000000;i++);
			//logique(r.note,r.date);
			//util.log("___"+cptx);
			ev.emit("coucou");
		}
    },function(){
	flou[boite].article.date = new Date();
	flou[boite].article.s = outputar;
	ev.emit("sortie");
		//tmp.article.article.date = new Date();
		//tmp.article.article.note = output;
		util.log(sem);
	
	});

	
};

var exit = function(){
	//util.log(util.inspect(flou[boite].chiffre));
	util.log(sem);
	if(!--sem){
	//util.log(util.inspect(flou));
		flou[boite].r = {};
		flou[boite].r.jour = {};
		flou[boite].r.semaine = {};
		for(i in flou[boite].chiffre)
		{
			
			if(i != "date")
			{
				//util.log(i);
				
				flou[boite].r[i].p = flou[boite].chiffre[i].r.probabilite*100;
				
				if(flou[boite].chiffre[i].r.prevision == "stable"){
					if(flou[boite].article.s > 0,7){
						flou[boite].r[i].s = 1;
					}
					else if(flou[boite].article.s < -0,7){
						flou[boite].r[i].s = -1;
					}
					else{
						flou[boite].r[i].s = 0;
					}
				}
				else if(flou[boite].chiffre[i].r.prevision == "hausse"){
					if(flou[boite].article.s >= 0){
						flou[boite].r[i].s = 1;
					}
					else{
						flou[boite].r[i].s = 0;
					}
				}
				else{
					if(flou[boite].article.s < 0){
						flou[boite].r[i].s = -1;
					}
					else{
						flou[boite].r[i].s = 0;
					}
				}
				//util.log(util.inspect(flou[boite].r));
				//util.log(util.inspect(flou[boite].r));
			}
			//util.log(util.inspect(flou[boite].r));
		}
		util.log("---------------- coucou");
		that[fonc](flou[boite].r);
		//util.log(util.inspect(flou[boite].r));
		//write();
	}
};

ev.on("flou",logique);
ev.on("sortie",exit);

exports.texist = function(ethat, efonc, entreprise){

	d = new Date();
	that = ethat;
	fonc = efonc;
	boite = entreprise;
	sem = 0;
	
	console.log("- --------------- : " + entreprise);
	//fs.readFile('../slogique.json', 'utf-8', 'r+', function (err, data) {
		//if (err) util.log(err);
		//var flou = JSON.parse(flou);

		if(flou[entreprise]){
			//tmp = flou[entreprise];
			//tmp.date = date;
			if((flou[entreprise].chiffre.date - d )< 500000)
			{
				logiqueFloue(entreprise,"jour");
				logiqueFloue(entreprise,"semaine");
				sem+=2;
			}
			if(flou[entreprise].article.date - d< 60*60*1000)
			{
				readbase(entreprise);
				sem++;
			}
			else{
				that[fonc](flou[entreprise].r);
				util.log("---------------- coucou2");
			}
		}else{
			//start(entreprise,date);
			flou[entreprise] = {};
			flou[entreprise].article = {};
			flou[entreprise].chiffre = {};
			flou[entreprise].chiffre.jour = {};
			flou[entreprise].chiffre.semaine = {};
			sem += 3;
			readbase(entreprise);
			logiqueFloue(entreprise,"jour");
			logiqueFloue(entreprise,"semaine");
			util.log(sem);
		}
	//})
};

var predict = function(){
	

}




