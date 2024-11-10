let filmsButton = document.querySelector('.films-button');
filmsButton.addEventListener('click', () => showFilms(), false);

let tvButton = document.querySelector('.tv-button');
tvButton.addEventListener('click', () => showTV(), false);


let films = document.querySelector('.films')
let tv = document.querySelector('.tv')

function showFilms() {

    // films.style.display = 'block';
    // tv.style.display = 'none';
    films.style.opacity = '1';
    tv.style.opacity = '0';
    films.style.zIndex = '1';
    tv.style.zIndex = '0';

    filmsButton.style.color = "rgb(221, 179, 42)";
    filmsButton.style.boxShadow = "0 0 1rem 0 rgb(221, 179, 42)";
    tvButton.style.color = "white";
    tvButton.style.boxShadow = "0 0 1rem 0 white";
}

function showTV() {
    // films.style.display = 'none';
    // tv.style.display = 'block';
    films.style.opacity = '0';
    tv.style.opacity = '1';
    films.style.zIndex = '0';
    tv.style.zIndex = '1';

    tvButton.style.color = "rgb(221, 179, 42)";
    tvButton.style.boxShadow = "0 0 1rem 0 rgb(221, 179, 42)";
    filmsButton.style.color = "white";
    filmsButton.style.boxShadow = "0 0 1rem 0 white";
}