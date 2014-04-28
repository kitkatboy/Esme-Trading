var util = require('util');
var http = require('http');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter();
var server = {};


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

//fonctions d'appartenance de type (trois triangles)/////////////////////////////////////////////////////////////

var triAnsemble = function(borne1, borne2, val){

	var res = {};
	var borne0 = (borne2+borne1)/2;
	var coef_dirrecteur1 = -1/(borne0-borne1);
	var coef_dirrecteur2 = 1/(borne0-borne1);
	var coef_dirrecteur3 = -1/(borne2-borne0);
	var coef_dirrecteur4 = 1/(borne2-borne0);

	if(val <= borne1){

		res.e2 =0;
		res.e1=1;
		res.e3 = 0;
	}else if(val > borne1 && val < borne0){

		res.e1 = val*(coef_dirrecteur1);
		res.e2 = val*(coef_dirrecteur2)+1;
		res.e3 = 0;
	}else if(val > borne0 && val < borne2){

		res.e1 = 0;
		res.e2 = val*(coef_dirrecteur3)+1;
		res.e3 = val*(coef_dirrecteur4);
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

	var l = triAnsemble(-5,5,note);
	var d = triAnsemble(0,3,date);
	var appartenance = {};
	cpt =0;
	
	appartenance.desc = 0;
	appartenance.neutre = 0;
	appartenance.monte = 0;
	util.log(util.inspect(l));
	util.log(util.inspect(d));
	if(d.e3){
		appartenance.neutre += l.e3 - l.e1;
		cpt++;
	}
	/*if(d.e2 && l.e3){
		appartenance.monte += l.e2 + l.e3/2;
		cpt ++;
	}
	if(d.e2!=0 && l.e1){
		util.log("ok");
		appartenance.desc += l.e2 - l.e1/2;
		cpt++;
	}*/
	if(d.e2){
		appartenance.monte += l.e2 + l.e3/2;
		appartenance.desc += l.e2 - l.e1/2;
		cpt++;
	}
	if(d.e1){
		appartenance.desc += l.e1;
		appartenance.neutre += l.e2;
		appartenance.monte += l.e3;
		cpt++;
	}/*
	appartenance.desc = appartenance.desc/cpt;
	appartenance.neutre = appartenance.neutre/cpt;
	appartenance.monte = appartenance.monte/cpt;*/
	
	util.log(util.inspect(appartenance));

};

logique(3,2);

//console.log(triAnsemble(-5, 5, 2));