let titleIDElement = document.querySelector(".titleID")
let fileNameElement = document.querySelector(".FileName")
let nameTrackElement = document.querySelector(".nameTrack")
let nameArtistElement = document.querySelector(".nameArtist")
let getElement = document.querySelector(".get")
let wrapContentElement = document.querySelector(".wrapContent")
let durationInputElement = document.querySelector(".durationInput")
let audioElement = document.querySelector("audio")
const $addSelectBtn = document.querySelector(".add-select-btn")
const $removeSelectBtn = document.querySelector(".remove-select-btn")
const $selectWrapper = document.querySelector(".multiple_select_wrapper")
let $allSelects = document.querySelectorAll(".multiple_select_wrapper > .select")
let selectNum = 1
let dataSend ={}

getElement.addEventListener("click", ()=>{
    get()
    getElement.style.opacity = 0
    wrapContentElement.style.opacity = 1
})
// get()
function get () {
    dataSend['comand'] = 'get'
    SendRequest("POST", "php/analysis.php", dataSend, (data)=>{
        data = JSON.parse(data)
        data = data[0]
        let tracName = data['name'].replace(".mp3", '')
        tracName = tracName.split(" - ")
        nameTrackElement.value = tracName[1].trim()
        nameArtistElement.value = tracName[0].trim()
        fileNameElement.value = data['SRC'].replace("/src/treck/", '')
        titleIDElement.textContent = "Трек ID:" + data['treckID']
        durationInputElement.value = data['duration']
        audioElement.src = data['SRC']
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
            (`${xhr.status} : ${xhr.statusText}`)
        } else {
            responseHandler(xhr.responseText)
        }
    }
}

document.querySelectorAll('.select').forEach(el => {
    el.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            el.querySelector('ul').classList.toggle('on')
        }
        if (e.target.tagName === 'LI') {
            el.querySelector('input').value = e.target.textContent
            el.querySelector('ul').classList.remove('on')
        }
    })

})


$addSelectBtn.addEventListener("click", () => {
    selectNum++
    document.querySelector(".btns").insertAdjacentHTML(
        "beforebegin",
        `
        <div class="select">
      <p>Категория ${selectNum}</p>
      <select>
        <option value="choise_1">Вариан 1</option>
        <option value="choise_2">Вариан 2</option>
        <option value="choise_3">Вариан 3</option>
        <option value="another">Свой вариант</option>
      </select>
      <input
        class="another_choise_inpt _hide"
        type="text"
        name="another_choise"
        placeholder="Категория"
      />
    </div>
        `
    )

    $allSelects = document.querySelectorAll(".multiple_select_wrapper > .select")
    if ($allSelects.length > 1) {
        $removeSelectBtn.classList.remove("_hide")
    } else {
        $removeSelectBtn.classList.add("_hide")
    }

})

$removeSelectBtn.addEventListener("click", () => {
    $allSelects = document.querySelectorAll(".multiple_select_wrapper > .select")
    $allSelects[$allSelects.length - 1].remove()
    $allSelects = document.querySelectorAll(".multiple_select_wrapper > .select")
    selectNum--
    if ($allSelects.length > 1) {
        $removeSelectBtn.classList.remove("_hide")
    } else {
        $removeSelectBtn.classList.add("_hide")
    }
})

$selectWrapper.addEventListener("click", (event) => {
    if (!event.target.closest("select")) {
        return
    }

    let $select = event.target.closest(".select")
    let $another_choise_inpt = $select.querySelector(".another_choise_inpt")

    if (event.target.value === "another") {
        $another_choise_inpt.classList.remove("_hide")
    } else {
        $another_choise_inpt.classList.add("_hide")
    }
})