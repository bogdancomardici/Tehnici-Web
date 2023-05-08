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

        let val_categ = document.getElementById("inp-categorie").value;

        var produse = document.getElementsByClassName("produs");

        
        for (prod of produse){
            prod.style.display = "none";

            // valori produse
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let greutate = prod.getElementsByClassName("val-greutate")[0].innerHTML;
            let pret = prod.getElementsByClassName("val-pret")[0].innerHTML;
            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            pret = parseInt(pret);
            let cond1 = (nume.startsWith(val_nume));
            let cond2 = (val_greutate == "toate" || (gr_a <= greutate && greutate < gr_b));
            let cond3 = (pret >= val_pret);
            let cond4 = (val_categ == "toate" || categorie == val_categ);

            if(cond1 && cond2 && cond3 && cond4)
                prod.style.display = "block";

        }
    }
}

function getSelectedValue() {
    var selectedValue = document.getElementById("inp-pret").value;
    document.getElementById("val_select").textContent = "(" + selectedValue + ")";
}