function myFunction(imgs) {
    var expandImg = document.getElementById("expandedImg");
    var imgText = document.getElementById("imgtext");
    expandImg.src = imgs.src;
    imgText.innerHTML = imgs.alt;
    expandImg.parentElement.style.display = "block";
}

function dictionarySorter(dictionary) {

    var keyValues = []

    for (var key in dictionary) {
        keyValues.push([key, dictionary[key]])
    }
    keyValues.sort(function compare(kv1, kv2) {
        // This comparison function has 3 return cases:
        // - Negative number: kv1 should be placed BEFORE kv2
        // - Positive number: kv1 should be placed AFTER kv2
        // - Zero: they are equal, any order is ok between these 2 items
        return kv2[1] - kv1[1]
    })
    return keyValues;
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
    // console.log(uniqueYears,uniqueMonths,uniqueTimes,uniqueArtists, uniqueSongs);

    uniqueYears = uniqueYears.sort((a, b) => a[0] - b[0]);
    uniqueArtists =  uniqueArtists.sort ((a, b) => b[1] - a[1]);
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
    ev.preventDefault()
    // let files = ev.currentTarget.files;
    let files = ev.target.uploadFile.files;
    console.log(files)
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
        // const dataKey = arrayColumn(cleanedData[3].slice(10, 20),0);
        // const dataVal = arrayColumn(cleanedData[3].slice(10, 20), 1);
        // console.log(dataKey,dataVal,cleanedData[3])
        // let dataa = {"11": 1, "12": 3, "1": 2}; 
        let myChart = document.getElementById("myChart").getContext("2d");

        let chart = new Chart(myChart, {
            type: "bar",
            data: {
                labels: arrayColumn(cleanedData[3], 0).slice(0, 20),
                datasets: [{
                    label: "bruh",
                    data: arrayColumn(cleanedData[3], 1).slice(0, 20)//(cleanedData[3].slice(50,55))[1]
                }],
            },
            options: {}
        });



    });
}




/*function dataCleaner(data) {

    let uniqueArtists = {};
    let uniqueSongs = {};
    let uniqueYears = {};
    let uniqueMonths = {};
    let uniqueTimes = {};

    for (let stream in data) {

        if (data[stream]["ms_played"] < 60000 || data[stream]['master_metadata_album_artist_name'] === null) {
            continue;
        }

        if (data[stream]['ts'].slice(0, 4) in uniqueYears) {
            uniqueYears[data[stream]['ts'].slice(0, 4)] += 1;
        } else {
            uniqueYears[data[stream]['ts'].slice(0, 4)] = 1;
        }

        if (data[stream]['ts'].slice(5, 7) in uniqueMonths) {
            uniqueMonths[data[stream]['ts'].slice(5, 7)] += 1;
        } else {
            uniqueMonths[data[stream]['ts'].slice(5, 7)] = 1;
        }

        if (data[stream]['ts'].slice(11, 13) in uniqueTimes) {
            uniqueTimes[data[stream]['ts'].slice(11, 13)] += 1;
        } else {
            uniqueTimes[data[stream]['ts'].slice(11, 13)] = 1;
        }

        if (data[stream]['master_metadata_album_artist_name'] in uniqueArtists) {
            uniqueArtists[data[stream]['master_metadata_album_artist_name']] += 1;
        } else {
            uniqueArtists[data[stream]['master_metadata_album_artist_name']] = 1;
        }

        if (data[stream]['master_metadata_track_name'] in uniqueSongs) {
            uniqueSongs[data[stream]['master_metadata_track_name']] += 1;
        } else {
            uniqueSongs[data[stream]['master_metadata_track_name']] = 1;
        }

    }

    // uniqueYears = dictionarySorter(uniqueYears);
    // uniqueMonths = dictionarySorter(uniqueMonths);
    // uniqueTimes = dictionarySorter(uniqueTimes);
    uniqueArtists = dictionarySorter(uniqueArtists);
    uniqueSongs = dictionarySorter(uniqueSongs);

    return [uniqueYears, uniqueMonths, uniqueTimes, uniqueArtists, uniqueSongs];
}*/