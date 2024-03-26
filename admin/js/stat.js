let WSTimeout = setTimeout(()=> {}, 0);
let WS
let WSSrc
let reConnect = 0
let buttonBack = document.querySelector(".back")


buttonBack.addEventListener("click", () => {
    window.location.href = "/admin"
})

streamLink = "https://support-flex.ru/icecast/live"
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
            case "title":
                getTitle(data["data"])
                break
            case "chat":
                getChat(data["data"])
                break
            case "presenter":
                updatePresentersData(data["data"])
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

function getCookieData(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

// Добавление обработчиков событий для новых меню
document.addEventListener('click', function(event) {
    const menuButton = event.target.closest('.menu-button');
    const menuContainer = event.target.closest('.menu-container');

    // Если клик на элементе `.menu-button`, то открыть меню
    if (menuButton) {
        menuContainer.classList.add('clicked');
        const menuList = menuContainer.querySelector('.menuList');
        menuList.style.display = 'block';
        setTimeout(function() {
            menuList.style.opacity = 1;
        }, 10);
        return;
    }

    // Если клик вне menu-container, то закрыть все открытые меню
    if (!menuContainer) {
        const openMenuContainers = document.querySelectorAll('.menu-container.clicked');
        for (let j = 0; j < openMenuContainers.length; j++) {
            openMenuContainers[j].classList.remove('clicked');
            const openMenuList = openMenuContainers[j].querySelector('.menuList');
            openMenuList.style.opacity = 0;
            setTimeout(function() {
                openMenuList.style.display = 'none';
            }, 300);
        }
    }
});


document.addEventListener('keydown', function (event) {
    if (event.target.hasAttribute("data-input")){
        switch (event.code){
            case "Enter":
                if (!event.shiftKey){
                    event.preventDefault()
                    send()
                } else {
                    // Преобразуем текст в поле ввода в массив
                    let inputText = inputMessage.textContent.split("");

                    // Разделяем массив на две части: левую (до позиции курсора) и правую (после позиции курсора)
                    let rightText = inputText.splice(CaretPosition, inputText.length);

                    // Устанавливаем в поле ввода текст с переносом
                    inputMessage.textContent = inputText.join("") + '\n' + rightText.join("");
                    CaretPosition = CaretPosition + "\n".length;
                }
                break
        }
    }
})