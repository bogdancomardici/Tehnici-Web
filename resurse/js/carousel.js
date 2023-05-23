window.onload = function () {
    var imagini = document.getElementsByClassName("imagine_produs");
    var array_imagini = Array.from(imagini);

    var nume = document.getElementsByClassName("nume_produs");
    var array_nume = Array.from(nume);

    var descriere = document.getElementsByClassName("descriere_produs");
    var array_descriere = Array.from(descriere);

    for(var i = 0; i < array_imagini.length; i++){
        array_imagini[i] = array_imagini[i].innerHTML;
        array_nume[i] = array_nume[i].innerHTML;
        array_descriere[i] = array_descriere[i].innerHTML;
    }

    function schimba_imaginile(){
        
        // generate 5 random numbers between 0 and len(array_imagini)
        var random_numbers = [];
        while(random_numbers.length < 5){
            var random_number = Math.floor(Math.random() * array_imagini.length);
            if(random_numbers.indexOf(random_number) === -1) random_numbers.push(random_number);
        }

        // change the images

        for(var i = 0; i < 5; i++){
            var img = document.getElementById("imagine_carousel" + i);
            var desc = document.getElementById("descriere_carousel" + i);
            var nume = document.getElementById("nume_carousel" + i);

            desc.innerHTML = array_descriere[random_numbers[i]];
            nume.innerHTML = array_nume[random_numbers[i]];
            img.src = array_imagini[random_numbers[i]];
        }
    }

    setInterval(schimba_imaginile, 15000);

}