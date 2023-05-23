const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const { Client } = require("pg");
const { Console } = require("console");
const { randomInt } = require("crypto");
const AccesBD = require("./resurse/js/accesbd.js")
const formidable = require("formidable");
const session = require("express-session");
const { Utilizator } = require("./resurse/js/utilizator.js");
const Drepturi = require("./resurse/js/drepturi.js");

var client = new Client({
    database: "douaroti",
    user: "bogdan",
    password: "tw2023pa55",
    host: "localhost",
    port: 5432,
});
client.connect();

client.query("select * from produse_test", function (err, rez) {
    console.log("Eroare BD", err);

    console.log("Rezultat BD", rez.rows);
});

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: [],
    optiuniCulori: []
};

app = express();
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.set("view engine", "ejs");

console.log("Folder proiect:", __dirname);
console.log("Cale fisier:", __filename);
console.log("Director de lucru:", process.cwd());

vectorFoldere = ["temp", "temp1", "backup", "poze_uploadate"];

for (let folder of vectorFoldere) {
    // let caleFolder = __dirname + "/" + folder;
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

app.get("/favicon.ico", function (req, res) {
    // res.sendFile(__dirname + "/resurse/favicon/favicon.ico");
    res.sendFile(path.join(__dirname, "/resurse/favicon/favicon.ico"));
});

// 01ABCD".match(/^[0-9A-Fa-f]+$/)
app.get("/ceva", function (req, res) {
    res.send("altceva");
});

// Produse

client.query(
    'SELECT unnest(enum_range(NULL::categ_produse))',
    (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(res.rows);
        obGlobal.optiuniMeniu = res.rows;
    }
);

client.query('SELECT unnest(enum_range(NULL::culori))', (err, rez) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(rez.rows);
    obGlobal.optiuniCulori = rez.rows;
});



app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    next();
});

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});

app.get("/produse", function (req, res) {

    console.log("produse");
    client.query(
        "select * from unnest(enum_range(null::categ_produse))",
        function (err, rezCategorie) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            } else {
                let conditieWhere = "";
                if (req.query.categ)
                    conditieWhere = ` WHERE categorie='${req.query.categ}'`;
                client.query(
                    "SELECT * from produse" + conditieWhere,
                    function (err, rez) {
                        if (err) {
                            console.log(err);
                            afiseazaEroare(res, 2);
                        } else {
                            let zilele_saptamanii = ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
                            for (let i of rez.rows) {
                                data = new Date(i.data_adaugare);
                                i.data_adaugare = data.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' }) + "(" + zilele_saptamanii[data.getDay()] + ")";
                            }
                            let produse = rez.rows;
                            produse.sort(function (a, b) {
                                return a.id - b.id;
                            });
                            res.render("pagini/produse", {
                                produse: produse,
                                optiuni: rezCategorie.rows,
                                culori: obGlobal.optiuniCulori
                            });
                        }

                    }
                );
            }
        }
    );
});

app.get("/produse/:id", function (req, res) {

    console.log(req.params);

    client.query(
        `SELECT * FROM produse WHERE id=${req.params.id}`,
        function (err, rezultat) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            } else res.render("pagini/produs", { prod: rezultat.rows[0] });
        }
    );
});

app.get(["/index", "/", "/home"], function (req, res) {

    console.log(req.ip);
    console.log(obGlobal.optiuniMeniu);

    let produse_carousel = [];
    client.query(
        `SELECT nume, imagine, descriere FROM produse`,
        function (err, rezultat) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            } else {
                produse_carousel = rezultat.rows;
                produse_total = rezultat.rows;
                // select 5 random elements from produse carousel
                produse_carousel = [...produse_carousel].sort(() => 0.5 - Math.random()).slice(0, 4);
                console.log(produse_carousel)
                res.render("pagini/index.ejs", {
                    ip: req.ip,
                    imagini: obGlobal.obImagini.imagini,
                    optiuni: obGlobal.optiuniMeniu,
                    imagini_carousel: produse_carousel,
                    produse_total: produse_total
                });
            }
        }
    )
});

app.get("/istoric", function (req, res) {

    res.render("pagini/istoric.ejs");
});

app.get("/galerie", function (req, res) {

    // la fiecare request al paginii generam un nr random de imagini
    let nrImagini = randomInt(5, 11);
    if (nrImagini % 2 == 0) nrImagini++;

    // vectorul cu imaginile de la sfarsit la inceput
    let imgInv = [...obGlobal.obImagini.imagini].reverse();

    // citim fisierul scss si il impartim in linii
    let fisScss = path.join(__dirname, "resurse/scss/galerie_animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split("\n");

    let stringImg = "$nrImg: " + nrImagini + ";";

    // stergem prima linie ( cea cu nr vechi de imagini )
    liniiFisScss.shift();

    // scriem pe prima linie numarul nou de imagini
    liniiFisScss.unshift(stringImg);

    // scriem in fisierul scss
    // se va compila automat din functia compileaza_scss cand se schimba
    fs.writeFileSync(fisScss, liniiFisScss.join("\n"));

    res.render("pagini/galerie.ejs", {
        imagini: obGlobal.obImagini.imagini,
        nrImagini: nrImagini,
        imgInv: imgInv
    });
});



function initErori() {
    // var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    var continut = fs
        .readFileSync(path.join(__dirname, "/resurse/json/erori.json"))
        .toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);

    let vErori = obGlobal.obErori.info_erori;
    // for(let i = 0; i < obGlobal.obErori.info_erori.length; i++) {
    //     console.log(vErori[i].imagine);

    for (let eroare of vErori) {
        eroare.imagine =
            "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
        console.log(eroare.imagine);
    }
}

function initImagini() {
    var continut = fs
        .readFileSync(path.join(__dirname, "/resurse/json/galerie.json"))
        .toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);

    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu)) {
        fs.mkdirSync(caleAbsMediu);
    }

    if (!fs.existsSync(caleAbsMic)) {
        fs.mkdirSync(caleAbsMic);
    }

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");

        imag.fisier_mediu =
            "/" +
            path.join(
                obGlobal.obImagini.cale_galerie,
                "mediu",
                nume_fisier + "_mediu" + ".webp"
            );
        imag.fisier_mic =
            "/" +
            path.join(
                obGlobal.obImagini.cale_galerie,
                "mic",
                nume_fisier + "_mic" + ".webp"
            );

        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        let caleAbsFisMic = path.join(__dirname, imag.fisier_mic);

        sharp(path.join(caleAbs, imag.fisier))
            .resize(1000, 1000)
            .toFile(caleAbsFisMediu);
        sharp(path.join(caleAbs, imag.fisier))
            .resize(300, 300)
            .toFile(caleAbsFisMic);

        imag.fisier =
            "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}

// daca  programatorul seteaza titlul, se ia titlul din argument
// daca nu e setat, se ia cel din json
// daca nu avem titlul nici in JSOn se ia titlul de valoarea default
// idem pentru celelalte

// function afiseazaEroare(res, {_identificator, _titlu, _text, _imagine} = {}) {
function afiseazaEroare(
    res,
    _identificator,
    _titlu = "titlu default",
    _text = "text default",
    _imagine
) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });

    if (eroare) {
        let titlu = (_titlu = "titlu default"
            ? eroare.titlu || _titlu
            : _titlu);
        let text = (_text = "text default" ? eroare.text || _text : _text);
        let imagine = (_imagine = "imagine default"
            ? eroare.imagine || _imagine
            : _imagine);
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare.ejs", {
                titlu: titlu,
                text: text,
                imagine: imagine,
                optiuni: obGlobal.optiuniMeniu
            });
        } else {
            res.render("pagini/eroare.ejs", {
                titlu: titlu,
                text: text,
                imagine: imagine
            });
        }
    } else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare.ejs", {
            titlu: errDef.titlu,
            text: errDef.text,
            imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine
        });
    }
}

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let vectorCale = caleScss.split("\\");
        let numeFisierExt = vectorCale[vectorCale.length - 1];
        let numeFis = numeFisierExt.split(".")[0];
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(obGlobal.folderScss, caleScss);
    }

    if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(obGlobal.folderCss, caleCss);
    }

    let vectorCale = caleCss.split("\\");
    let numeFisCss = vectorCale[vectorCale.length - 1];

    let data_curenta = new Date();
    let numeBackup =
        numeFisCss.split(".")[0] +
        "_" +
        data_curenta.toDateString().replace(" ", "_") +
        "_" +
        data_curenta.getHours() +
        "_" +
        data_curenta.getMinutes() +
        "_" +
        data_curenta.getSeconds() +
        ".css";

    fs.writeFileSync(path.join(obGlobal.folderBackup, numeBackup), "backup");

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeBackup));
    }

    rez = sass.compile(caleScss, { sourceMap: true });

    fs.writeFileSync(caleCss, rez.css);

    //console.log("Compilare SCSS", rez);
}

initErori();
initImagini();

vFisiere = fs.readdirSync(obGlobal.folderScss);
console.log("fisiere:");
console.log(vFisiere);

for (let numeFis of vFisiere) {
    if (path.extname(numeFis) === ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (event, filename) {
    console.log(event, filename);
    if (event === "change" || event === "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, filename);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log("Inregistrare:", campuriText);

        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) {//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })

                }
                else
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
            })


        }
        catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }




    });
    formular.on("field", function (nume, val) {  // 1 

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser = path.join(__dirname, "poze_uploadate", username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});


app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            req: req,
            res: res,
            parola: campuriText.parola
        }, function (u, obparam) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;

                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else {
                console.log("Eroare logare")
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        randeazaEroare(res, 403,)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
                conditiiAnd: [`parola='${parolaCriptata}'`]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    randeazaEroare(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    //actualizare sesiune
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume;
                    req.session.utilizator.prenume = campuriText.prenume;
                    req.session.utilizator.email = campuriText.email;
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                    res.locals.utilizator = req.session.utilizator;
                }


                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

            });


    });
});



/******************Administrare utilizatori */
app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows });
        });
    }
    else {
        renderError(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        renderError(res, 403);
    }
})




app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username, { res: res, token: req.params.token }, function (u, obparam) {
            AccesBD.getInstanta().update(
                {
                    tabel: "utilizatori",
                    campuri: { confirmat_mail: 'true' },
                    conditiiAnd: [`cod='${obparam.token}'`]
                },
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        afisareEroare(res, 3);
                    }
                    else {
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        renderError(res, 2);
    }
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
                else {
                    afiseazaEroare(res);
                }
            }
            else {
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module")) {
            afiseazaEroare(res, 404);
        } else {
            afiseazaEroare(res);
        }
    }
});
app.listen(8080);

console.log("Serverul a pornit!");
