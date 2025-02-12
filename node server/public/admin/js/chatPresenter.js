let WSTimeout = setTimeout(()=> {}, 0);
let WS
let WSSrc
let reConnect = 0
let buttonBack = document.querySelector(".back")


buttonBack.addEventListener("click", () => {
    window.location.href = "/admin/stat.html"
})

WSSrc = "wss://support-flex.ru:9000"
WS = new WebSocket(WSSrc)
WSTimeout = setTimeout(function() {
    WS.close();
    reconectWS()
}, 5000);
socketStart()

function reconectWS () {
    let playContinue = false
    if (audioObj.paused === false) {
        pause()
        playContinue = true
    }
    createPopUp("connect_fail", "Подключение к радио", "Потеряно соеденение с сервером, попытка повторного подключения", null, null, null, null, document.body)
    if (reConnect < 5){
        reConnect++
        WS = new WebSocket(WSSrc)
        WSTimeout = setTimeout(function() {
            WS.close();
            reconectWS()
        }, 5000);
        WS.addEventListener('open', () => {
            clearTimeout(WSTimeout)
            socketStart()
            document.querySelector(".pop-up-wrapper").remove();
            if (playContinue === true) {
                play()
            }
            if (messageBlockElement.textContent === "") {
                WS.send(JSON.stringify({"type":"getChat"}))
            }
            reConnect = 0
        })
    } else {
        document.querySelector(".pop-up-wrapper").remove();
        createPopUp("connect_fail", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", null, null, null, null, document.body)
    }
}

function socketStart (){
    WS.addEventListener('open', () => {
        clearTimeout(WSTimeout);
        WS.send(JSON.stringify({"type":"getChat"}))
    })
    WS.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        switch (data["type"]) {
            case "chat":
                getChat(data["data"])
                break
            default:
                console.log("Неизвестный тип сообщения")
                break
        }
    });
    WS.addEventListener('close', () => {
        reconectWS()
    });
}
