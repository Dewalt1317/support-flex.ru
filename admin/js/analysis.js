let titleIDElement = document.querySelector(".titleID")
let fileNameElement = document.querySelector(".FileName")
let nameTrackElement = document.querySelector(".nameTrack")
let nameArtistElement = document.querySelector(".nameArtist")
let dataSend ={}
get()
function get () {
    dataSend['comand'] = 'get'
    SendRequest("POST", "php/analysis.php", dataSend, (data)=>{
        data = JSON.parse(data)
        data = data[0]
        console.log(data)
        let tracName = data['name'].replace(".mp3", '')
        tracName = tracName.split(" - ")
        nameTrackElement.value = tracName[1].trim()
        nameArtistElement.value = tracName[0].trim()
        fileNameElement.value = data['SRC'].replace("/src/treck/", '')
        titleIDElement.textContent = "Трек ID:" + data['treckID'] + ' ' + 'Длительностью:' + data['duration']
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
