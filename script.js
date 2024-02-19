const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navMenu");
const navLink = document.querySelectorAll(".navLink");

hamburger.addEventListener("click", mobileMenu);
navLink.forEach(n => n.addEventListener("click", closeMenu));

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}


function myFunction(imgs) {
    var expandImg = document.getElementById("expandedImg");
    var imgText = document.getElementById("imgtext");
    expandImg.src = imgs.src;
    imgText.innerHTML = imgs.alt;
    expandImg.parentElement.style.display = "block";
}

/*function streamLengthChange(id) {

    id.preventDefault();
    let streamLengthValue = id.target.inputStreamLength.value;
    // console.log(streamLength);
    cleaningAndDisplaying(combinedJson, streamLengthValue, checkedArtists);
}

function artistCheckboxExtractor(values) {
    values.preventDefault();
    artists = values.target;
    checkedArtists = [];
    for (artist of artists) {
        if (artist.checked == true) {checkedArtists.push(artist.value)}
    }
    console.log(checkedArtists);
    console.log(streamLengthValue)
    streamLengthValue=60000;
    // console.log(streamLengthValue)
    cleaningAndDisplaying(combinedJson, streamLengthValue, checkedArtists);
}*/

function streamLengthAndArtistsExtractor(values){
    values.preventDefault();

    let streamLengthValue = values.target[0].value;
    
    artists = values.target;
    checkedArtists = [];
    for (artist of artists) {
        if (artist.checked == true) { checkedArtists.push(artist.value) }
    }
  
    // console.log(checkedArtists);
    // console.log(streamLengthValue);

    cleaningAndDisplaying(combinedJson, streamLengthValue, checkedArtists)
}

function cleaningAndDisplaying(combinedJson, streamLengthValue, checkedArtists) {
    // streamLengthVariable = streamLengthVariable;
    // console.log(streamLength);
    
    // console.log(uniqueArtistsCheckbox);

    let cleanedData = dataCleaner(combinedJson, streamLengthValue, checkedArtists);
   
    chartScript(cleanedData);
}

const arrayColumn = (arr, n) => arr.map(x => x[n]);

function dataCleaner(data, streamLengthValue, checkedArtists) {

    // let streamLength = 60000;
    // console.log(streamLengthValue, checkedArtists);
    let uniqueArtists = [];
    let uniqueSongs = [];
    let uniqueYears = [];
    let uniqueMonths = [["01", 0], ["02", 0], ["03", 0], ["04", 0], ["05", 0], ["06", 0],
                        ["07", 0], ["08", 0], ["09", 0], ["10", 0], ["11", 0], ["12", 0]];
    
    let uniqueTimes = [["00", 0], ["01", 0], ["02", 0], ["03", 0], ["04", 0], ["05", 0],
                        ["06", 0], ["07", 0], ["08", 0], ["09", 0], ["10", 0], ["11", 0],
                        ["12", 0], ["13", 0], ["14", 0], ["15", 0], ["16", 0], ["17", 0],
                        ["18", 0], ["19", 0], ["20", 0], ["21", 0], ["22", 0], ["23", 0]];

    function cleanerTimeAndArtist(entry) {
        return entry["ms_played"] < streamLengthValue || entry['master_metadata_album_artist_name'] === null || checkedArtists.includes(entry['master_metadata_album_artist_name']);}

    function cleanerSlice(uniqueArray, sliceLower, sliceUpper) {

        if (arrayColumn(uniqueArray, 0).includes(entry['ts'].slice(sliceLower, sliceUpper))) {
            ++uniqueArray[arrayColumn(uniqueArray, 0).indexOf(entry['ts'].slice(sliceLower, sliceUpper))][1];
            return uniqueArray;

        } else {
            uniqueArray.push([entry['ts'].slice(sliceLower, sliceUpper), 1]);
            return uniqueArray;
        }
    }

    function cleanerNoSlice(uniqueArray, param) {

        if (arrayColumn(uniqueArray, 0).includes(entry[param])) {
            ++uniqueArray[arrayColumn(uniqueArray, 0).indexOf(entry[param])][1];
            return uniqueArray;

        } else {
            uniqueArray.push([entry[param], 1]);
            return uniqueArray;
        }
    }

    for (entry of data) {
   
        if (cleanerTimeAndArtist(entry)) {continue;}
        uniqueYears = cleanerSlice(uniqueYears, 0, 4);
        uniqueMonths = cleanerSlice(uniqueMonths, 5, 7);
        uniqueTimes = cleanerSlice(uniqueTimes, 11, 13);
        uniqueArtists = cleanerNoSlice(uniqueArtists, 'master_metadata_album_artist_name');
        uniqueSongs = cleanerNoSlice(uniqueSongs, 'master_metadata_track_name');
       
    }

    //Final sorting of sub-data
    uniqueYears = uniqueYears.sort((a, b) => a[0] - b[0]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (let i = 0; i < 12; i++) {uniqueMonths[i][0] = months[i];}
    uniqueTimes[0][0] = "Midnight";
    uniqueArtists =  uniqueArtists.sort((a, b) => b[1] - a[1]);
    uniqueSongs = uniqueSongs.sort((a, b) => b[1] - a[1]);

    return [uniqueYears, uniqueMonths, uniqueTimes, uniqueArtists, uniqueSongs];
}

function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
        let fr = new FileReader();

        fr.onload = function () {
            resolve(JSON.parse(fr.result));
        };

        fr.onerror = function () {
            reject(fr);
        };

        fr.readAsText(file);
    });
}

function combineFiles(ev) {
    
    // stop submit button from refreshing page
    ev.preventDefault()
    // if (typeof graph == 'undefined') {console.log("df");graph.destroy();}
    // let files = ev.currentTarget.files;
    let files = ev.target.uploadFile.files;
    let readers = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        combinedJson = [];
        for (let i = 0; i < values.length; i++) {
            combinedJson = combinedJson.concat(values[i])
        }
        console.log("Files Uploaded and Combined");
        
        uniqueArtistsCheckbox = [];
        for (entry of combinedJson) {
            if (!uniqueArtistsCheckbox.includes(entry['master_metadata_album_artist_name'])) {
                uniqueArtistsCheckbox.push(entry['master_metadata_album_artist_name']);
            }
        }
        uniqueArtistsCheckbox.sort(Intl.Collator().compare);

        let result = "";
        uniqueArtistsCheckbox.forEach(function (item) {
            result += "<li><input type='checkbox' id="+item+" value='"+item+"'>" + item + "</li>";
        })
        document.getElementById("artistsList").innerHTML = result;

        let streamLengthValue = 60000;
        let checkedArtists = [];
        cleaningAndDisplaying(combinedJson, streamLengthValue, checkedArtists);
        
    });
}

function artistListSearch() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('search');
    filter = input.value.toUpperCase();
    ol = document.getElementById("artistsList");
    li = ol.getElementsByTagName('li');
    // console.log(ol,li)

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("input")[0];
        // console.log(a.value)
        txtValue = a.value//a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
            // console.log(txtValue)
        }
    }
}

function chartScript (cleanedData) {
    const chartExist = Chart.getChart("myChart"); // <canvas> id
    if (chartExist != undefined)
        chartExist.destroy(); 
    // if (typeof chart == 'undefined') { console.log("d") }
    let myChart = document.getElementById("myChart").getContext("2d");
    // if (typeof chart === 'undefined') {console.log("d")}
    // if (typeof poo === 'undefined') {console.log("D")}
    
    let chart = new Chart(myChart, {
        type: "bar",
        data: {
            labels: arrayColumn(cleanedData[3], 0).slice(0, 20),
            datasets: [{
                data: arrayColumn(cleanedData[3], 1).slice(0, 20)
            }],
        },
        options: { plugins: { legend: { display: false } } }
    });
    // chart.destroy()
    
    
}

