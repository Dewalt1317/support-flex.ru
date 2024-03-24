let audioObj = new Audio()
let buttonPlayPauseElement = document.querySelector(".buttonPlayPause")
let buttonVolumeElement = document.querySelector(".buttonVolume")
let VolumeLevelControlElement = document.querySelector(".volumeLevelControl")
let wrapVolumeButton = document.querySelector(".wrapVolumeButton")
let wrapVolumeLevelControl = document.querySelector(".wrapVolumeLevelControl")
let wrapVolume = document.querySelector(".wrapVolume")
let coverElement = document.querySelector(".cover")
let titleElement = document.querySelector(".title")
let artistAlbumElement = document.querySelector(".artist")
let listenersElement = document.querySelector(".listeners")
let playTimeInterval = setInterval(() => {}, 0)
let coverSrc = "https://support-flex.ru/src/image/Default%20cover.PNG"
let title = "Station - Support Flex"
let tracName = title.split(" - ")
let buttonPlayPauseLock = false
let volumeLevel = 1
let VolumeLevelNotMute = 1
let listeners = 0

VolumeLevelControlElement.addEventListener("mousemove", volumeLevelControl)
VolumeLevelControlElement.addEventListener("click", volumeLevelControl)
buttonPlayPauseElement.addEventListener("click", buttonPlayPause)
buttonVolumeElement.addEventListener("click", volume)
buttonVolumeElement.addEventListener("dblclick", volumeLevelComfort)

function buttonPlayPause() {
    if (buttonPlayPauseLock === false) {
        if (audioObj.paused === true) {
            play()
        } else {
            pause()
        }
    } else {
        console.log("Кнопка плей/пауза заблокирована")
    }
}

function rot() {
    if (audioObj.currentTime === 0) {
        buttonPlayPauseLock = true
        buttonPlayPauseElement.src = "/src/ico/load.svg"
        buttonPlayPauseElement.style.animation = "2s linear 0s normal none infinite running rotate"
    } else {
        buttonPlayPauseLock = false
        buttonPlayPauseElement.src = "/src/ico/pause.svg"
        clearInterval(playTimeInterval)
        buttonPlayPauseElement.style.animation = ""
    }
}

function pause() {
    audioObj.pause()
    audioObj = new Audio()
    buttonPlayPauseElement.src = "/src/ico/play.svg"

}

function play() {
    audioObj = new Audio(streamLink)
    audioObj.volume = volumeLevel
    audioObj.play()
    playTimeInterval = setInterval(rot, 100)
}

function volumeLevelComfort() {
    volumeLevel = 0.01
    audioObj.volume = volumeLevel
    VolumeLevelControlElement.value = volumeLevel * 100
    buttonVolumeElement.src = "/src/ico/audio.svg"
}

function volumeLevelControl() {
        volumeLevel = VolumeLevelControlElement.value / 100
        audioObj.volume = volumeLevel
        if (volumeLevel === 0) {
            buttonVolumeElement.src = "/src/ico/mute.svg"
            VolumeLevelNotMute = 0
        } else {
            buttonVolumeElement.src = "/src/ico/audio.svg"
        }
}

function volume(event) {
    switch (event){
        case "up":
            if (audioObj.volume < 0.95) {
                audioObj.volume = audioObj.volume + 0.05
                volumeLevel = audioObj.volume
                VolumeLevelControlElement.value = volumeLevel * 100
            } else if (audioObj.volume >= 0.95) {
                buttonVolumeElement.src = "/src/ico/audio.svg"
                audioObj.volume = 1
                volumeLevel = audioObj.volume
                VolumeLevelControlElement.value = volumeLevel * 100
            }
            break

        case "down":
            if (audioObj.volume > 0.05) {
                buttonVolumeElement.src = "/src/ico/mute.svg"
                audioObj.volume = audioObj.volume - 0.05
                volumeLevel = audioObj.volume
                VolumeLevelControlElement.value = volumeLevel * 100
            } else if (audioObj.volume <= 0.05) {
                buttonVolumeElement.src = "/src/ico/mute.svg"
                VolumeLevelNotMute = 0
                audioObj.volume = 0
                volumeLevel = audioObj.volume
                VolumeLevelControlElement.value = volumeLevel * 100
            }
            break

        case "mute":
            VolumeLevelNotMute = volumeLevel
            volumeLevel = 0
            audioObj.volume = volumeLevel
            VolumeLevelControlElement.value = 0
            buttonVolumeElement.src = "/src/ico/mute.svg"
            break

        default:
            if (audioObj.volume !== 0) {
                VolumeLevelNotMute = volumeLevel
                volumeLevel = 0
                audioObj.volume = volumeLevel
                VolumeLevelControlElement.value = 0
                buttonVolumeElement.src = "/src/ico/mute.svg"
            } else if (VolumeLevelNotMute !== 0) {
                volumeLevel = VolumeLevelNotMute
                audioObj.volume = volumeLevel
                VolumeLevelControlElement.value = volumeLevel * 100
                buttonVolumeElement.src = "/src/ico/audio.svg"
            }
            break
    }
}

function getTitle(data) {
    listeners = data["listeners"]
    listenersElement.textContent = "Слушатели: " + listeners
    if (title !== data["title"]) {
        if (data["cover"] === "off") {
            coverSrc = "https://support-flex.ru/src/image/Default%20cover.PNG"
        } else {
            coverSrc = data["cover"]
        }
        coverElement.src = coverSrc
        title = data["title"]
        tracName = title.split(" - ")
        titleElement.textContent = tracName[1].trim()
        artistAlbumElement.textContent = tracName[0].trim()
    }
}