let titleIDElement = document.querySelector(".titleID")
let fileNameElement = document.querySelector(".fileNameInput")
let nameTrackElement = document.querySelector(".nameTrack")
let nameArtistElement = document.querySelector(".nameArtist")
let getElement = document.querySelector(".get")
let buttonGetWrapElement = document.querySelector(".buttonGetWrap")
let wrapContentElement = document.querySelector(".wrapContent")
let durationInputElement = document.querySelector(".durationInput")
let selectCoverButton = document.querySelector(".selectCoverButton")
let audioElement = document.querySelector("audio")
const $selectArtist = document.querySelector(".selectArtist")
const $selectCategory = document.querySelector(".selectCategory")
const $selectMood = document.querySelector(".selectMood")
let buttonSaveElement = document.querySelector(".buttonSave")
let buttonBack = document.querySelector(".back")
let buttonSkippedQueue = document.querySelector(".skippedQueue")
let buttonSkipElement = document.querySelector(".buttonSkip")
let buttonDelElement = document.querySelector(".buttonDel")
let fileInput = document.querySelector(".input__file")
let coverContainer = document.querySelector(".cover")
let treckID
let SRC
let Status

nameTrackElement.addEventListener("input", ()=>{
  searchTrack(nameTrackElement.value)
})
// Все поля для селектов
const $selectWrappers = document.querySelectorAll(".multiple_select_wrapper")

let dataSend = {}

fileInput.addEventListener("change", (event)=>{
  const selectImage = event.target.files;
  if (selectImage.length > 0){
      const [imageFile] = selectImage
      const isImageType = imageFile.type.startsWith("image")

      if (isImageType){
          const fileReader = new FileReader()

          fileReader.onload = ()=>{
              const srcData = fileReader.result
              coverContainer.src = srcData
          }
          fileReader.readAsDataURL(imageFile)
      }

  }
})

coverContainer.addEventListener("click", ()=>{
  SendRequest("POST", "php/coverAPI.php", "", (data) => {
    data = JSON.parse(data)
 switch(data["result"]){
  case "getOk":

  break

  case "error":

  break
 }
  })
})

buttonBack.addEventListener("click", () => {
  window.location.href = "/admin"
})
buttonSaveElement.addEventListener("click", save)
getElement.addEventListener("click", () => {
  get("get")
})
buttonSkippedQueue.addEventListener("click", () => {
  get("getSkipped")
})
buttonSkipElement.addEventListener("click", () => {
  dataSend = { comand: "skip", id: treckID }
  SendRequest("POST", "php/analysis.php", dataSend, (data) => {
    data = JSON.parse(data)
    if (data["result"] === "skipOK") {
      Status = "skip"
      location.reload()
    }
  })
})

buttonDelElement.addEventListener("click", () => {
  if (confirm('Вы уверены что хотите удалить трек? Востоновить его не получиться')){
    alert("test")
  }
})

function get(comand) {
  dataSend["comand"] = comand
  SendRequest("POST", "php/analysis.php", dataSend, (data) => {
    data = JSON.parse(data)
    if (data["status"] === "absent") {
      switch (dataSend["comand"]) {
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
      document.querySelector(".operationButton").classList.remove("_hide")
      Status = "get"
      let tracName = data["name"].replace(".mp3", "")
      tracName = tracName.split(" - ")
      try {
        nameTrackElement.value = tracName[1].trim();
        nameArtistElement.value = tracName[0].trim();
        searchTrack(tracName[1].trim())
      } catch (error) {
        console.log("Нестандартное имя файла");
        nameTrackElement.value = tracName;
      }
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
  switch (teg) {
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
      button = ""
      break
  }

  //   Если начальный селект
  if (selectCount == 0) {
    optionsStr = []
    options.forEach((option) => {
      optionsStr.push(
        `<option value="${option[optionValue]}">${option[optionName]}</option>`
      )
    })
    optionsStr =
      `<option value="non">-----------</option>` +
      no +
      optionsStr.join("") +
      `<option value="another">Свой вариант</option>`
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
          <p>${selectName} ${+selectCount + 1}</p>
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
  let allSelectCategory = $selectCategory.querySelectorAll("select")
  let allSelectMood = $selectMood.querySelectorAll("select")
  let allSelectArtistLink = $selectArtist.querySelectorAll("select")
  categoryCollection(allSelectCategory)
  moodCollection(allSelectMood)
  artistLinkCollection(allSelectArtistLink)
  if (CollectorStatus === "stop") {
    CollectorStatus = ""
    return
  } else {
    let data = {}
    data["duration"] = durationInputElement.value
    data["name"] = nameTrackElement.value
    data["artist"] = nameArtistElement.value
    data["SRC"] = SRC
    data["SRCNew"] = "/src/treck/" + fileNameElement.value
    data["treckID"] = treckID
    data["category"] = category
    data["categoryNew"] = categoryNew
    data["mood"] = mood
    data["moodNew"] = moodNew
    data["artistLink"] = artist
    data["artistLinkNew"] = artistNew
    dataSend = { comand: "send", treck: data }
    SendRequest("POST", "php/analysis.php", dataSend, (data) => {
      data = JSON.parse(data)
      if (data["result"] === "saveOK") {
        Status = "save"
        location.reload()
      }
    })
  }
}
function categoryCollection(element) {
  element.forEach(collector)
  category = dataCollector
  dataCollector = []
  categoryNew = dataCollectorNewOption
  dataCollectorNewOption = []
}

function moodCollection(element) {
  element.forEach(collector)
  mood = dataCollector
  dataCollector = []
  moodNew = dataCollectorNewOption
  dataCollectorNewOption = []
}

function artistLinkCollection(element) {
  element.forEach(collector)
  artist = dataCollector
  dataCollector = []
  artistNew = dataCollectorNewOption
  dataCollectorNewOption = []
}
function collector(index) {
  if (CollectorStatus === "stop") {
    return
  } else if (index.value === "non") {
    alert("Заполните все поля")
    CollectorStatus = "stop"
  } else if (index.value === "another") {
    if (
      index.closest("div").querySelector(".another_choise_inpt").value === ""
    ) {
      alert("Заполните все поля")
      CollectorStatus = "stop"
    } else {
      dataCollectorNewOption.push(
        index.closest("div").querySelector(".another_choise_inpt").value
      )
    }
  } else {
    dataCollector.push(index.value)
  }
}

window.onbeforeunload = function () {
  if (Status === "get") {
    dataSend = { comand: "out", id: treckID }
    SendRequest("POST", "php/analysis.php", dataSend)
    return "Данные не сохранены. Точно перейти?"
  }
}

function responseHandler(response) {
  const trackList = document.getElementById('trackList');
  trackList.innerHTML = ''; // Очищаем список треков

  response.forEach(track => {
      const trackRow = document.createElement('div');
      trackRow.classList.add('track-row');
      trackRow.innerHTML = `
          <div><span class="play-button" onclick="playTrack('${track.SRC}')">▶️</span></div>
          <div>${track.name}</div>
          <div>${track.artist}</div>
          <div>${track.duration}</div>
          <div>${track.treckID}</div>
      `;
      trackList.appendChild(trackRow);
  });
}

function responseHandler(response) {
  const trackList = document.getElementById('trackList');
  trackList.innerHTML = ''; // Очищаем список треков
  if (response.length !== 0) {
    response.forEach(track => {
        const trackRow = document.createElement('div');
        trackRow.classList.add('track-row');
        trackRow.innerHTML = `
            <div><span class="play-button" onclick="playTrack('${track.SRC}')">▶️</span></div>
            <div>${track.name}</div>
            <div>${track.artist}</div>
            <div>${track.duration}</div>
            <div>${track.treckID}</div>
        `;
        trackList.appendChild(trackRow);
    });
  } else {
    const trackRow = document.createElement('div');
    trackRow.innerHTML = `<div class="duplicatesNoFound">Дублей не найдено</div>`
    trackList.appendChild(trackRow);
  }
}

function playTrack(src) {
  const player = document.getElementById('player');
  player.src = src;
  player.play();
}

function searchTrack(trackName) {
  const apiUrl = 'php/screch.php';
  if (trackName !== ""){
              // Отправка запроса на сервер
              SendRequest('POST', apiUrl, trackName, (data)=>{
                data = JSON.parse(data)
                if(data["result"] !== "error") {
                responseHandler(data["data"])
              }
});
  }
}

let imageContainer = `

`

createPopUp("confirm", "Отправка фото", imageContainer, (type, response)=>{
  let input = document.querySelector(".input__file")
  if(type === "cancel") {
      
  } else {

  }
}, null, null, "Отправить", document.querySelector(".chat-wrapper"))

function translitToRussian(text) {
  const translitRules = {
      'kh': 'х', 'jj': 'й', 'jo': 'ё', 'yo': 'ё', 'zh': 'ж', 'ch': 'ч', 'sh': 'ш', 
      'shh': 'щ', 'yu': 'ю', 'ya': 'я', 'a': 'а', 'b': 'б', 'v': 'в', 
      'g': 'г', 'd': 'д', 'e': 'е', 'z': 'з', 'i': 'и', 
      'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 
      'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф', 
      'h': 'х', 'c': 'ц', 'y`': 'ъ', '`': 'ь', 'e`': 'э',
      // Добавляем заглавные буквы
      'Kh': 'Х', 'Jj': 'Й', 'Jo': 'Ё', 'Yo': 'Ё', 'Zh': 'Ж', 'Ch': 'Ч', 'Sh': 'Ш', 
      'Shh': 'Щ', 'Yu': 'Ю', 'Ya': 'Я', 'A': 'А', 'B': 'Б', 'V': 'В', 
      'G': 'Г', 'D': 'Д', 'E': 'Е', 'Z': 'З', 'I': 'И', 
      'Y': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 
      'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 
      'H': 'Х', 'C': 'Ц', 'Y`': 'Ъ', 'E`': 'Э'
  };

  // Сортируем правила по длине ключа в обратном порядке
  const sortedKeys = Object.keys(translitRules).sort((a, b) => b.length - a.length);

  return text.split('').reduce((acc, char, index, array) => {
      // Проверяем сочетания символов, начиная с самых длинных
      for (const key of sortedKeys) {
          if (array.slice(index, index + key.length).join('') === key) {
              acc.push(translitRules[key]);
              array.splice(index, key.length - 1); // Удаляем обработанные символы из массива
              return acc;
          }
      }
      // Если сочетание не найдено, добавляем одиночный символ
      acc.push(translitRules[char] || char);
      return acc;
  }, []).join('');
}




function selectCover() {
  createPopUp("image_send", "Выбор обложки", "", (type, response) => {}, null, null, "Выбрать", document.body);

  let dataCover = {};
  dataCover["Artist"] = nameArtistElement.value;
  dataCover["Name"] = nameTrackElement.value;
  SendRequestCover();

  // Проверяем, существует ли элемент с классом messagePopUp
  let messagePopUp = document.querySelector(".messagePopUp");

  // Создаём контейнер для строки поиска
  const searchContainer = document.createElement('div');
  searchContainer.innerHTML = `
      <div class="screchRow">
          <input type="text" id="artistInput" class="nameArtist" placeholder="Артист" value="${dataCover["Artist"]}"/>
          <input type="text" id="trackInput" class="nameTrack" placeholder="Название трека" value="${dataCover["Name"]}"/>
          <button id="searchButton">Поиск</button>
      </div>
  `;
  messagePopUp.appendChild(searchContainer);

  // Создаём контейнер для изображений
  const imagesContainer = document.createElement('div');
  imagesContainer.className = 'imagesContainer';
  messagePopUp.appendChild(imagesContainer);

  // Добавляем сообщение "Загрузка..."
  const loadingMessage = document.createElement('div');
  loadingMessage.innerText = 'Загрузка...';
  imagesContainer.appendChild(loadingMessage);

  let searchButton = document.getElementById('searchButton');

  searchButton.addEventListener('click', () => {
      // Очищаем только div с изображениями и добавляем сообщение "Загрузка..."
      imagesContainer.innerHTML = '';
      imagesContainer.appendChild(loadingMessage);

      // Обновляем данные для запроса
      dataCover["Artist"] = document.getElementById('artistInput').value;
      dataCover["Name"] = document.getElementById('trackInput').value;
      SendRequestCover();
  });

  function SendRequestCover() {
      SendRequest("POST", "php/coverAPI.php", dataCover, (data) => {
          try {
              data = JSON.parse(data);
              console.log("Ответ JSON:", data);
              switch (data["result"]) {
                  case "getOk":
                      console.log("Результат getOk");
                      // Убираем сообщение "Загрузка..."
                      imagesContainer.removeChild(loadingMessage);

                      function createImageElement(src, caption) {
                          return `
                              <div>
                                  <img src="${src}"/>
                                  <div>${caption}</div>
                              </div>
                          `;
                      }

                      // Добавляем первое изображение
                      imagesContainer.innerHTML += createImageElement('/src/image/Default cover.PNG', 'Default cover');

                      // Добавляем остальные изображения из массива data
                      for (const key in data) {
                          if (key !== 'result' && data[key]) {
                              let caption = key;
                              if (key === 'localPath') {
                                  caption = data[key].split('/').pop();
                              }
                              imagesContainer.innerHTML += createImageElement(data[key], caption);
                          }
                      }
                      break;
                  case "error":
                      console.error("Ошибка: " + data["message"]);
                      break;
                  default:
                      console.error("Неизвестный результат: " + data["result"]);
              }
          } catch (e) {
              console.error("Ошибка при обработке ответа: " + e.message);
          }
      });
  }
}
