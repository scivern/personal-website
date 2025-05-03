// const redirectUri = "http://localhost:5500/spotifyUserData.html";
const redirectUri = "https://georgescannell.com/spotifyUserData.html";
 
const clientId = "69e77828294d4f13b0500d5a164f9ba7";

let accessToken = null;
let refreshToken = null;
var currentPlaylist = "";
var radioButtons = [];

const authEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

const scope = "user-read-private user-follow-read user-library-read user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";

document.addEventListener("DOMContentLoaded", onPageLoad, false);
document.querySelector(".login-button").addEventListener("click", () => requestAuthorization(), false)
document.querySelector(".get-saved-tracks-button").addEventListener("click", () => getSavedTracks(), false)
document.querySelector(".followed-concerts-button").addEventListener("click", () => getFollowedArtists(), false)

function onPageLoad(){

    //handle redirect from spotify auth
    if ( window.location.search.length > 0 ){
        handleRedirect();

    } else {
        accessToken = localStorage.getItem("accessToken");

        if (accessToken == null) {
            // show login page
            document.querySelector(".login").style.display = 'block';  

        } else {
            // show logged in page
            document.querySelector(".logged-in").style.display = 'block';  
            document.querySelector(".logout-button").addEventListener("click", () => logOut(), false)
   
            getUserData();
            // getFollowedArtists();
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirectUri);
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

async function generateCodeChallenge() {

    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

    const codeVerifier = randomString;
    const data = new TextEncoder().encode(codeVerifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);

    const codeChallengeBase64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    localStorage.setItem("codeVerifier", codeVerifier); //window.

    return codeChallengeBase64
}

async function requestAuthorization(){

    codeChallengeBase64 = await generateCodeChallenge();

    const authUrl = new URL(authEndpoint)
    const params = {
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        // state: ,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallengeBase64
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString(); 
}

async function fetchAccessToken(code){

    const codeVerifier = localStorage.getItem('codeVerifier');

    let response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        })
    });

    handleResponse(response);
}

async function refreshAccessToken(){
    
    refreshToken = localStorage.getItem('refreshToken')
    console.log(refreshToken)
    let response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        })
    });

    handleResponse(response);
}

async function handleResponse(response) {
    try {
        response = await response.json();
        console.log(response);
        if (response.access_token != undefined) {
            accessToken = response.access_token;
            localStorage.setItem("accessToken", accessToken);
        }
        if (response.refresh_token != undefined) {
            refreshToken = response.refresh_token;
            localStorage.setItem("refreshToken", refreshToken);
        }
        onPageLoad();
    } catch (error) {
        console.log(error);
        alert(error)
    }
}

function logOut() {
    localStorage.clear()
    window.location.href = redirectUri
}

async function apiCall(url) {
    const call = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + accessToken },
    });
    
    response = await call;

    if (response.status == "401") {
        refreshAccessToken();
        // apiCall(url);
    }

    try {
        return response.json()
    } catch(error) {        
        console.log(error);
        alert(error)
    }
}

async function getUserData() {

    data = await apiCall("https://api.spotify.com/v1/me")
    localStorage.setItem("userCountry", data.country)
    document.querySelector('.profile-pic').src = data.images[1].url
    document.querySelector('.logged-in-text').appendChild(document.createTextNode(data.display_name))
}

async function ticketmasterApi(url) {
    const call = await fetch(url, {
        method: "GET",
    })
    return await call.json();
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getFollowedArtists() {
    async function repeatGet(url, followedTotal = []) {

        followedObject = await apiCall(url)

        for (artist of followedObject.artists.items) { followedTotal.push(artist.name) }

        if (followedObject.artists.next != undefined) { await repeatGet(followedObject.artists.next, followedTotal) }
        
        return followedTotal
    }

    followedTotal = await repeatGet("https://api.spotify.com/v1/me/following?type=artist&limit=50")
    console.log(followedTotal);

    // let city = "London";
    // let radius = 100;
    let events = []
    let followedArtistShows = {}
    userCountry = localStorage.getItem("userCountry")
    for (i = 0; i < followedTotal.length; i++) {
        response = await ticketmasterApi("https://app.ticketmaster.com/discovery/v2/events.json?&size=20&apikey=dYtFUjzPcwSQU8GRUj4hRBfDaLkOLxql& \
        radius=0&countryCode=" + userCountry + "&keyword=" + followedTotal[i])//+ "&city=" + "d" + "&radius=" + radius
        // console.log(response);
        await sleep(200);
        if (response._embedded == undefined) {continue}

        document.querySelector(".followed-concerts-accordions").innerHTML += "<button class='accordion' id=" + followedTotal[i] + "-accordion >" + followedTotal[i] + "</button>"

        let table = document.createElement('table');
        table.className = ("panel")
        table.style = "border-spacing: 10px"
        row = table.insertRow();
        row.style = "color: rgb(221, 179, 42)"
        row.insertCell(0).appendChild(document.createTextNode("Name"))
        row.insertCell(1).appendChild(document.createTextNode("City"))
        row.insertCell(2).appendChild(document.createTextNode("Date"))
        
        // events = [];
        for (event of response._embedded.events) {
            // events.push({ "Name": event.name, "Venue": event._embedded.venues[0].city.name, "Date": event.dates.start.localDate, "Url": event.url});
            row = table.insertRow();
            let a = document.createElement('a'); a.href = event.url; a.target = "_blank"; a.style = "color: white; text-decoration: none"
            a.appendChild(document.createTextNode(event.name))
            row.insertCell(0).appendChild(a)
            row.insertCell(1).appendChild(document.createTextNode(event._embedded.venues[0].city.name))
            row.insertCell(2).appendChild(document.createTextNode(event.dates.start.localDate))
            
            
        }
        followedArtistShows[followedTotal[i]] = events
        document.querySelector(".followed-concerts-accordions").append(table)
    }   
    // console.log(followedArtistShows);

    var acc = document.querySelectorAll(".accordion");
    // var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("accordion-active");
            var panel = this.nextSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
    
    
    // return followedTotal;
}

async function getSavedTracks() {

    async function repeatGet(url, csvData = "sep=\t  \nTrack\tArtist\tAlbum\tDate-Time Added\tSpotify Link") {
        
        tracksObject = await apiCall(url);
       
        for (track of tracksObject.items) {
            csvData += "\n" + track.track.name + "\t" + track.track.artists[0].name + "\t" + track.track.album.name
            + "\t" + track.added_at + "\t" + track.track.external_urls.spotify;
        }
        
        if (tracksObject.next != undefined) { csvData = await repeatGet(tracksObject.next, csvData) }

        return csvData;
    }

    csvData = await repeatGet("https://api.spotify.com/v1/me/tracks?limit=50");

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8,' })
    const objUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', objUrl)
    link.setAttribute('download', 'File.csv')
    // link.textContent = 'Click to Download'

    document.querySelector('.download-tracks').append(link)
    link.click()
}
