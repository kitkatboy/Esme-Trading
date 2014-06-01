var util = require('util');
var events = require("events");
var readwrite = require("./readwrite.js");

var server = {};
var flou = {};
var listentreprise = {};

//POIDS JOUR
server.borneSupJour = 2;
server.borneInfJour = -2;
//POIDS SEMAINE
server.borneSupSemaine = 2;
server.borneInfSemaine = -2;
//VARRIANCE JOUR
server.borneSuppJour = 0.7;
server.borneInffJour = 0;
//VARRIANCE SEMAINE
server.borneSuppSemaine = 0.5;
server.borneInffSemaine = 0;

var init = function(){
	readwrite.readFile('../protected/entreprises_cac40.json',"utf-8", function (e,data) {
		if(e){
			util.log(e);
		}
		else{
		// util.log(data);
			data = JSON.parse(data);
			var tmp = [];
			for(i in data.nom)
			{
				if (data.nom[i].name.indexOf("'") >= 0) { //--------------------------------------------------------------------------- ATTENTION
					data.nom[i].name = data.nom[i].name.replace("'", "''");
				}
				if (data.nom[i].nom.indexOf("'") >= 0) { //--------------------------------------------------------------------------- ATTENTION
					data.nom[i].nom = data.nom[i].nom.replace("'", "''");
				}
				
				
				tmp[i] = data.nom[i].name;
				listentreprise[data.nom[i].name]= data.nom[i].nom;
				flou[data.nom[i].name] = {};
				flou[data.nom[i].name].r = {};
				flou[data.nom[i].name].article = {};
				flou[data.nom[i].name].chiffre = {};
				flou[data.nom[i].name].chiffre.jour = {};
				flou[data.nom[i].name].chiffre.semaine = {};
				
			}
			logiqueFloue(tmp);
		
		}
			// util.log(util.inspect(tmp));

		// readbase(listentreprise);
	});
};

var logiqueFloue = function(nom,rep){

	var prevision={};
	
	readwrite.readFile('../protected/cac_40.json',"utf-8", function (e,data) { // LE FICHIER PEUT EXISTER ET ETRE VIDE ! 
	// util.log(util.inspect(listentreprise));
	data = JSON.parse(data);
	
	for(j in nom)
	{
		// if (data.entreprise[j].nom_entreprise.indexOf("'") >= 0) { //--------------------------------------------------------------------------- ATTENTION
			// data.entreprise[j].nom_entreprise = data.entreprise[j].nom_entreprise.replace("'", "''");
		// }
		// util.log(data.entreprise[i].nom_entreprise);
		prevision.nom_entreprise=listentreprise[nom[j]];
		for(i in data.entreprise)
		{
			if(data.entreprise[i] !=null){
				// util.log(data.entreprise[i].nom_entreprise +"  /  "+ listentreprise[nom[j]]);
				
					
				if(data.entreprise[i].nom_entreprise == listentreprise[nom[j]]){
					
				// util.log("ok");
					var  variance_jour = +(data.entreprise[i].variance_jour);
					prevision.variance_jour = triAnsemble(server.borneInffJour, server.borneSuppJour, variance_jour);
					var  poids_jour = (data.entreprise[i].poids_jour);
					prevision.poids_jour = triAnsemble(server.borneInfJour, server.borneSupJour, poids_jour);
					prevision.temps="jour";
					
					flou[nom[j]].chiffre.jour = prevjour(prevision);
					flou[nom[j]].chiffre.date = new Date();

					var  variance_semaine = +(data.entreprise[i].variance_semaine);
					prevision.variance_semaine = triAnsemble(server.borneInffSemaine, server.borneSuppSemaine, variance_semaine);
					var  poids_semaine = (data.entreprise[i].poids_semaine);
					prevision.poids_semaine = triAnsemble(server.borneInfSemaine, server.borneSupSemaine, poids_semaine);
					prevision.temps="semaine";
					
					flou[nom[j]].chiffre.semaine = prevsemaine(prevision);
					flou[nom[j]].chiffre.date = new Date();
					// util.log(util.inspect(prevsemaine(prevision)));
				}
				}
			}
	}
	// util.log(util.inspect(flou));
	readbase(nom,rep);
	
	});
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var prevjour = function(prevision){
	
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
	return defu(output,"jour");
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ev.on("semaine", 
var prevsemaine = function(prevision){

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
	return defu(output,"semaine");
};
var defu = function(output,jour){
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
	return resultat;
};

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
	if(d.e3 && l.e3){
		appartenance.neutre += 0.5 + l.e3/2;
		appartenance.monte += l.e3 -d.e2/2 -d.e3;
		cpt++;
	}
	if(d.e3 && l.e1){
		appartenance.neutre += 0.5 + l.e1/2;
		appartenance.desc += l.e1 - d.e2/2 -d.e3;
		cpt++;
	}
	if(d.e2 && l.e3 && !d.e3){
		appartenance.monte +=  l.e3 - d.e2/2;
		appartenance.neutre += d.e2/2;
		cpt ++;
	}
	else if(d.e2 && l.e1 && !d.e3){
		appartenance.desc +=  l.e1- d.e2/2;
		appartenance.neutre += d.e2/2;
		cpt++;
	}
	if(d.e1 && !d.e2){
		appartenance.desc += l.e1;
		appartenance.neutre += l.e2;
		appartenance.monte += l.e3;
		cpt++;
	}
	
	if(appartenance.monte>1){
		appartenance.monte = 1;
	}
	if(appartenance.neutre>1){
		appartenance.neutre = 1;
	}
	if(appartenance.desc>1){
		appartenance.desc = 1;
	}
	return (defloutage(appartenance));
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
	}
	if(appartenance.monte>0 && appartenance.monte<1)
	{
		mbx = (appartenance.monte+1+4+1)/4;
		mby = appartenance.monte;
		cpt ++;
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
	
	var s = triAnsemble(0.5,1.5,x);
	if(s.e1){
		if(s.e1<1)
		{
			sortie = (s.e1-s.e2*0.25);
			sortie = -affine(0.4,0.66,sortie);
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
		}
		else
		{
			sortie = 1;
		}
	}
	else{
		sortie =0;
	}
	return sortie;
	
};

var affine = function(b1,b2,e){
	
	return ((1/(b2-b1))*sortie)-(b1/(b2-b1))
};

var readbase = function(nom,rep){
var sem = 0;
var tmp = [];
var reg = new RegExp("é", "g");
var sup = "SA S.A. SE REG NV GROUP";
var j = 0;
var cpt2 = 0;
var entreprise = [];

	for(i in nom){
		
		sem++;
		if(nom.length>=2)
		{
			entreprise[sem] = nom[i];
		}
		else{
			entreprise[sem] = i;
		}
		// console.log(entreprise);
		
		tmp[sem] = "";
		tmp[sem] = (entreprise[sem]).replace(reg, "e");
		tmp[sem] = tmp[sem].toUpperCase();
		tmp[sem] = tmp[sem].replace(" SA","");
		// if (tmp[sem].indexOf("'") >= 0) { //--------------------------------------------------------------------------- ATTENTION
			// tmp[sem] = tmp[sem].replace("'", "''");
		// }
		
		// console.log(tmp);
		
		// console.log(tmp[sem]);
		readwrite.each("../protected/basearticle.db","SELECT entreprise, note, date FROM basearticle WHERE entreprise = '" + tmp[sem] + " '", function (e,r) {
			 cpt2++;
			 if(e){
				util.log(e);
			 }
			 else if (r) {
			 var out = 0;
				for(j in r){
					out += logique(r[j].note,r[j].date);
				}
				// util.log(entreprise[sem] + util.inspect(out));
				// console.log(entreprise[sem]);
				flou[entreprise[cpt2]].article.date = new Date();
				flou[entreprise[cpt2]].article.s = out;
				// console.log(tmp[sem]);
				// console.log(entreprise[cpt2]);
				// console.log(r);
				// console.log(r.date);
				
				// cpt2--;
			}
			// exit(entreprise);
			// console.log(entreprise[cpt2]);
			if(!--sem){
				// util.log(util.inspect(flou));
				exit(nom,rep);
			}
		});
	}
	

		// 
};

var exit = function(nom,rep){
	var date = new Date();	
	for(i in nom){
	if(nom.length>=2)
		{
			var entreprise = nom[i];
		}
		else{
			var entreprise = i;
		}
		// var entreprise = nom[i];
		// util.log(util.inspect(flou[entreprise].chiffre));
		flou[entreprise].r = {};
		flou[entreprise].r.jour = {};
		flou[entreprise].r.semaine = {};
		for(i in flou[entreprise].chiffre)
		{
			if(i != "date")
			{
			// util.log(entreprise+"  "+flou[entreprise].article.s+"  "+flou[entreprise].chiffre[i].prevision);
				flou[entreprise].r[i].p = flou[entreprise].chiffre[i].probabilite*100;
				
				if(flou[entreprise].chiffre[i].prevision == "stable"){
				// flou[entreprise].r[i].s = 0;
					if(flou[entreprise].article.s > 1.5){
						flou[entreprise].r[i].s = 1;
					}
					else if(flou[entreprise].article.s < -0.5){
						flou[entreprise].r[i].s = -1;
					}
					else{
						flou[entreprise].r[i].s = 0;
					}
				}
				else if(flou[entreprise].chiffre[i].prevision == "hausse"){
				// flou[entreprise].r[i].s = 1;
					if(flou[entreprise].article.s >= 0){
						flou[entreprise].r[i].s = 1;
					}
					else{
						flou[entreprise].r[i].s = 0;
					}
				}
				else{
				// flou[entreprise].r[i].s = -1;
					if(flou[entreprise].article.s <= 0){
						flou[entreprise].r[i].s = -1;
						// util.log(flou[entreprise].article.s);
					}
					else{
						flou[entreprise].r[i].s = 0;
					}
				}
			}
		}
	}
	// util.log(entreprise +" : "+util.inspect(flou[entreprise]));
	if(nom.length>1){
		if(rep){
			worst(rep);
			}
	}
	else{
		var tmp = {};
		tmp[entreprise] = flou[entreprise];
		rep.that[rep.fonc](tmp);
		// util.log(util.inspect(tmp));
	}
	// util.log(util.inspect(flou));
};


var best = function(){
	var stmp = {};
	var cpt = 0;
	max = [];
	max[0] = 0;
	var stmp2 = {};
	for(i in flou){
		// util.log(util.inspect(flou[i].r.jour));
		if(flou[i].r.jour.s == 1 || flou[i].r.semaine.s == 1){
			stmp[i] = flou[i];
		}
	}
	for(var j =0;j<5;j++){
		// util.log("coucou");
		for(i in stmp){
			if(stmp[i].r.jour.s == 1 && stmp[i].r.jour.p > max[0]){
				max[0] = flou[i].r.jour.p;
				max[1] = i;
			}else if(stmp[i].r.semaine.s == 1 && stmp[i].r.semaine.p > max[0]){
				max[0] = flou[i].r.semaine.p;
				max[1] = i;
			}
		}
		max[0] = 0;
		stmp2[max[1]] = flou[max[1]];
		stmp[max[1]].r.jour.p = 0;
		stmp[max[1]].r.semaine.p = 0;
	}
	// util.log("best : "+util.inspect(stmp));
	return stmp2;
};

var worst = function(rep){
	var stmp = {};
	stmp = best();
	readwrite.readFile('../protected/portefeuille/'+rep.id+'.json',"utf-8", function (e,data) {
	data = JSON.parse(data);
		for(i in data.entreprise)
		{
			if(flou[i].r.jour.s == -1 || flou[i].r.semaine.s == -1){
				if(data.entreprise[i][1]>0){
					stmp[i] = flou[i];
				}
			}
		}
		// util.log(util.inspect(stmp));
		// util.log(util.inspect(flou));
		rep.that[rep.fonc](stmp);
	});
}


var cac40 = function(that,fonc,id){
	var rep = {};
	rep.that = that;
	rep.fonc = fonc;
	rep.id = id;
	var tmp = [];
	var j = 0;
	d = new Date();
	for(i in flou){
	// util.log(util.inspect(flou[i]));
		if((d-flou[i].chiffre.date)< 5*60*1000){
			tmp[j] = i;
			j++;
		}
	}
	if(j){
		logiqueFloue(tmp,rep);
	}else{
		worst(rep);
	}
	//worste(id,that[fonc])
}



exports.texist = function(ethat, efonc, entreprise,id){
	if(entreprise == ""){
		cac40(ethat, efonc,id);
	}
	else{
	if (entreprise.indexOf("'") >= 0) { //--------------------------------------------------------------------------- ATTENTION
			entreprise = entreprise.replace("'", "''");
	}
	
		// util.log(entreprise);
		rep = {};
		var d = new Date();
		rep.that = ethat;
		rep.fonc = efonc;
		tmp = {};
		tmp[entreprise] = flou[entreprise];
		if((d - flou[entreprise].chiffre.date)< 5*60*1000)
		{
			logiqueFloue(tmp,rep);
		}
		else{
			ethat[efonc](tmp,rep);
		}
	}
	
};


init();
