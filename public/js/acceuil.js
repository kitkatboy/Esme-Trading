var acc = {};

/* Script sur action "click" */
acc.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", acc.on_click);
};

acc.on_click = function (ev) {
	// .target désigne la cible(le noeud DOM) concerné par le chang. d'état sur événement "click" (ici balises <div>)
    var src = ev.target; 
	//alert("click : " + ev.target);
    if (src.has_class("post1")) {
        //alert("C'est là : " + src);
        acc.send_post1();
    } else if (src.has_class("post2")) {
        //alert("Evenement \'click\' post2");
        acc.send_post2();
    }/* else {
		alert("Pas passé : " + src);
	}*/
};

acc.send_post1 = function() {
	// Récupération des données dans les balises de la classe associée
    var a = md5(document.getElementsByClassName("id1")[0].value);
    var b = md5(document.getElementsByClassName("mdp1")[0].value);
	//alert("Valeurs : (" + a + ") (" + b + ")");
	
	// Création d'un objet contenant les données
    var data = {id: a, mdp: b, act: "identification"};
	if (a == md5("") || b  == md5("")){
		alert("Tous les champs n'ont pas été renseignés");
	} else {
		client.post(data, acc.post1_back);
	}
};

acc.send_post2 = function() {
    var a = md5(document.getElementsByClassName("mail")[0].value);
    var b = md5(document.getElementsByClassName("id2")[0].value);
	var c = md5(document.getElementsByClassName("mdp2")[0].value);
	//alert("Valeurs : (" + a + ") (" + b + ") (" + c + ")");
	
    var data = {mail: a,  id: b, mdp: c, act: "inscription"};
	if (a == md5("") || b  == md5("") || c== md5("")) {
		alert("Tous les champs n'ont pas été renseignés");
	} else {
		client.post(data, acc.post2_back);
	}
};

acc.post1_back = function () {
	// Reponse serveur affichée côté client lorsque les données sont complètement accessibles (readyState == 4)
    if (this.readyState == 4 && this.status == 200) {
        var r = JSON.parse(this.responseText); // .responseText est une variable qui contient la réponse du serveur
		if (r.resp == "Login ok") {
			window.location.assign("/principale.html");
			//alert("Rafraichissement articles");
			//------------------------------------------------------------
		} else {
			alert(r.resp);
		}
    }
};

acc.post2_back = function () {
    if (this.readyState == 4 && this.status == 200) {
        var r = JSON.parse(this.responseText);
		if (r.resp == "Votre compte est créé") {
			alert(r.resp + ". Identifiez vous pour accéder à nos services");
			window.location.assign("/acceuil.html");
		} else {
			alert(r.resp);
		}
    }
};

window.onload = function () {
    setTimeout(acc.init, 1);
};