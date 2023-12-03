let titleIDElement = document.querySelector(".titleID")
let fileNameElement = document.querySelector(".FileName")
let nameTrackElement = document.querySelector(".nameTrack")
let nameArtistElement = document.querySelector(".nameArtist")
let getElement = document.querySelector(".get")
let wrapContentElement = document.querySelector(".wrapContent")
let durationInputElement = document.querySelector(".durationInput")
let audioElement = document.querySelector("audio")
const $selectArtist = document.querySelector(".selectArtist")
const $selectCategory = document.querySelector(".selectCategory")

// TEMP
let fakeResponse = {
  "track-name": "name",
  src: "a/b/c.mp3",
  "track-duration": "3000",
  "db-id": "123",
  categories: ["cat1", "cat2", "cat3"],
  artists: ["artist1", "artist2", "artist3"],
}

// Все поля для селектов
const $selectWrappers = document.querySelectorAll(".multiple_select_wrapper")

let dataSend = {}

getElement.addEventListener("click", () => {
  get()
  getElement.style.opacity = 0
  wrapContentElement.style.opacity = 1
})
// get()
function get() {
  dataSend["comand"] = "get"
  SendRequest("POST", "php/analysis.php", dataSend, (data) => {
    data = JSON.parse(data)
    data = data[0]
    let tracName = data["name"].replace(".mp3", "")
    tracName = tracName.split(" - ")
    nameTrackElement.value = tracName[1].trim()
    nameArtistElement.value = tracName[0].trim()
    fileNameElement.value = data["SRC"].replace("/src/treck/", "")
    titleIDElement.textContent = "Трек ID:" + data["treckID"]
    durationInputElement.value = data["duration"]
    audioElement.src = data["SRC"]
    addSelect($selectArtist, data.artists)
    addSelect($selectCategory, data.categories)
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
function addSelect(contextEl, options) {
  let selectCount = contextEl.dataset.selectcount
  let selectName = contextEl.dataset.selectname
  let selectHeader = contextEl.dataset.selectheader
  let optionsStr

  if (!options) {
    optionsStr = contextEl.querySelector("select").innerHTML
  }

  //   Если начальный селект
  if (selectCount == 0) {
    optionsStr = []
    options.forEach((option) => {
      optionsStr.push(`<option value="${option}">${option}</option>`)
    })
    optionsStr = optionsStr.join("") + `<option value="another">Свой вариант</option>`
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
            <button class="add-select-btn">Добавить</button>
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

// Не забыть удалить
getElement.click()
addSelect($selectArtist, fakeResponse.artists)
addSelect($selectCategory, fakeResponse.categories)
