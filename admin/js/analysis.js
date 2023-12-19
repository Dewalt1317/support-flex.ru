let titleIDElement = document.querySelector(".titleID")
let fileNameElement = document.querySelector(".fileNameInput")
let nameTrackElement = document.querySelector(".nameTrack")
let nameArtistElement = document.querySelector(".nameArtist")
let getElement = document.querySelector(".get")
let buttonGetWrapElement = document.querySelector(".buttonGetWrap")
let wrapContentElement = document.querySelector(".wrapContent")
let durationInputElement = document.querySelector(".durationInput")
let audioElement = document.querySelector("audio")
const $selectArtist = document.querySelector(".selectArtist")
const $selectCategory = document.querySelector(".selectCategory")
const $selectMood = document.querySelector(".selectMood")
let buttonSaveElement = document.querySelector(".buttonSave")
let buttonBack = document.querySelector(".back")
let buttonSkippedQueue = document.querySelector(".skippedQueue")
let buttonSkipElement = document.querySelector(".buttonSkip")
let treckID
let SRC
let Status

// Все поля для селектов
const $selectWrappers = document.querySelectorAll(".multiple_select_wrapper")

let dataSend = {}

buttonBack.addEventListener("click", ()=>{
  window.location.href = "/admin"
})
buttonSaveElement. addEventListener("click", save)
getElement.addEventListener("click", () => {
  get("get")
})
buttonSkippedQueue.addEventListener("click", () => {
  get("getSkipped")
})
buttonSkipElement.addEventListener("click", () => {
  dataSend ={"comand": "skip", "id": treckID}
  SendRequest("POST", "php/analysis.php", dataSend, (data)=>{
    data = JSON.parse(data)
    if (data["result"] === "skipOK"){
      Status = "skip"
      location.reload()
    }
  })
})
function get(comand) {
  dataSend["comand"] = comand
  SendRequest("POST", "php/analysis.php", dataSend, (data) => {
    data = JSON.parse(data)
    if (data["status"] === "absent"){
       switch (dataSend["comand"]){
         case "get":
           alert("В основной очереди нет треков для анализа")
           break

         case "getSkipped":
           alert("В очереди пропущенных нет треков для анализа")
           break
       }
    } else {
      buttonGetWrapElement.classList.add("_hide")
      wrapContentElement.classList.remove("_hide")
      Status = "get"
      let tracName = data["name"].replace(".mp3", "")
      tracName = tracName.split(" - ")
      nameTrackElement.value = tracName[1].trim()
      nameArtistElement.value = tracName[0].trim()
      SRC = data["SRC"]
      fileNameElement.value = SRC.replace("/src/treck/", "")
      treckID = data["treckID"]
      titleIDElement.textContent = "Трек ID:" + data["treckID"]
      durationInputElement.value = data["duration"]
      audioElement.src = SRC
      addSelect($selectArtist, data.artists, "artist")
      addSelect($selectCategory, data.category, "category")
      addSelect($selectMood, data.mood, "mood")
    }
  })
}

function SendRequest(
  method,
  url,
  data = "",
  responseHandler = (response) => {
    console.log(`Нет обработчика данных. Ответ сервера: ${response}`)
  }
) {
  const xhr = new XMLHttpRequest()

  if (method === "POST") {
    xhr.open(method, url, true)
    xhr.send(JSON.stringify(data))
  } else if (method === "GET") {
    xhr.open(method, url, true)
    xhr.send()
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4) {
      return
    }
    // Если нет ошибок, то запускаем хэндлер для полученных данных
    if (xhr.status != 200) {
      ;`${xhr.status} : ${xhr.statusText}`
    } else {
      responseHandler(xhr.responseText)
    }
  }
}

document.querySelectorAll(".select").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      el.querySelector("ul").classList.toggle("on")
    }
    if (e.target.tagName === "LI") {
      el.querySelector("input").value = e.target.textContent
      el.querySelector("ul").classList.remove("on")
    }
  })
})

// Функция добавления селекта
function addSelect(contextEl, options, teg) {
  let selectCount = contextEl.dataset.selectcount
  let selectName = contextEl.dataset.selectname
  let selectHeader = contextEl.dataset.selectheader
  let optionsStr

  if (!options) {
    optionsStr = contextEl.querySelector("select").innerHTML
  }
let optionValue = ""
  let optionName = ""
  let no
  let button
  switch (teg){
    case "artist":
      optionValue = "artistLinkID"
        optionName = "artistLink"
        no = '<option value="no">Нет</option>'
      button = '<button class="add-select-btn">Добавить</button>'
      break

    case "category":
      optionValue = "categoryID"
      optionName = "category"
      button = '<button class="add-select-btn">Добавить</button>'
      break

    case "mood":
      optionValue = "moodID"
      optionName = "mood"
      button = ''
      break

  }

  //   Если начальный селект
  if (selectCount == 0) {
    optionsStr = []
    options.forEach((option) => {
      optionsStr.push(`<option value="${option[optionValue]}">${option[optionName]}</option>`)
    })
    optionsStr = `<option value="non">-----------</option>` + no + optionsStr.join("") + `<option value="another">Свой вариант</option>`
    contextEl.insertAdjacentHTML(
      "beforeend",
      `
    <h2>${selectHeader}</h2>
          <div class="select">
            <p>${selectName}</p>
            <select>
            ${optionsStr}
            </select>
            <input
              class="another_choise_inpt _hide"
              type="text"
              name="another_choise"
              placeholder="Свой вариант"
            />
          </div>

          <div class="btns">
            ${button}
            <button class="remove-select-btn _hide">Удалить</button>
          </div>
    `
    )
    selectCount++
    contextEl.dataset.selectcount = selectCount
    return
  }

  let $removeSelectBtn = contextEl.querySelector(".remove-select-btn")

  contextEl.querySelector(".btns").insertAdjacentHTML(
    "beforebegin",
    `
            <div class="select">
          <p>${selectName} ${+selectCount+1}</p>
          <select>
          ${optionsStr}
          </select>
          <input
            class="another_choise_inpt _hide"
            type="text"
            name="another_choise"
            placeholder="${selectName}"
          />
        </div>
            `
  )

  selectCount++
  contextEl.dataset.selectcount = selectCount

  if (selectCount > 1) {
    $removeSelectBtn.classList.remove("_hide")
  } else {
    $removeSelectBtn.classList.add("_hide")
  }
}

// Функция удаления селекта
function removeSelect(contextEl) {
  let $removeSelectBtn = contextEl.querySelector(".remove-select-btn")
  let selectCount = contextEl.dataset.selectcount

  let $allSelects = contextEl.querySelectorAll(".select")
  $allSelects[$allSelects.length - 1].remove()

  selectCount--
  contextEl.dataset.selectcount = selectCount

  if (selectCount > 1) {
    $removeSelectBtn.classList.remove("_hide")
  } else {
    $removeSelectBtn.classList.add("_hide")
  }
}

// События кликов в полях выбора и по кнопкам
$selectWrappers.forEach((el) => {
  el.addEventListener("click", (event) => {
    let eventTarget = event.target

    switch (eventTarget.localName) {
      case "select":
        let $select = eventTarget.closest(".select")
        let $another_choise_inpt = $select.querySelector(".another_choise_inpt")

        if (eventTarget.value === "another") {
          $another_choise_inpt.classList.remove("_hide")
        } else {
          $another_choise_inpt.classList.add("_hide")
        }
        break
      case "button":
        switch (eventTarget.className) {
          case "add-select-btn":
            addSelect(eventTarget.closest(".multiple_select_wrapper"))
            break
          case "remove-select-btn":
            removeSelect(eventTarget.closest(".multiple_select_wrapper"))
            break
        }
        break
    }
  })
})
let dataCollector = []
let dataCollectorNewOption = []
let CollectorStatus
let category
let categoryNew
let mood
let moodNew
let artist
let artistNew
function save() {
 let allSelectCategory = $selectCategory.querySelectorAll('select')
  let allSelectMood = $selectMood.querySelectorAll('select')
  let allSelectArtistLink = $selectArtist.querySelectorAll('select')
  categoryCollection(allSelectCategory)
  moodCollection(allSelectMood)
  artistLinkCollection(allSelectArtistLink)
  if (CollectorStatus === "stop"){
    CollectorStatus = ""
    return
  } else {
    let data = {}
    data["duration"] = durationInputElement.value
    data["name"] = nameTrackElement.value
    data["artist"] =  nameArtistElement.value
    data["SRC"] = SRC
    data["SRCNew"] =  "/src/treck/" + fileNameElement.value
    data["treckID"] = treckID
    data["category"] = category
    data["categoryNew"] = categoryNew
    data["mood"] = mood
    data["moodNew"] = moodNew
    data["artistLink"] = artist
    data["artistLinkNew"] = artistNew
    dataSend ={"comand": "send", "treck": data}
    SendRequest("POST", "php/analysis.php", dataSend, (data)=>{
      data = JSON.parse(data)
      if (data["result"] === "saveOK"){
        Status = "save"
        location.reload()
      }
    })
  }

}
function categoryCollection (element) {
  element.forEach(collector)
  category = dataCollector
  dataCollector = []
  categoryNew = dataCollectorNewOption
  dataCollectorNewOption = []
}

function moodCollection (element) {
  element.forEach(collector)
  mood = dataCollector
  dataCollector = []
  moodNew = dataCollectorNewOption
  dataCollectorNewOption = []
}

function artistLinkCollection (element) {
  element.forEach(collector)
  artist = dataCollector
  dataCollector = []
  artistNew = dataCollectorNewOption
  dataCollectorNewOption = []
}
function collector (index) {
  if (CollectorStatus === "stop"){
    return
  } else if (index.value === "non") {
    alert("Заполните все поля")
    CollectorStatus = "stop"
  } else if (index.value === "another") {
    if (index.closest("div").querySelector(".another_choise_inpt").value === ""){
      alert("Заполните все поля")
      CollectorStatus = "stop"
    } else {
      dataCollectorNewOption.push(index.closest("div").querySelector(".another_choise_inpt").value)
    }
  } else {
    dataCollector.push(index.value)
  }
}

window.onbeforeunload = function() {
  if (Status === "get"){
  dataSend ={"comand": "out", "id": treckID}
  SendRequest("POST", "php/analysis.php", dataSend)
  return "Данные не сохранены. Точно перейти?";
  }
};
