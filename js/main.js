let getTimeInterval = setInterval(() => {}, 0)

get ()
getTimeInterval = setInterval(get, 5000)


function get () {
    dataSend = {"chat": dataChatSend, "title": dataTitleSend}
    SendRequest("POST", "php/get.php", dataSend, (data) => {
        data = JSON.parse(data)
        getTitle(data["title"])
        getChat(data["chat"])
    })
}