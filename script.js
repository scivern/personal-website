function myFunction(imgs) {
    var expandImg = document.getElementById("expandedImg");
    var imgText = document.getElementById("imgtext");
    expandImg.src = imgs.src;
    imgText.innerHTML = imgs.alt;
    expandImg.parentElement.style.display = "block";
}

const arrayColumn = (arr, n) => arr.map(x => x[n]);

function dataCleaner(data) {

    let uniqueArtists = [];
    let uniqueSongs = [];
    let uniqueYears = [];
    let uniqueMonths = [["01", 0], ["02", 0], ["03", 0], ["04", 0], ["05", 0], ["06", 0],
                        ["07", 0], ["08", 0], ["09", 0], ["10", 0], ["11", 0], ["12", 0]];
    
    let uniqueTimes = [["00", 0], ["01", 0], ["02", 0], ["03", 0], ["04", 0], ["05", 0],
                        ["06", 0], ["07", 0], ["08", 0], ["09", 0], ["10", 0], ["11", 0],
                        ["12", 0], ["13", 0], ["14", 0], ["15", 0], ["16", 0], ["17", 0],
                        ["18", 0], ["19", 0], ["20", 0], ["21", 0], ["22", 0], ["23", 0]];

    for (entry of data) {
   
        if (entry["ms_played"] < 60000 || entry['master_metadata_album_artist_name'] === null) {
            continue;
        }

        if (arrayColumn(uniqueYears, 0).includes(entry['ts'].slice(0, 4))) {
            ++uniqueYears[arrayColumn(uniqueYears, 0).indexOf(entry['ts'].slice(0, 4))][1];

        } else {
            uniqueYears.push([entry['ts'].slice(0, 4), 1]);
        }
        
        if (arrayColumn(uniqueMonths, 0).includes(entry['ts'].slice(5, 7))) {
            ++uniqueMonths[arrayColumn(uniqueMonths, 0).indexOf(entry['ts'].slice(5, 7))][1];
        } 

        if (arrayColumn(uniqueTimes, 0).includes(entry['ts'].slice(11, 13))) {
            ++uniqueTimes[arrayColumn(uniqueTimes, 0).indexOf(entry['ts'].slice(11, 13))][1];
        } 
        
        if (arrayColumn(uniqueArtists, 0).includes(entry['master_metadata_album_artist_name'])) {
            ++uniqueArtists[arrayColumn(uniqueArtists, 0).indexOf(entry['master_metadata_album_artist_name'])][1];

        } else {
            uniqueArtists.push([entry['master_metadata_album_artist_name'], 1]);
        }

        if (arrayColumn(uniqueSongs, 0).includes(entry['master_metadata_track_name'])) {
            ++uniqueSongs[arrayColumn(uniqueSongs, 0).indexOf(entry['master_metadata_track_name'])][1];

        } else {
            uniqueSongs.push([entry['master_metadata_track_name'], 1]);
        }
       
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

        let cleanedData = dataCleaner(combinedJson);
    
        let myChart = document.getElementById("myChart").getContext("2d");

        let chart = new Chart(myChart, {
            type: "bar",
            data: {
                labels: arrayColumn(cleanedData[3], 0).slice(0, 20),
                datasets: [{
                    data: arrayColumn(cleanedData[3], 1).slice(0, 20)
                }],
            },
            options: {plugins: {legend: {display: false}}}
        });



    });
}