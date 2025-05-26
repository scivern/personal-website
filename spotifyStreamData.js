function combineFiles(ev) {

    // Stop submit button from refreshing page
    ev.preventDefault()

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

    let files = ev.target.uploadFile.files;

    // Abort if there were no files selected
    if (!files.length) {
        alert("No files selected.");
        location.reload();
    };

    // Checks if files are of the accepted type (endsong_X)
    for (file of files) {
        // if (file.name.substr(0, 8) != "endsong_") {
        if (file.name.substr(0, 24) != "Streaming_History_Audio_") {
            alert("Only select files with prefix 'endsong_'");
            location.reload();
        }
    }

    document.querySelector('.spotify-data-heading').style.display = 'none';
    uploadForm.style.display = 'none';
    document.getElementById('importAndProcessingHeader').style.display = 'block';

    // if (typeof graph == 'undefined') {console.log("df");graph.destroy();}
    // let files = ev.currentTarget.files;
    
    let readers = [];

    

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
            // console.log(document.getElementById('importProgress'))
            // document.getElementById('importProgress').value = values.length/i *100;
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
            result += "<li><input style='margin-right: 0.3rem;' type='checkbox' id='" + item + "' value='" + item + "'>" + item + "</li>";
        })
        document.getElementById("artistsList").innerHTML = result;

        let streamLengthValue = 30000;
        let truncateResults = 30;
        let checkedArtists = [];
        cleaningAndDisplaying(combinedJson, streamLengthValue, truncateResults, checkedArtists);

    });
}



function cleaningAndDisplaying(combinedJson, streamLengthValue, truncateResults, checkedArtists) {

    let cleanedData = dataCleaner(combinedJson, streamLengthValue, checkedArtists);

    chartScript(cleanedData, truncateResults);

    streamLengthAndArtistExcludeForm.style.display = 'block';
    document.querySelector('.chart-selector-buttons').style.display = 'block';
    document.getElementById('processingText').style.display = 'none'; 

}



const arrayColumn = (arr, n) => arr.map(x => x[n]);



function dataCleaner(data, streamLengthValue, checkedArtists) {

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
        return entry["ms_played"] < streamLengthValue || entry['master_metadata_album_artist_name'] === null || checkedArtists.includes(entry['master_metadata_album_artist_name']);
    }

    function cleanerSlice(uniqueArray, sliceLower, sliceUpper) {

        let currentEntry = entry['ts'].slice(sliceLower, sliceUpper);
        if (arrayColumn(uniqueArray, 0).includes(currentEntry)) {
            ++uniqueArray[arrayColumn(uniqueArray, 0).indexOf(currentEntry)][1];
            return uniqueArray;
        }
        uniqueArray.push([currentEntry, 1]);
        return uniqueArray;
    }

    function cleanerNoSlice(uniqueObject, param) {
        currentSubentry = entry[param]
        uniqueObject[currentSubentry] === undefined ? uniqueObject[currentSubentry] = 1 : ++uniqueObject[currentSubentry]
        return uniqueObject
    }

    function cleanerNoSliceSongs(uniqueObject, param) {
        currentSubentry = entry[param]
        if (uniqueObject[currentSubentry] === undefined) {
            uniqueObject[currentSubentry] = { "Artist": entry['master_metadata_album_artist_name'], "Streams": 1}
        } else {
            uniqueObject[currentSubentry]["Streams"] += 1
        }
        // uniqueObject[currentSubentry] === undefined ? uniqueObject[currentSubentry] = {
        //     "Track Name":entry['master_metadata_track_name'], "Streams":1} : ++uniqueObject[currentSubentry].Streams
        return uniqueObject
    }

    function dataSorter(uniqueObject) {
        let sortedObject = [];
        for (entry in uniqueObject) {
            sortedObject.push([entry, uniqueObject[entry]])
        }
        sortedObject.sort((a, b) => b[1] - a[1])
        return sortedObject
    }

    function dataSorterSongs(uniqueObject) {
        let sortedObject = [];
        for (entry in uniqueObject) {
            sortedObject.push([entry, uniqueObject[entry]["Artist"], uniqueObject[entry]["Streams"]])
        }
        sortedObject.sort((a, b) => b[2] - a[2]);
        return sortedObject
    }


    let startTime = performance.now();

    for (entry of data) {

        if (cleanerTimeAndArtist(entry)) { continue; }
        uniqueYears = cleanerSlice(uniqueYears, 0, 4);
        uniqueMonths = cleanerSlice(uniqueMonths, 5, 7);
        uniqueTimes = cleanerSlice(uniqueTimes, 11, 13);
        uniqueArtists = cleanerNoSlice(uniqueArtists, 'master_metadata_album_artist_name');
        uniqueSongs = cleanerNoSliceSongs(uniqueSongs, 'master_metadata_track_name');
    }

    let endTime = performance.now();
    console.log("Processing Time: " + (endTime - startTime) / 1000 + " secs");

    //Final sorting of sub-data
    uniqueYears = uniqueYears.sort((a, b) => a[0] - b[0]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (let i = 0; i < 12; i++) { uniqueMonths[i][0] = months[i]; }
    uniqueTimes[0][0] = "Midnight";
    uniqueArtists = dataSorter(uniqueArtists)
    uniqueSongs = dataSorterSongs(uniqueSongs)

    return [uniqueArtists, uniqueSongs, uniqueYears, uniqueMonths, uniqueTimes];
}




function chartScript(cleanedData, truncateResults) {
    document.getElementById('importAndProcessingHeader').style.display = 'none';
    document.querySelector('#graphsDiv').style.display = 'block';
    let maxLabelLength = 21;
    const chartIds = ["artists-chart", "songs-chart", "years-chart", "months-chart", "times-chart"];
    for (let i = 0; i < chartIds.length; i++) {
        const chartExist = Chart.getChart(chartIds[i]); // <canvas> id
        if (chartExist != undefined)
            chartExist.destroy();

        let toolTipLabels = arrayColumn(cleanedData[i], 1).slice(0, truncateResults);

        let myChart = document.getElementById(chartIds[i]).getContext("2d");
        let chart = new Chart(myChart, {
            type: "bar",
            data: {
                labels: arrayColumn(cleanedData[i], 0).slice(0, truncateResults),
                datasets: [{
                    data: i == 1 ? arrayColumn(cleanedData[i], 2).slice(0, truncateResults) : arrayColumn(cleanedData[i], 1).slice(0, truncateResults)
                }],
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: i < 2 ? 'y' : 'x',
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: 'true',
                            text: 'Number of Streams',
                            color: 'white',
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        title: {
                            display: 'true',
                            text: chartIds[i].slice(0, -6).toUpperCase(),
                            color: 'white'
                        },
                        ticks: {
                            color: 'white',
                            font: {
                                size: 12,
                                lineHeight: 0,// chart.chartArea.height/30;
                            },
                            callback: function (value) {
                                if (this.getLabelForValue(value).length > maxLabelLength) {
                                    return this.getLabelForValue(value).substr(0, maxLabelLength) + "...";
                                } else {
                                    return this.getLabelForValue(value);
                                }
                            }
                        },

                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: chartIds[i].toUpperCase(),
                        color: 'white'
                    },
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        intersect: false,
                        callbacks: {
                            title: (toolTipItem) => {
                                let title = toolTipItem[0].label;
                                return title;
                            },
                            label: (toolTipItem) => {
                                let label = toolTipItem.formattedValue
                                label == 0 ? label = "0" : label
                                return label;
                            },
                            footer: (toolTipItem) => {
                                let afterTitle;
                                if (i == 1) {
                                    afterTitle = toolTipLabels[toolTipItem[0].dataIndex];
                                }
                                return afterTitle;
                            },
                        },
                        titleColor: "#DDB32A"
                    },
                }
            }
        });
        if (i == 0 || i == 1) {
            chart.options.scales.y.ticks.font.size = chart.chartArea.height / truncateResults;
            chart.update();
        }

        if (i != 0) {
            document.querySelector("#" + chartIds[i]).style.display = 'none';
        }

    }

}



function streamLengthAndArtistsExtractor(values) {
    values.preventDefault();
    document.getElementById('processingText').style.display = 'inline'; 
    
    setTimeout(() => {
        let streamLengthValue = values.target[0].value*1000;
        if (streamLengthValue == "") {streamLengthValue = 30000;}

        let truncateResults = values.target[1].value;
        if (truncateResults == "") {truncateResults = 30;}
        
        artists = values.target;
        checkedArtists = [];
        for (artist of artists) {
            if (artist.checked == true) { checkedArtists.push(artist.value) }
        }

        cleaningAndDisplaying(combinedJson, streamLengthValue, truncateResults, checkedArtists)
    }, 0);
}



function artistListSearch() {
    // Declare variables
    let input, filter, li, a, i, txtValue;
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