var util = require("util");
var url = require("url");
var fs = require("fs");
var post = require('./post.js');
var database = require('./database.js');


/* Export de la methode "router"*/
exports.route = function (req, resp) {
    var traitement_requete = new constructeur(req, resp);
	
    traitement_requete.traitement_method(); //Appel de la methode de traitement
    traitement_requete = null; // Suppression de l'objet temporaire de requête
};


/* Constructeur */
constructeur = function (req, resp) {
	//util.log("Appel du constructeur.");
	
	if (req && resp) {
		this.req = req;
		this.resp = resp;
		this.pathname = ""; // Variable contenant le chemin d'accès, retravaillée pour en extraire le type de fichier
		this.filetype = "";
		this.path = ""; // Contient le chemin d'accès
		this.image_file = "jpg png jpeg bmp gif ico"; // Contient ttes les extensions d'images prisent en charge
		//this.var_test == false;
		util.log("Traitement de l\'url de l'objet \'requete\' : " + util.inspect(req.url));
	} else {
		util.log("ERROR - Un objet constructeur a besoin d'une requete et d'une reponse.");
		return;
	}
};

constructeur.prototype = {

traitement_method:
    function () {
        util.log("Requete reçue de type : " + this.req.method + ".");
		
        if (this.req.method == "GET") {
			this.get_method(); // Appel de la methode de traitement des GET		
        } else if (this.req.method == "POST") {
            this.post_method(); // Appel de la methode de traitement des POST		
        } else {
            this.resp.writeHead(501, {"Content-Type": "application/json"});
            this.resp.write(JSON.stringify({message: "Not Implemented"}));
            this.resp.end();
			return;
        }
    },

post_method:
    function () {
		//util.log("Traitement requete POST en cours...");
		/*
		* _this conservera le pointeur sur l'objet dans une fonction créée à l'intérieur d'une methode
		* this, lui, pointera sur la portée globale. A l'intérieur de cette fonction, il sera 'undefined'
		*/
		var _this = this; 
		
        var paquets = "";
		// Ecoute de la requête POST et collecte des paquets
        this.req.on("data", function (paquet) {
			paquets += paquet;
        });
		
		// Action de fin d'écoute, lorsque le dernier paquet est reçu
        this.req.on("end", function () {
            _this.go_post(JSON.parse(paquets)); // Envoi des données collectées au format JSON
        });
    },

go_post:
    function (paquets) {
		/*
		* util.inspect() -> affiche le contenu d'un objet sous forme d'une chaîne de caractères
		* JSON.parse() -> Convertie un String en JSON
		*/
		util.log("Mail : " + paquets.mail + ", Id : " + paquets.id + ", MdP : " + paquets.mdp + ", act : " + paquets.act + ", search : " + paquets.search);
		
		post.postReq(paquets, this.req, this.resp);
    },

get_method:
    function () {
		//util.log("Traitement requete GET en cours...");
        var u = url.parse(this.req.url, true, true); // Extrait la valeur url de l'objet 'requête'
		//util.log("Pathname : " + u.pathname);
        var regexp = new RegExp("[/]+", "g"); // Paramètres d'extraction
        this.pathname = u.pathname.split(regexp); // Extraction des motifs du chemin de l'url
        this.pathname = this.pathname.splice(1, this.pathname.length - 1); // Supprime le 1er caractère de la chaîne
        this.filetype = this.pathname[this.pathname.length - 1].split("."); // Sépare le dernier caractère en deux au "."
		this.filetype = this.filetype[this.filetype.length - 1]; // Récupère l'extension du fichier
		this.path = "../public" + u.path + ((u.path.indexOf(".") >= 0) ? "" : this.extension());
		
		//console.log("Pathname : " + this.path);
        
		this.read_file();
    },
	
extension:
	function () {
		//util.log("Ajout de l'extension");
		this.filetype = "html";
		return ".html";
	},

read_file:
    function () {
		var _this = this;
		/* Si le chemin est vide on retourne la page d'acceuil */
		util.log("Path : " + this.path/* + " " + util.inspect(this.pathname)*/);
        if (!this.pathname[0] || this.path.indexOf("protected") >= 0) {
            this.pathname = "../public/acceuil.html";
            this.path = "../public/acceuil.html";
            this.filetype = "html";
        }
        this.load_file();
    },

load_file:
    function () {	
		var _this = this;
		/* Le systeme vérifie si le chemin (this.path) donné en argument existe */
        fs.exists(this.path, function (exist) {
            if (exist) {
                fs.readFile(_this.path, function (error, contenu) {
                    if (error) {
                        util.log("ERROR - Internal Server Error : " + error);
						_this.resp.writeHead(500, {"Content-Type": "text/html"});
						_this.resp.end();
                    } else {
                        _this.file = contenu; // On attribue la valeur trouvée "contenu" à la variable "_file"					
                        _this.file_processing();			
                    }
                });
            } else if (!(_this.path.indexOf("protected") >= 0)) {
				database.checkDatabase(_this, "changement_dossier", "retour_acceuil");
			} else {
				util.log("INFO - File requested not found : " + _this.path);
				_this.resp.writeHead(404, {"Content-Type": "text/html"});
				_this.resp.write("Erreur 404 - Le fichier est introuvable");
				_this.resp.end();
			}
		});
	},
	
changement_dossier:
	function () {
		this.path = this.path.replace("public", "protected");
		util.log("Recherche dans le dossier \'protected\' : " + this.path);
		this.load_file();
	},
	
retour_acceuil:
	function () {
		this.pathname = "../public/acceuil.html";
		this.path = "../public/acceuil.html";
		this.filetype = "html";
		this.load_file();
	},

file_processing:
    function () {
        if (this.filetype == "htm") {
            this.resp.writeHead(200, { "Content-Type" : "text/html"});
        }
		/* 
		* .indexOf() -> Retourne la position de l'argument (à partir de quel caractère il se trouve dans la chaîne) 
		* Retourne -1 si l'argument (ici filetype) n'est pas dans la chaîne testé (ici image_file)
		*/
		else if (this.image_file.indexOf(this.filetype) >= 0) {
            this.resp.writeHead(200, { "Content-Type" : "image/" + this.filetype });
        } else { 
            this.resp.writeHead(200, { "Content-Type" : "text/" + this.filetype });
        }
        this.file_send();
    },

file_send:
    function () {
        this.resp.write(this.file); // Affichage du contenu
        this.resp.end();
    }
};



