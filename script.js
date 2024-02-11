function myFunction(imgs) {
    var expandImg = document.getElementById("expandedImg");
    var imgText = document.getElementById("imgtext");
    expandImg.src = imgs.src;
    imgText.innerHTML = imgs.alt;
    expandImg.parentElement.style.display = "block";
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
        // console.log(typeof combinedJson[0]["ts"])
        // console.log(combinedJson[0]["ts"]);
        dataCleaner(combinedJson);

    });
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
        }   else {
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
    console.log(uniqueSongs);
    // console.log(uniqueYears,uniqueMonths,uniqueTimes);
    console.log(data)
}

/*let myChart = document.getElementById("myChart").getContext("2d");

let chart = new Chart(myChart, {
    type: "bar",
    data: {
        labels: ["a", "b", "c"],
        datasets: [{
            label: 'bruh',
            data: [1, 2, 3]
        }],
    },
    options: {}
});*/