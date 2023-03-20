const express = require("express");
const fs = require("fs");
app = express();
app.set("view engine", "ejs");

console.log("Folder proiect:", __dirname);

app.use("/resurse", express.static(__dirname + "/resurse"));
app.get("/ceva", function (req, res) {
    res.send("altceva");
});

app.get(["/index", "/", "/home"], function (req, res) {
    console.log(req.ip);
    res.render("pagini/index.ejs", { ip: req.ip });

});

app.get("/*", function (req, res) {
    res.render("pagini" + req.url, function (err, rezRandare) {
        if (err) {
            console.log(err);
            res.send("error");
        }
        else {
            console.log(rezRandare);
            res.send(rezRandare);
        }
    });
});

function initErori() {

    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    obErori = JSON.parse(continut);
}

app.listen(8080);

console.log("Serverul a pornit!");

