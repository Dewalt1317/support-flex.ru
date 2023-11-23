let submitButton = document.querySelector(".submit")
let input = document.querySelector('.file');
let form = document.querySelector(".form")
let result = document.querySelector(".result")
let i = 0
submitButton.addEventListener("click", response)

function response () {
    if (i === 0){
        result.textContent = "[Начало загрузки]<b>"
    }
    if (i < input.files.length) {
    let formData = new FormData()
        result.textContent = result.textContent + input.files[i]["name"] + "<br>"
    let file = input.files[i]
    formData.append(input.name, file);
        i++
    SendRequest("POST", "php/upload.php", formData, response)
    } else {
        i = 0
        result.textContent = result.textContent + "[Загрузка завершена]<br>"
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