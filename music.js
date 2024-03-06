let musicButtons = document.querySelector('.music-buttons').children;

let artistsButton = document.querySelector('.artists-button');
artistsButton.addEventListener('click', () => moveMusic("38.5rem", 0), false);

let songsButton = document.querySelector('.songs-button');
songsButton.addEventListener('click', () => moveMusic("0", 1), false);

let albumsButton = document.querySelector('.albums-button');
albumsButton.addEventListener('click', () => moveMusic("-38.5rem", 2), false);

function moveMusic(direction, buttonIndex) {
    document.querySelector('.music-grid-container').style.translate = direction + " 0px";

    for (let i = 0; i < musicButtons.length; i++) {
        if (i == buttonIndex) {
            musicButtons[i].style.color = "rgb(221, 179, 42)";
            musicButtons[i].style.boxShadow = "0 0 1rem 0 rgb(221, 179, 42)";

        } else {
            musicButtons[i].style.color = "white";
            musicButtons[i].style.boxShadow = "0 0 1rem 0 white";
        }
    }
}