console.log("Let's start Javascript!")

let currentSong = new Audio();
let songs;
let curFolder;
// Utility function to convert seconds to "mm:ss" format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {
    curFolder = folder;
    // Fetch HTML directory listing
    let a = await fetch(`/${folder}`);
    let response = await a.text();

    // Parse the HTML
    let div = document.createElement("div");
    div.innerHTML = response;

    // Get all anchor elements
    let as = div.getElementsByTagName('a');
    let songs = [];

    // Filter only .mp3 links
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    return songs;
}


const playmusic = (track, pause = false) => {
    currentSong.src = `/${curFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";   // show pause icon only if actually playing
    } else {
        play.src = "img/play.svg";    // otherwise show play icon
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            
                            <div class="info">
                                <div>${song.replaceAll("-", " ")}</div>
                                <div>Balaji</div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
        </li>`;
    }

    // Attach an Event Listener to an Each Song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, idx) => {
        e.addEventListener("click", element => {
            console.log(songs[idx]);
            playmusic(songs[idx]);
        })
    })
}

async function displayAlbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"
                                color="#000000" fill="none">
                                <circle cx="12" cy="12" r="12" fill="#58f858" />
                                <path fill="black"
                                    d="M12,1.25 C17.937,1.25 22.75,6.063 22.75,12 C22.75,17.937 17.937,22.75 12,22.75 C6.063,22.75 1.25,17.937 1.25,12 C1.25,6.063 6.063,1.25 12,1.25 Z M2.75,12 C2.75,17.109 6.891,21.25 12,21.25 C17.109,21.25 21.25,17.109 21.25,12 C21.25,6.891 17.109,2.75 12,2.75 C6.891,2.75 2.75,6.891 2.75,12 Z M9.956,15.386 C9.5,15.079 9.5,14.319 9.5,12.8 L9.5,11.2 C9.5,9.681 9.5,8.921 9.956,8.614 C10.411,8.307 11.035,8.646 12.281,9.326 L12.281,9.326 L13.75,10.126 C15.25,10.944 16,11.353 16,12 C16,12.647 15.25,13.056 13.75,13.874 L12.281,14.674 L12.281,14.674 C11.035,15.354 10.411,15.693 9.956,15.386 Z" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.Description}</p>
                    </div>`;
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
            playmusic(songs[0], false);  // Play the first song automatically
            }
        })
    })
}

async function main() {

    // Get the List of all Songs
    songs = await getsongs("songs/cs");
    console.log(songs);
    playmusic(songs[0], true);

    // Display All the albums on page
    displayAlbum()

    // Attach an Event Listener to Play,Prev and Next Buttons 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        } else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    // Listen for Time Update
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    })

    // Add Event Listener to Seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent * 100 + "%";
        currentSong.currentTime = percent * currentSong.duration;
    })

    // Add an Event Listener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";

    });

    // Add an Event Listener to Close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // Add Event Listener to prev
    previous.addEventListener("click", () => {
        console.log("Previous");
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // Add Event Listener to next
    next.addEventListener("click", () => {
        console.log("Next");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        } else {
            // Optionally, loop to first song:
            // playmusic(songs[0]);
            // Or just do nothing
            console.log("No next song available.");
        }
    })

    // Add an Event Listener to Volume Control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        console.log(e, e.target)
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add an Event Listener to Volume Icon
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    


}



main();


