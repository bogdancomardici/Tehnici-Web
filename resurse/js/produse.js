window.addEventListener("load", function () {

    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];      //["3","1","10","4","2"]

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    //----------- adaugare date in cosul virtual (din localStorage)
    let checkboxuri= document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            if( this.checked){
                iduriProduse.push(this.value)
            }
            else{
                let poz= iduriProduse.indexOf(this.value);
                if(poz != -1){
                    iduriProduse.splice(poz,1);
                }
            }

            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }
        
    }


    document.getElementById("inp-dest").value = "oricare";

    document.getElementById("filtrare").onclick = function () {

        // inputs
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let val_greutate;

        let greutate = document.getElementsByName("gr_rad");
        for (let r of greutate) {
            if (r.checked) {
                val_greutate = r.value;
                break;
            }
        }
        if (val_greutate != "toate") {
            [gr_a, gr_b] = val_greutate.split(":");
            var gr_a = parseInt(gr_a);
            var gr_b = parseInt(gr_b);
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_dest = document.getElementById("inp-dest").value;

        let val_categ = document.getElementById("inp-categorie").value;

        let val_cert = [];

        let certificari = document.getElementsByName("certificare");

        for (let r of certificari) {
            if (r.checked) {
                val_cert.push(r.value);
            }
        }

        let val_descriere = document.getElementById("inp-descriere").value.toLowerCase();

        let val_culori = getSelectValues(document.getElementById("inp-culoare"));

        let val_showroom;

        let showroom = document.getElementsByName("s_rad");
        for (let r of showroom) {
            if (r.checked) {
                val_showroom = r.value;
                break;
            }
        }

        if (checkInputs() == true) {
            var produse = document.getElementsByClassName("produs");


            for (prod of produse) {
                prod.style.display = "none";

                // valori produse
                let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
                let pret = prod.getElementsByClassName("val-pret")[0].innerHTML;
                let destinatie = prod.getElementsByClassName("val-dest")[0].innerHTML.toLowerCase();
                let greutate = prod.getElementsByClassName("val-greutate")[0].innerHTML;
                let certificare = prod.getElementsByClassName("val-cert")[0].innerHTML;
                let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;
                let descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
                let culoare = prod.getElementsByClassName("val-culoare")[0].innerHTML.toLowerCase();
                let showroom = prod.getElementsByClassName("val-showroom")[0].innerHTML.toLowerCase();

                pret = parseInt(pret);

                let cond_nume = (nume.startsWith(val_nume));
                let cond_pret = (pret >= val_pret);
                let cond_dest = (destinatie == val_dest || val_dest == "oricare");
                let cond_greutate = (val_greutate == "toate" || (gr_a <= greutate && greutate < gr_b));
                let cond_cert = (val_cert == "oricare");
                let cond_descriere = (descriere.includes(val_descriere));
                let cond_culoare = (val_culori.includes(culoare) || val_culori.includes("oricare"));
                let cond_showroom = (val_showroom == "toate" || showroom == val_showroom);
                for (let cert of val_cert) {
                    if (certificare.includes(cert)) {
                        cond_cert = true;
                        break;
                    }
                }

                let cond_categ = (val_categ == "toate" || categorie == val_categ);

                if (cond_nume && cond_greutate && cond_pret && cond_categ && cond_dest && cond_cert && cond_descriere && cond_culoare && cond_showroom)
                    prod.style.display = "block";

            }

        }
    }

    document.getElementById("resetare").onclick = function () {

        if (confirm("Sunteti sigur ca doriti sa resetati filtrele?") == true) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = 0;
            document.getElementById("inp-dest").value = "oricare";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementsByName("gr_rad")[0].checked = false;
            document.getElementsByName("gr_rad")[1].checked = false;
            document.getElementsByName("gr_rad")[2].checked = false;
            document.getElementsByName("gr_rad")[3].checked = true;
            document.getElementsByName("certificare")[0].checked = false;
            document.getElementsByName("certificare")[0].style.backgroundColor = "transparent";
            document.getElementsByName("certificare")[1].checked = false;
            document.getElementsByName("certificare")[1].style.backgroundColor = "transparent";
            document.getElementsByName("certificare")[2].checked = true;
            document.getElementsByName("certificare")[2].style.backgroundColor = "var(--culoare_principala)";

            document.getElementById("inp-descriere").value = "";

            document.getElementsByName("s_rad")[0].checked = false;
            document.getElementsByName("s_rad")[1].checked = false;
            document.getElementsByName("s_rad")[2].checked = true;

            document.getElementById("inp-descriere").classList.remove("is-valid");
            document.getElementById("inp-descriere").classList.remove("is-invalid");
            
            resetSelectValues(document.getElementById("inp-culoare"));

            resetSortare();

            for (let p of document.getElementsByClassName("produs"))
                p.style.display = "block";


        }
    }

    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                let dest_a = a.getElementsByClassName("val-dest")[0].innerHTML;
                let dest_b = b.getElementsByClassName("val-dest")[0].innerHTML;
                return semn * dest_a.localeCompare(dest_b);
            }
            return semn * (pret_a - pret_b);
        });
        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    function resetSortare() {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let id_a = parseInt(a.getElementsByClassName("val-id")[0].innerHTML);
            let id_b = parseInt(b.getElementsByClassName("val-id")[0].innerHTML);

            return id_a - id_b;

        });
        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function () {
        sortare(1);
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sortare(-1);
    }

    document.getElementById("calculare").onclick = function () {

        let rez_anterior = document.getElementById("rez");
        if (rez_anterior)
            rez_anterior.remove();

        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);

        let s = 0;
        let n = 0;

        for (let p of v_produse) {
            if (p.getElementsByClassName("select-cos")[0].checked) {
                n++;
                s += parseFloat(p.getElementsByClassName("val-pret")[0].innerHTML);
            }

        }

        if (n != 0) {
            let m = s / n;
            rez = document.createElement("div");
            rez.innerHTML = m;
            rez.style.position = "fixed";
            rez.style.top = "50%";
            rez.style.left = "45%";
            rez.style.width = "10%";
            rez.style.textAlign = "center";
            rez.style.backgroundColor = "lightgray";
            rez.style.border = "1px solid gray";
            rez.style.borderRadius = "10px"; // Rounded border
            rez.style.fontSize = "3em";
            rez.style.padding = "0.2em";
            rez.style.zIndex = "10";
            rez.id = "rez";
            document.getElementById("calc").appendChild(rez);

            setTimeout("document.getElementById('rez').remove()", 2000);

        }
        else {
            alert("Nu ati selectat niciun produs!");
        }

    }

    function getSelectValues(select) {
        var result = [];
        var options = select && select.options;
        var opt;

        for (var i = 0, iLen = options.length; i < iLen; i++) {
            opt = options[i];

            if (opt.selected) {
                result.push(opt.value || opt.text);
            }
        }
        return result;
    }

    function resetSelectValues(select) {
        var options = select && select.options;
        var opt;

        for (var i = 0, iLen = options.length; i < iLen; i++) {
            opt = options[i];

            if (opt.value == "oricare") {
                opt.selected = true;
            }
            else if (opt.selected) {
                opt.selected = false;
            }
        }


    }

    function isAlphanumeric(str) {
        return /^[a-zA-Z0-9]+$/.test(str);
    }

    function checkInputs() {
        // nume valid

        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        if (!isAlphanumeric(val_nume) && val_nume != "") {
            alert("Numele produsului trebuie sa contina doar litere si cifre!");
            return false;
        }

        // certificari valide
        let val_cert = [];

        let certificari = document.getElementsByName("certificare");

        for (let r of certificari) {
            if (r.checked) {
                val_cert.push(r.value);
            }
        }

        if (val_cert.length == 0) {
            alert("Trebuie selectata cel putin o certificare!");
            return false;
        }

        // culori valide

        let val_culori = getSelectValues(document.getElementById("inp-culoare"));
        if (val_culori.length == 0) {
            alert("Trebuie selectata cel putin o culoare!");
            return false;
        }

        // destinatie valida

        let val_dest = document.getElementById("inp-dest").value;
        if (val_dest == "") {
            alert("Destinatia trebuie completata!");
            return false;
        }

        // descriere valida

        let descriere = document.getElementById("inp-descriere");
        if (descriere.classList.contains("is-invalid")) {
            alert("Descrierea trebuie sa contina doar litere si cifre!");
            return false;
        }


        return true;

    }

    var inputField = document.getElementById("inp-descriere");

    inputField.addEventListener("input", function () {
        var val_descriere = inputField.value.toLowerCase();


        if (!isAlphanumeric(val_descriere) && val_descriere !== "") {
            if (!inputField.classList.contains("is-invalid")) {
                inputField.classList.add("is-invalid");
            }
        } else {
            inputField.classList.add("is-valid");
            inputField.classList.remove("is-invalid");
        }
    });

    inputField.addEventListener("focusout", function () {
        var val_descriere = inputField.value.toLowerCase();
        if (val_descriere == "") {
            inputField.classList.remove("is-valid");
            inputField.classList.remove("is-invalid");
        }
    });

    var cert_dot = document.getElementById("cert-dot");
    var cert_ece = document.getElementById("cert-ece");
    var cert_oricare = document.getElementById("cert-oricare");

    if (cert_dot.checked) {
        cert_dot.style.backgroundColor = "var(--culoare_principala)"
    }
    else {
        cert_dot.style.backgroundColor = "transparent"
    }

    if (cert_ece.checked) {
        cert_ece.style.backgroundColor = "var(--culoare_principala)"
    }
    else {
        cert_ece.style.backgroundColor = "transparent"
    }

    if (cert_oricare.checked) {
        cert_oricare.style.backgroundColor = "var(--culoare_principala)"
    }
    else {
        cert_oricare.style.backgroundColor = "transparent"
    }

    cert_dot.addEventListener("click", function () {
        if (cert_dot.checked) {
            cert_dot.style.backgroundColor = "var(--culoare_principala)"
        }
        else {
            cert_dot.style.backgroundColor = "transparent"
        }
    });

    cert_ece.addEventListener("click", function () {
        if (cert_ece.checked) {
            cert_ece.style.backgroundColor = "var(--culoare_principala)"
        }
        else {
            cert_ece.style.backgroundColor = "transparent"
        }
    });

    cert_oricare.addEventListener("click", function () {
        if (cert_oricare.checked) {
            cert_oricare.style.backgroundColor = "var(--culoare_principala)"
        }
        else {
            cert_oricare.style.backgroundColor = "transparent"
        }
    });
});

window.onkeydown = function (e) {
    if (e.key == 'c' && e.altKey) {
        document.getElementById("calculare").click();
    }

}
function getSelectedValue() {
    var selectedValue = document.getElementById("inp-pret").value;
    document.getElementById("val_select").textContent = "(" + selectedValue + ")";
}

