const express = require("express");

app = express();

console.log("Folder proiect:", __dirname);

app.use("/resurse", express.static(__dirname + "/resurse"));
app.get("/ceva", function(req, res){
    res.send("altceva");
});

app.get(["/index", "/", "/home"], function(req, res){
    console.log(req.ip);
    res.render("pagini/index.ejs", {ip: req.ip});
    
});

app.get("/despre", function(req, res){
    res.render("pagini/despre.ejs");
});

app.listen(8080);

console.log("Serverul a pornit!");