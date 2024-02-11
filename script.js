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

function dataCleaner(data) {

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
    let files = ev.currentTarget.files;
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
        const arrayColumn = (arr, n) => arr.map(x => x[n]);
        const dataKey = arrayColumn(cleanedData[3].slice(10, 20),0);
        const dataVal = arrayColumn(cleanedData[3].slice(10, 20), 1);
        // console.log(dataKey,dataVal,cleanedData[3])
        // let dataa = {"11": 1, "12": 3, "1": 2}; 
        let myChart = document.getElementById("myChart").getContext("2d");

        let chart = new Chart(myChart, {
            type: "bar",
            data: {
                labels: dataKey,
                datasets: [{
                    // label: "bruh",
                    data: dataVal//(cleanedData[3].slice(50,55))[1]
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