let bodyElement = document.querySelector("body")
let audioObj = new Audio()
let buttonAppleMusicElement = document.querySelector(".buttonAppleMusic")
let buttonAppleMusicWrapElement = document.querySelector(
  ".buttonAppleMusicWrap"
)
let buttonPlayPauseElement = document.querySelector(".buttonPlayPause")
let buttonVolumeElement = document.querySelector(".buttonVolume")
let VolumeLevelControlElement = document.querySelector(".volumeLevelControl")
let wrapVolumeButton = document.querySelector(".wrapVolumeButton")
let wrapVolumeLevelControl = document.querySelector(".wrapVolumeLevelControl")
let wrapVolume = document.querySelector(".wrapVolume")
let coverElement = document.querySelector(".cover")
let coverBackElement = document.querySelector(".coverBack")
let titleElement = document.querySelector(".title")
let artistAlbumElement = document.querySelector(".artist")
let titleBackElement = document.querySelector(".titleBack")
let artistAlbumBackElement = document.querySelector(".artistBack")
let listenersElement = document.querySelector(".listeners")
let playTimeInterval = setInterval(() => {}, 0)
let settingWrapElement = document.querySelector(".settingWrap")
let settingMenuListElement =
  settingWrapElement.querySelector(".settingMenuList")
let dataTitleSend = {}
let coverSrc = "https://support-flex.ru/src/image/Default%20cover.PNG"
let title = "Station - Support Flex"
let AppleMusicLink = "off"
let state = "off"
let tracName = title.split(" - ")
let buttonPlayPauseLock = false
let volumeLevelHideLock = true
let resizeOn = false
let volumeLevel = 1
let VolumeLevelNotMute = 1
let listeners = 0
let iteration = 0
let streamLink

wrapVolume.addEventListener("mouseleave", volumeLevelHide)
wrapVolumeButton.addEventListener("mouseenter", volumeLevelAppeared)
VolumeLevelControlElement.addEventListener("mousemove", volumeLevelControl)
VolumeLevelControlElement.addEventListener("click", volumeLevelControl)
buttonPlayPauseElement.addEventListener("click", buttonPlayPause)
buttonVolumeElement.addEventListener("click", volume)
buttonVolumeElement.addEventListener("dblclick", volumeLevelComfort)
buttonAppleMusicElement.addEventListener("click", AppleMusic)

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
    buttonPlayPauseElement.style.animation =
      "2s linear 0s normal none infinite running rotate"
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
  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    const audioOutputDevices = devices.filter(
      (device) => device.kind === "audiooutput"
    )
    if (audioOutputDevices[0]["deviceId"] !== "") {
      // Пользователь разрешил доступ к микрофону
      let cookie = getCookieData("audioDevice")
      if (cookie !== "") setAudioOutputDevice(audioObj, cookie)
      createCookie("audioDevice", cookie, 14)
    }
  })
  audioObj.play()
  playTimeInterval = setInterval(rot, 100)
}

function volumeLevelComfort() {
  volumeLevel = 0.01
  audioObj.volume = volumeLevel
  VolumeLevelControlElement.value = volumeLevel * 100
  buttonVolumeElement.src = "/src/ico/audio.svg"
}

function volume(event) {
  switch (event) {
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
  AppleMusicLink = data["link"]
  if (title !== data["title"]) {
    if (data["cover"] === "off") {
      coverSrc = "https://support-flex.ru/src/image/Default%20cover.PNG"
    } else {
      coverSrc = data["cover"]
    }
    Switch(coverSrc, coverElement, coverBackElement, "src")
    bodyElement.style.backgroundImage = "url(" + coverSrc + ")"
    title = data["title"]
    tracName = title.split(" - ")
    Switch(tracName[1].trim(), titleElement, titleBackElement, "text")
    Switch(
      tracName[0].trim(),
      artistAlbumElement,
      artistAlbumBackElement,
      "text"
    )
  }
  
  // Если трек недоступен на "AppleMusic"
  if (AppleMusicLink === "off") {
    if (!buttonAppleMusicWrapElement.classList.contains("buttonAppleMusicWrap--hide")) {
      buttonAppleMusicWrapElement.classList.add("buttonAppleMusicWrap--hide")
    }
  } else {
    buttonAppleMusicWrapElement.classList.remove("buttonAppleMusicWrap--hide")
  }

  if (data["status"] === "off") {
    off()
  } else {
    on()
  }
  resizeOn = false
}

function AppleMusic() {
  if (AppleMusicLink !== "off") {
    window.open(AppleMusicLink)
  }
}

function off() {
  state = "off"
  buttonPlayPauseLock = true
  buttonPlayPauseElement.src = "/src/ico/pause.svg"
}

function on() {
  if (state === "off") {
    state = "on"
    buttonPlayPauseLock = false
    buttonPlayPauseElement.src = "/src/ico/play.svg"
  }
}

function volumeLevelControl() {
  if (volumeLevelHideLock === true) {
    VolumeLevelControlElement.value = volumeLevel * 100
  } else {
    volumeLevel = VolumeLevelControlElement.value / 100
    audioObj.volume = volumeLevel
    if (volumeLevel === 0) {
      buttonVolumeElement.src = "/src/ico/mute.svg"
      VolumeLevelNotMute = 0
    } else {
      buttonVolumeElement.src = "/src/ico/audio.svg"
    }
  }
}

function volumeLevelHide() {
  volumeLevelHideLock = true
  wrapVolumeLevelControl.style.opacity = 0
  setTimeout(() => {
    wrapVolumeLevelControl.classList.toggle("wrapVolumeLevelControl__hiden")
  }, 500)
}

function volumeLevelAppeared() {
  volumeLevelHideLock = false
  wrapVolumeLevelControl.classList.toggle("wrapVolumeLevelControl__hiden")
  wrapVolumeLevelControl.style.opacity = 1
}

// Управление поведением текста в ".metaData"
function ticker(element) {
  let titleWidth = element.offsetWidth
  let containerWidth = document.querySelector(".metaData").offsetWidth
  let surplus = titleWidth - containerWidth
  let surplusPercent = (surplus / titleWidth) * 100
  element.style.setProperty("--surplus", "-" + surplusPercent + "%")
  let animationDuration = surplus / 100
  element.style.animationDuration = animationDuration + "s"

  if (titleWidth > containerWidth) {
    element.classList.add("anim_")
  } else {
    element.classList.remove("anim_")
  }
}

// Смена картинки и текста в ".metaData"
function Switch(data, elementOne, elementTwo, type) {
  if (iteration <= 2) {
    switchTwo()
  } else if (elementOne.style.opacity == 0) {
    switchOne()
  } else {
    switchTwo()
  }

  function switchOne() {
    if (type === "src") {
      elementOne.src = data
    } else if (type === "text") {
      elementOne.textContent = data
    }
    ticker(elementOne)
    elementTwo.classList.remove("anim_")
    elementOne.style.opacity = 1
    elementTwo.style.opacity = 0
    iteration++
  }

  function switchTwo() {
    if (type === "src") {
      elementTwo.src = data
    } else if (type === "text") {
      elementTwo.textContent = data
    }
    ticker(elementTwo)
    elementOne.classList.remove("anim_")
    elementOne.style.opacity = 0
    elementTwo.style.opacity = 1
    iteration++
  }
}

// Получим доступ ко всем выходным аудиоустройствам и добавим в селектор
function updateDeviceList() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("Перечисление устройств не поддерживается вашим браузером.")
    createPopUp(
      "message",
      "Ошибка",
      "Выбор аудио устройств не поддерживается вашим браузером.",
      null,
      null,
      null,
      "Ок",
      document.querySelector(".wrapPlayerBlock")
    )
    return
  }

  // Запрашиваем перечень устройств
  navigator.mediaDevices
    .enumerateDevices()
    .then(function (devices) {
      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput"
      )

      const deviceSelector = document.createElement("div")
      deviceSelector.classList.add("audioElementList")
      audioOutputDevices.forEach(function (device) {
        const option = document.createElement("div")
        option.classList.add("audioElement")
        option.id = device.deviceId
        option.textContent = device.label || `Устройство ${device.deviceId}`
        deviceSelector.appendChild(option)
      })

      // Добавляем селектор
      let Container = `<div class="selectAudio"></div>`
      createPopUp(
        "audio_select",
        "Выбор аудиоустройства",
        Container,
        null,
        null,
        null,
        "Ok",
        document.querySelector(".wrapPlayerBlock")
      )
      const selectorElement = document.querySelector(".selectAudio")
      selectorElement.appendChild(deviceSelector)
      if (getCookieData("audioDevice") !== "") {
        let element = document.querySelector("#default")
        element.classList.add("clicked")
        element.style.backgroundColor = "rgb(123 147 211)"
      } else {
        let element = document.querySelector("#" + getCookieData("audioDevice"))
        element.classList.add("clicked")
        element.style.backgroundColor = "rgb(123 147 211)"
      }
      // Обработчик изменения выбранного устройства
      deviceSelector.addEventListener("click", (event) => {
        const deviceId = event.target.id
        setAudioOutputDevice(audioObj, deviceId) // audioObj - это аудио элемент
        createCookie("audioDevice", deviceId, 14)
        let lastSelect = deviceSelector.querySelector(".clicked")
        if (lastSelect) {
          lastSelect.style.backgroundColor = ""
          lastSelect.classList.remove("clicked")
        }
        event.target.classList.add("clicked")
        event.target.style.backgroundColor = "rgb(123 147 211)"
      })
    })
    .catch(function (err) {
      console.log(err.name + ": " + err.message)
    })
}

// Установим аудиоустройство для output
function setAudioOutputDevice(audioElement, deviceId) {
  if (typeof audioElement.sinkId !== "undefined") {
    audioElement
      .setSinkId(deviceId)
      .then(() => {
        console.log(`Устройство вывода аудио изменено на: ${deviceId}`)
      })
      .catch((err) => {
        let errorMessage = err
        if (err.name === "SecurityError") {
          createPopUp(
            "message",
            "Ошибка",
            "Вы не дали разрешение на использование устройства вывода аудио.",
            null,
            null,
            null,
            "Ок",
            document.querySelector(".wrapPlayerBlock")
          )
          errorMessage = `Вы не дали разрешение на использование устройства вывода аудио.`
        }
        console.error(errorMessage)
      })
  } else {
    createPopUp(
      "message",
      "Ошибка",
      "Выбор аудио устройств не поддерживается вашим браузером.",
      null,
      null,
      null,
      "Ок",
      document.querySelector(".wrapPlayerBlock")
    )
    console.warn("Ваш браузер не поддерживает выбор устройств вывода аудио.")
  }
}

function getMedia() {
  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    const audioOutputDevices = devices.filter(
      (device) => device.kind === "audiooutput"
    )
    if (audioOutputDevices[0]["deviceId"] !== "") {
      // Пользователь разрешил доступ к микрофону
      updateDeviceList()
    } else {
      // Запрашиваем медиапоток, чтобы получить разрешение пользователя на доступ к устройствам
      createPopUp(
        "message",
        "Запрос доступа",
        "Для изменения аудио устройства, нужен доступ к медиаустройствам, слушать не будем, правда)",
        null,
        null,
        null,
        "Ок",
        document.querySelector(".wrapPlayerBlock")
      )
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Теперь у нас есть разрешение, списка устройств вывода будет доступен
          document.querySelector(".pop-up-wrapper").remove()
          updateDeviceList()
          // Сразу закрываем поток
          stream.getTracks().forEach((track) => track.stop())
        })
        .catch((error) => {
          navigator.mediaDevices.enumerateDevices().then(function (devices) {
            const audioOutputDevices = devices.filter(
              (device) => device.kind === "audiooutput"
            )
            if (audioOutputDevices[0]["deviceId"] !== "") {
              // Пользователь разрешил доступ к микрофону
              document.querySelector(".pop-up-wrapper").remove()
              updateDeviceList()
            } else {
              document.querySelector(".pop-up-wrapper").remove()
              console.error("Ошибка при получении медиапотока:", error)
              createPopUp(
                "message",
                "Ошибка",
                "Ошибка при получении медиапотока",
                null,
                null,
                null,
                "Ок",
                document.querySelector(".wrapPlayerBlock")
              )
            }
          })
        })
    }
  })
}
