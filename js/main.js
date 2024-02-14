let buttonDonat = document.querySelector(".buttonDonat")
let getTimeInterval = setInterval(() => {}, 0)
let getLink
let buttonChatHidden = document.querySelector(".chatHidden")
let chatBlock = document.querySelector(".chat-wrapper")
let settingMenuContainer  = document.querySelector(".settingWrap")

buttonDonat.addEventListener("click", ()=>{
    window.open('https://www.donationalerts.com/r/support_flex_station', '_blank');
})

buttonChatHidden.addEventListener("click", ()=> {
    if (chatBlock.getBoundingClientRect().height > 0) {
        chatBlock.style.transition = "height 0.5s"
    chatBlock.style.height = "0px"
    closeMenu(settingMenuContainer, () => {
        buttonChatHidden.querySelector("p").textContent = "Открыть чат"
        buttonChatHidden.querySelector("img").src = "/src/ico/chat.svg"
    })
} else {
        chatBlock.style.height = "100vh"
        setTimeout(()=>{
            chatBlock.style.transition = ""
        }, 500)
        closeMenu(settingMenuContainer, () => {
            buttonChatHidden.querySelector("p").textContent = "Скрыть чат"
            buttonChatHidden.querySelector("img").src = "/src/ico/chatOff.svg"
            chatScroll()
        })

    }
})

SendRequest("POST", "php/connect.php", "", (data) => {
    data = JSON.parse(data)
    switch (data["result"]) {
        case "connectOK":
            streamLink = data["streamLink"]
            getLink = data["phpGet"]
            get ()
            getTimeInterval = setInterval(get, 5000)
            break

        case "connectFail":
            Connect("Привет, ты точно сотрудник Озон? Введи пожалуйста кодовое слово)")
            break

        default:
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", bodyElement);
            break
    }
})
function Connect(text) {
    createPopUp("input_connect", "Подключение к радио", text, (type, response)=>{
        let data = {"codeword": response}
        SendRequest("POST", "php/connect.php", data, (data) => {
            data = JSON.parse(data)
            switch (data["result"]) {
                case "connectOK":
                    streamLink = data["streamLink"]
                    getLink = data["phpGet"]
                    get ()
                    getTimeInterval = setInterval(get, 5000)
                    break

                case "connectFail":
                    if (data["attempts"] === 0){
                        createPopUp("connect_fail", "Подключение к радио", "Вы много раз ввели неверное кодовое слово, повторная попытка будет доступна через 10 минут", null, null, null, null, document.body)
                    } else {
                        text = "Кодовое слово неверно. Колличество оставшихся попыток: " + data["attempts"]
                        Connect(text)
                    }
                        break

                default:
                    createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", bodyElement);
                    break
            }
        })
    }, "password", "Введите кодовое слово", "Подключиться", document.body)

}

function get () {
    dataSend = {"chat": dataChatSend, "title": dataTitleSend}
    SendRequest("POST", getLink, dataSend, (data) => {
        data = JSON.parse(data)
        getTitle(data["title"])
        getChat(data["chat"])
    })
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
    } else {
        switch (event.code){
            case "Space":
                buttonPlayPause()
                break

            case "KeyM":
                volume()
                break

            case "ArrowUp":
                volume("up")
                break
            case "ArrowDown":
                volume("down")
                break
        }
    }
})

function closeMenu (menuContainer, postClose) {
    menuContainer.classList.remove('clicked');
    const openMenuList = menuContainer.querySelector('.menuList');
    openMenuList.style.opacity = 0;
    setTimeout(function () {
        openMenuList.style.display = 'none';
        if (postClose) postClose()
    }, 300);
}