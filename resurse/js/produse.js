window.onload = function() {
    
    document.getElementById("filtrare").onclick = function () {

        // inputs
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let val_greutate;

        let greutate = document.getElementsByName("gr_rad");
        for(let r of greutate){
            if(r.checked){
                val_greutate = r.value;
                break;
            }
        }
        if(val_greutate != "toate"){
            [gr_a, gr_b] = val_greutate.split(":");
            var gr_a = parseInt(gr_a);
            var gr_b = parseInt(gr_b);
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_dest = document.getElementById("inp-dest").value;

        let val_categ = document.getElementById("inp-categorie").value;

        let val_cert = [];

        let certificari = document.getElementsByName("certificare");

        for(let r of certificari){
            if(r.checked){
                val_cert.push(r.value);
            }
        }

        var produse = document.getElementsByClassName("produs");

        
        for (prod of produse){
            prod.style.display = "none";

            // valori produse
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let pret = prod.getElementsByClassName("val-pret")[0].innerHTML;
            let destinatie = prod.getElementsByClassName("val-dest")[0].innerHTML.toLowerCase();
            let greutate = prod.getElementsByClassName("val-greutate")[0].innerHTML;
            let certificare = prod.getElementsByClassName("val-cert")[0].innerHTML;
            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            pret = parseInt(pret);
            let cond_nume = (nume.startsWith(val_nume));
            let cond_pret = (pret >= val_pret);
            let cond_dest = (destinatie == val_dest || val_dest == "oricare");
            let cond_greutate = (val_greutate == "toate" || (gr_a <= greutate && greutate < gr_b));
            let cond_cert = (val_cert == "oricare");

            for(let cert of val_cert){
                if(certificare.includes(cert)){
                    cond_cert = true;
                    break;
                }
            }

            let cond_categ = (val_categ == "toate" || categorie == val_categ);

            if(cond_nume && cond_greutate && cond_pret && cond_categ && cond_dest && cond_cert)
                prod.style.display = "block";

        }
    }

    document.getElementById("resetare").onclick = function () {

        document.getElementById("inp-nume").value = ""; 
        document.getElementById("inp-pret").value = 0;
        document.getElementById("inp-dest").value = "oricare";
        document.getElementById("inp-categorie").value = "toate";
        document.getElementsByName("gr_rad")[0].checked = false;
        document.getElementsByName("gr_rad")[1].checked = false;
        document.getElementsByName("gr_rad")[2].checked = false;
        document.getElementsByName("gr_rad")[3].checked = true;
        document.getElementsByName("certificare")[0].checked = false;
        document.getElementsByName("certificare")[1].checked = false;
        document.getElementsByName("certificare")[2].checked = true;

        var produse = document.getElementsByClassName("produs");
        for (prod of produse){
            prod.style.display = "block";
        }

    }

    function sortare (semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse= Array.from(produse);
        v_produse.sort(function (a,b){
            let pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a==pret_b){
                let nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn*nume_a.localeCompare(nume_b);
            }
            return semn*(pret_a-pret_b);
        });
        for(let prod of v_produse){
            prod.parentElement.appendChild(prod);
        }
    }
    document.getElementById("sortCrescNume").onclick=function(){
        sortare(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sortare(-1);
    }
}

function getSelectedValue() {
    var selectedValue = document.getElementById("inp-pret").value;
    document.getElementById("val_select").textContent = "(" + selectedValue + ")";
}