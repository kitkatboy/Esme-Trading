var pri = {};

/* Script sur action "click" */
pri.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", pri.on_click);
	pri.load_art();
};

pri.on_click = function (ev) {
	// .target désigne la cible(le noeud DOM) concerné par le chang. d'état sur événement "click" (ici balises <div>)
    var src = ev.target;
	if (src.has_class("post1")) {
		pri.send_post1();
	}
};

pri.send_post1 = function() {
	// Récupération des données dans les balises de la classe associée
    var a = document.cookie;
	//alert("Valeurs : " + a);
	
    var data = {log_temp: a, act: "deconnect"};
	client.post(data, pri.post1_back);
};

pri.post1_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		window.location.assign("/acceuil.html");
	}
};

pri.load_art = function() {
	// Création d'un objet contenant les données
    var data = {act: "chargement_articles"};
	client.post(data, pri.load_articles_back);
};

pri.load_articles_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		//alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		if (r.resp) {
			//alert("this : " + r.resp);
			//r.resp = (r.resp).replace("\'", "\"");
			// Placer les nouveaux articles dans div tag
			//r.resp = (r.resp).substring(1, (r.resp).length - 1);
			document.getElementById('articles').innerHTML = r.resp;
			
		} else {
			alert("Les articles n'ont pas pu être rafraichis");
		}
	}
};

window.onload = function () {
    setTimeout(pri.init, 1);
};

$("#articles").html();