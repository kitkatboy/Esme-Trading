var sqlite3 = require("sqlite3").verbose();
// var exdb = new sqlite3.Database("../protected/databaseChiffres.db");
var db = new sqlite3.Database("../protected/databaseChiffre.db");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
exports.event = new EventEmitter();
var fs = require('fs');


exports.create = function () {
	db.run("CREATE TABLE databaseChiffre(id TEXT, day TEXT, value TEXT, date TEXT)");
	console.log("databaseChiffre creer");
};
//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
exports.insert = function (obj) {
var new_date = new Date();
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO databaseChiffre VALUES (?,?,?,?)");
		// stmt.run(obj.id, obj.day, obj.value, obj.date); // todo effacher cette ligne tmp une fois la nouvelle database transposé
		stmt.run(obj.id, obj.day, obj.valeur, new_date.valueOf());
		stmt.finalize();
		console.log("---Enregistrement de la valeur---");
	});
};
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
exports.readAll = function (that, fonc) {
	var b = "";
	var outputs ={};
	var output =[];
	var c = new Array();
	var nbr = 0;
	var day = 0;
	var j = 0;
	var k = 0;
	var day = 0;
	var maxDay = 0;
	//-----------------------------------------------------------------------------------------
	db.get("SELECT MAX(day),day FROM databaseChiffre", function (e, r){
		res = new Array();
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var maxDay = r.day;
				// console.log("-------------------------"+maxDay);		
			}		
	var lastDay = maxDay -1;
	db.get("SELECT MAX(date), value FROM databaseChiffre WHERE day ="+"'"+lastDay+"'", function (e, r){
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var cloture = parseFloat(r.value);
				outputs.cloture = cloture;	
			}
					
			
	//-----------------------------------------------------------------------------------------	
	db.get("SELECT MAX(date), value FROM databaseChiffre", function (e, r){
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var coursActuel = parseFloat(r.value);
				// console.log("-----"+parseFloat(r.value));
				outputs.coursActuel = coursActuel;	
			}
		
	//-----------------------------------------------------------------------------------------	
	db.get("SELECT MIN(date), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var ouverture = parseFloat(r.value);
				// console.log(ouverture);
				outputs.ouverture = ouverture;
			}
		
	//-----------------------------------------------------------------------------------------	
	db.get("SELECT MAX(value), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var plusHaut = parseFloat(r.value);
				// console.log(plusHaut+ "  plusHaut");
				outputs.plusHaut = plusHaut;
			}	
	//-----------------------------------------------------------------------------------------	
	db.get("SELECT MIN(value), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
		res = new Array();
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var plusBas = parseFloat(r.value);
				outputs.plusBas = plusBas;
			}
			
	outputs.variation = (((+outputs.coursActuel)*100)/(+outputs.cloture))-100;
	
	//-----------------------------------------------------------------------------------------
	stmt = "SELECT date, value FROM databaseChiffre ORDER BY date";
    db.each(stmt, function (e, r) {
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				c.push(parseFloat(r.date));
				c.push(parseFloat(r.value));
				nbr++;
			}
		}, 
		function () {
		var b ="";
			for(var i=0; i < 2*nbr; i++) 
			{
				b+= "["+c[i]+",  "+c[i+1]+"], "; //todo enlever le new date 
				j++;
				if((c[i+2]- c[i]) > 10*60*60*1000){ //TODO 
					b = b.substring(0,  b.length-2);	
					output[day]= "["+b+"]";
					day++;
					var b ="";		
				}
				i++;
			}
			b = b.substring(0,  b.length-2);
			output[day]="["+b+"]";
			outputs.output = output;
			// console.log(outputs);
			that[fonc](outputs);
		
	});	
	});
	});
	});
	});
	});
	});
};
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------
exports.getName=function(that, fonc){
	var output = "";
	fs.readFile('../protected/entreprises_cac40.json', 'utf-8', function (err, data) {
		if(err) {
			util.log(err);
		} else if (data) {
			data = JSON.parse(data); 
		} else {
			that[fonc]("no result");	
		}	
		that[fonc](data);
	});
};

/*
//--------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------fonction qui remplie la nouvelle db
exports.sendDatabase = function(){
	var c = new Array();
	var nbr = 0;
	var day = 0;
	var id = 0;
	var obj = {};
	stmt = "SELECT * FROM databaseChiffres ORDER BY date";
    exdb.each(stmt, function (e, r) {
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				 c.push(parseFloat(r.date));
				 c.push(parseFloat(r.value));
				 nbr++;
			}
		}, 
		function () {
	var day = 0;
	var id = 0;
	var obj = {};
		for(i=0; i< 2*nbr; i++) 
			{		  
				exports.insert({"id" : id, "day" : day, "value" : c[i+1], "date" : c[i]});
				console.log("{id : "+id+", day : "+day+", value : "+c[i+1]+", date : "+new Date(c[i])+"}")
				id++;
				if((c[i+2]- c[i]) > 10*60*60*1000){ //TODO 	
					id = 0;	
					day++;
				}
				i++;
			}
});
}
//--------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------

exports.readWeek = function () { // renvoie les valeurs sur une semaine
    var stmt = "SELECT * FROM databaseChiffre ORDER BY date" ;
	// var a = new Array();
    db.each(stmt, function (e, r) {
		// a.push(r.id);
		// a.push(r.day);
		console.log(r);
    }, function () {
		// console.log(a);
	})
	
};
*/
//--------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
// exports.readWeek(); //-----------------------Etape 3 voir si tous les jours sont dans le nouvelle db 
//exports.getName(null, null);
// exports.readAll(null, null);
// exports.create();   // -----------------------Etape 1 creer la nouvelle db 
//exports.insert({"valeur" : "46"});
// exports.readAll(null, null);
// exports.sendDatabase();//-----------------------Etape 2 transposer la db dans la nouvelle db
