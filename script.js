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





// const galleryItem = document.getElementsByClassName("gallery-item");
// const lightBoxContainer = document.createElement("div");
// const lightBoxContent = document.createElement("div");
// const lightBoxImg = document.createElement("img");
// const lightBoxPrev = document.createElement("div");
// const lightBoxNext = document.createElement("div");

// lightBoxContainer.classList.add("lightbox");
// lightBoxContent.classList.add("lightbox-content");
// lightBoxPrev.classList.add("fa", "fa-angle-left", "lightbox-prev");
// lightBoxNext.classList.add("fa", "fa-angle-right", "lightbox-next");

// lightBoxContainer.appendChild(lightBoxContent);
// lightBoxContent.appendChild(lightBoxImg);
// lightBoxContent.appendChild(lightBoxPrev);
// lightBoxContent.appendChild(lightBoxNext);

// document.body.appendChild(lightBoxContainer);

// let index = 1;

// function showLightBox(n) {
//     if (n > galleryItem.length) {
//         index = 1;
//     } else if (n < 1) {
//         index = galleryItem.length;
//     }
//     let imageLocation = galleryItem[index - 1].children[0].getAttribute("src");
//     lightBoxImg.setAttribute("src", imageLocation);
// }

// function currentImage() {
//     lightBoxContainer.style.display = "block";

//     let imageIndex = parseInt(this.getAttribute("data-index"));
//     showLightBox(index = imageIndex);
// }
// for (let i = 0; i < galleryItem.length; i++) {
//     galleryItem[i].addEventListener("click", currentImage);
// }

// function slideImage(n) {
//     showLightBox(index += n);
// }
// function prevImage() {
//     slideImage(-1);
// }
// function nextImage() {
//     slideImage(1);
// }
// lightBoxPrev.addEventListener("click", prevImage);
// lightBoxNext.addEventListener("click", nextImage);

// function closeLightBox() {
//     if (this === event.target) {
//         lightBoxContainer.style.display = "none";
//     }
// }
// lightBoxContainer.addEventListener("click", closeLightBox);