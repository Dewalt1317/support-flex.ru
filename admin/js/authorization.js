let loginInputElement = document.querySelector("#username")
let passwordInputElement =document.querySelector("#password")
let buttonLogin = document.querySelector(".buttonLogin")
let dataSend = {}

buttonLogin.addEventListener("click", get)
function get (){
    dataSend["login"] = loginInputElement.value
    dataSend["password"] = passwordInputElement.value
    SendRequest("POST", "php/authorization.php", dataSend, (data) => {
        data = JSON.parse(data)
        if (data["result"] === "loginOK") {
            window.location.href = "/admin"
        } else if (data["result"] === "failed") {
            loginInputElement.style.borderColor = "#eb4034"
            passwordInputElement.style.borderColor = "#eb4034"
        } else if (data["result"] === "NOlogin") {
            loginInputElement.style.borderColor = "#eb4034"
        } else if (data["result"] === "NOpass") {
        passwordInputElement.style.borderColor = "#eb4034"
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
