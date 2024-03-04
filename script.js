const toggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");
const items = document.querySelectorAll(".item");

/* Toggle mobile menu */
function toggleMenu() {
    if (menu.classList.contains("active")) {
        menu.classList.remove("active");
        toggle.querySelector("a").innerHTML = "<i class='fas fa-bars'></i>";
    } else {
        menu.classList.add("active");
        toggle.querySelector("a").innerHTML = "<i class='fas fa-times'></i>";
    }
}

/* Activate Submenu */
function toggleItem() {
    if (this.classList.contains("submenu-active")) {
        this.classList.remove("submenu-active");
    } else if (menu.querySelector(".submenu-active")) {
        menu.querySelector(".submenu-active").classList.remove("submenu-active");
        this.classList.add("submenu-active");
    } else {
        this.classList.add("submenu-active");
    }
}

/* Close Submenu From Anywhere */
function closeSubmenu(e) {
    if (menu.querySelector(".submenu-active")) {
        let isClickInside = menu
            .querySelector(".submenu-active")
            .contains(e.target);

        if (!isClickInside && menu.querySelector(".submenu-active")) {
            menu.querySelector(".submenu-active").classList.remove("submenu-active");
        }
    }
}
/* Event Listeners */
toggle.addEventListener("click", toggleMenu, false);
for (let item of items) {
    if (item.querySelector(".submenu")) {
        item.addEventListener("click", toggleItem, false);
    }
    item.addEventListener("keypress", toggleItem, false);
}
document.addEventListener("click", closeSubmenu, false);


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