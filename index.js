const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

obGlobal = {
    obErori: null,
    obImagini: null,
};
app = express();
app.set("view engine", "ejs");

console.log("Folder proiect:", __dirname);
console.log("Cale fisier:", __filename);
console.log("Director de lucru:", process.cwd());

vectorFoldere = ["temp", "temp1"];

for (let folder of vectorFoldere) {
    // let caleFolder = __dirname + "/" + folder;
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

app.use("/resurse", express.static(path.join(__dirname, "/resurse")));

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});

app.get("/favicon.ico", function (req, res) {
    // res.sendFile(__dirname + "/resurse/favicon/favicon.ico");
    res.sendFile(path.join(__dirname, "/resurse/favicon/favicon.ico"));
});

// 01ABCD".match(/^[0-9A-Fa-f]+$/)
app.get("/ceva", function (req, res) {
    res.send("altceva");
});

app.get(["/index", "/", "/home"], function (req, res) {
    console.log(req.ip);
    res.render("pagini/index.ejs", { ip: req.ip ,imagini: obGlobal.obImagini.imagini });

});

app.get("/istoric", function (req, res) {
    res.render("pagini/istoric.ejs");
});

// app.get(/[a-zA-Z0-9]\.(ejs)+$/i, function (req, res) {
app.get("/*.ejs", function (req, res) {
    afiseazaEroare(res, 400);
});

app.get("/*", function (req, res) {
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    // afiseazaEroare(res, { _identificator: 404, _titlu: "Pagina nu a fost gasita", _text: "Pagina nu a fost gasita", _imagine: "/resurse/images/erori/lupa.jpg" });
                    afiseazaEroare(res, 404);
                }
            }
            else {
                afiseazaEroare(res);
            }
        });
    }
    catch (err) {
        if (err.message.startsWith("Cannot find module")) {
            afiseazaEroare(res, 404);
        }
        else {
            afiseazaEroare(res);
        }

    }

});

function initErori() {

    // var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);

    let vErori = obGlobal.obErori.info_erori;
    // for(let i = 0; i < obGlobal.obErori.info_erori.length; i++) {
    //     console.log(vErori[i].imagine);

    for (let eroare of vErori) {
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
        console.log(eroare.imagine);
    }
}

function initImagini() {

    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);

    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");
    
    if(!fs.existsSync(caleAbsMediu)) {
        fs.mkdirSync(caleAbsMediu);
    }

    if(!fs.existsSync(caleAbsMic)) {
        fs.mkdirSync(caleAbsMic);
    }

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");

        imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + "_mediu" + ".webp");
        imag.fisier_mic = "/" + path.join(obGlobal.obImagini.cale_galerie, "mic", nume_fisier + "_mic" + ".webp");

        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        let caleAbsFisMic = path.join(__dirname, imag.fisier_mic);

        sharp(path.join(caleAbs, imag.fisier)).resize(1000).toFile(caleAbsFisMediu);
        sharp(path.join(caleAbs, imag.fisier)).resize(400).toFile(caleAbsFisMic);

        imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);

    }
}

// daca  programatorul seteaza titlul, se ia titlul din argument
// daca nu e setat, se ia cel din json
// daca nu avem titlul nici in JSOn se ia titlul de valoarea default
// idem pentru celelalte

// function afiseazaEroare(res, {_identificator, _titlu, _text, _imagine} = {}) {
function afiseazaEroare(res, _identificator, _titlu = "titlu default", _text = "text default", _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });

    if (eroare) {
        let titlu = _titlu = "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text = _text = "text default" ? (eroare.text || _text) : _text;
        let imagine = _imagine = "imagine default" ? (eroare.imagine || _imagine) : _imagine;
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare.ejs", { titlu: titlu, text: text, imagine: imagine });

        }
        else {
            res.render("pagini/eroare.ejs", { titlu: titlu, text: text, imagine: imagine });
        }
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare.ejs", { titlu: errDef.titlu, text: errDef.text, imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine });
    }
}

initErori();
initImagini();
app.listen(8080);

console.log("Serverul a pornit!");

