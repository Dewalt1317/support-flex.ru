let submitButton = document.querySelector(".submit")
let input = document.querySelector('.file');
let form = document.querySelector(".form")
let result = document.querySelector(".result")
let i = 0
let serverData
submitButton.addEventListener("click", response)

function response (data) {
    if (i === 0){
        result.innerHTML = "[Начало загрузки]<br>"
    }
    if (i < input.files.length) {
    let formData = new FormData()
        result.innerHTML = result.innerHTML + (i + 1) + ".) " + input.files[i]["name"] + "<br>"
    let file = input.files[i]
    formData.append(input.name, file);
        i++
    SendRequest("POST", "php/uploadFile.php", formData, response)
    } else {
        i = 0
        result.innerHTML = result.innerHTML + "[Загрузка завершена]<br>"
        data = JSON.parse(data)
        result.innerHTML = result.innerHTML + "[Начало ответа от сервера]<br>" + data["error"] + data["uploadedFiles"] + "<br>[Конец ответа от сервера]"
    }

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
        xhr.send(data)
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