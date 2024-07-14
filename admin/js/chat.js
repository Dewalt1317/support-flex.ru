// Объект для отправки данных чата
let dataChatSend = {};

let messageID = {}

// Элемент блока сообщений
let messageBlockElement = document.querySelector(".messageBlock");

let buttonNewMessage = document.querySelector(".newMessage")

// Контейнер для смайликов
let emojiMenuList = document.querySelector(".emojiMenuList")

// Поле ввода сообщения
let inputMessage = document.querySelector(".input-block");

// Кнопка отправки сообщения
let buttonSend = document.querySelector(".send-btn");

let inputMessageReplay = document.querySelector(".chat-send-message-top")

// Позиция курсора в поле ввода
let CaretPosition = 0;

// Объект для хранения новых сообщений чата
let chatDataNew = {};

// Объект для хранения данных сообщений чата
let chatDataMessage = {};

// Последнее сообщение
let lastMessage = {};

// Обработчик события клика по кнопке отправки сообщения
buttonSend.addEventListener("click", send)

messageBlockElement.addEventListener("scroll", buttonScroll)

buttonNewMessage.addEventListener("click", chatScroll)

// Обработчик события клика по кнопке ответить на сообщение
messageBlockElement.addEventListener("click", function (event) {
    // Проверка, что событие произошло на нужном элементе
    if (event.target.matches(".buttonRepleyWrap") || event.target.matches(".buttonRepley")) {
        let element = event.target.parentNode.parentNode
        if (element.id === "") element = element.parentNode
        replySend(element.id)
    } else if (event.target.matches(".photoMessage")){
        openPhoto(event.target.src)
    }
});

inputMessageReplay.addEventListener("click", function (event) {
    // Проверка, что событие произошло на нужном элементе
    if (event.target.matches(".deleteReply") || event.target.matches(".deleteReplyWrap")) {
        dataChatSend["ReplyMessageID"] = ""
        inputMessageReplay.removeChild(inputMessageReplay.firstChild)
    }
});

// Функция для обработки ответа сервера при получении чата
function getChat(data) {
    switch (data["result"]) {
        case "getOk":
            chatDataNew = data["message"];
            chatDataNew.forEach((element)=>{
                addMessage(element, data)
            });
            dataChatSend["lastMessage"] = lastMessage;
            break;

        case "sendOK":
            inputMessage.textContent = "";
            dataChatSend["photoSRC"] = ""
            dataChatSend["ReplyMessageID"] = ""
            if (inputMessageReplay.firstChild !== null) inputMessageReplay.removeChild(inputMessageReplay.firstChild)
            chatScroll()
            break;

        case "regUser":
            createPopUp("input", "Представьтесь", "Для общения в чате введите свой никнейм", () => {
                dataChatSend["name"] = document.querySelector("#popup-input").value;
                WS.send(JSON.stringify({"type":"chatReg", "data":dataChatSend}))
            }, "text", "Введите никнейм", "Отправить сообщение", document.querySelector(".chat-wrapper"));
            break;

        case "error":
            dataChatSend["lastMessage"] = lastMessage;
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
            break;

        default:
            dataChatSend["lastMessage"] = lastMessage;
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
            break;
    }
}

// Функция для добавления сообщения в блок сообщений
function addMessage(data, array) {
    let type
    // Проверяем, если дата текущего сообщения отличается от предыдущего, добавляем блок с датой
    if (lastMessage["date"] !== data["date"]) {
        let currentYear = new Date().getFullYear()
        let monthName;
        let date = data["date"].split("-");

        switch (date[1]) {
            case "01":
                monthName = "Января";
                break;

            case "02":
                monthName = "Февраля";
                break;

            case "03":
                monthName = "Марта";
                break;

            case "04":
                monthName = "Апреля";
                break;

            case "05":
                monthName = "Мая";
                break;

            case "06":
                monthName = "Июня";
                break;

            case "07":
                monthName = "Июля";
                break;

            case "08":
                monthName = "Августа";
                break;

            case "09":
                monthName = "Сентября";
                break;

            case "10":
                monthName = "Октября";
                break;

            case "11":
                monthName = "Ноября";
                break;

            case "12":
                monthName = "Декабря";
                break;
        }

        if (currentYear != date[0]) {
            date = date[2] + " " + monthName + " " + date[0] + "г.";
        } else {
            date = date[2] + " " + monthName;
        }

        let dataCreate = document.createElement("div");
        dataCreate.classList.add("messageDateWrap");
        dataCreate.innerHTML = `<div class="messageDate" id="${data["date"]}">${date}</div>`;
        messageBlockElement.insertAdjacentElement("beforeend", dataCreate);
    }

    chatDataMessage[data["messageID"]] = data;
    lastMessage["ID"] = data["messageID"];
    lastMessage["date"] = data["date"];
    lastMessage["time"] = data["time"];

    let messageCreate = document.createElement("div");
    messageCreate.classList.add("messageWarp");

    let name = data["name"]
    if (data["userID"] === "40817Presenter") {
        name = ""
        data["name"] = "Вы"
        data["class"] = "youMessage"
    } else {
        data["class"] = ""
    }

    // Определяем тип сообщения
    if (data["ReplyMessageID"] !== "" && data["photoSRC"] !== "") {
        type = "photoReply";
    } else if (data["ReplyMessageID"] == "" && data["photoSRC"] !== "") {
        type = "photo";
    } else if (data["ReplyMessageID"] !== "" && data["photoSRC"] == "") {
        type = "reply";
    } else if (data["name"] == "40817BOTdonationalerts") {
        type = "donat";
    } else {
        type = "message";
    }

    // Создаем разметку для сообщения в зависимости от типа
    switch (type) {
        case "message":
            messageCreate.innerHTML = `<div class="message ${data["class"]}" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${name}
          </p>
          </div>
          <div class="messageTextMessage">
          <p>
            ${data["textMessage"]}
            </p>
          </div>
          <div class="messageBottom">
                      <div class="buttonRepleyWrap">
            <img class="buttonRepley" src="/src/ico/repley.svg">
</div>
            <div class="timeMessage">${data["time"].slice(0, -3)}</div>
          </div>
      </div>`;
            break;

        case "photoReply":
            messageCreate.innerHTML = `<div class="message ${data["class"]}" id="${data["messageID"]}">
         <div class="username">
    <p>
        ${name}
    </p>
    <div class="replyWrap">
    <div class="replyContent">
    <div class="replyTrait"></div>
    <div class="photoReplyWrap">
    <img class="photoReply" src="${chatDataMessage[data["ReplyMessageID"]]["photoSRC"]}" alt="">
</div>
        <div class="reply">
            <div class="replyUsername">${chatDataMessage[data["ReplyMessageID"]]["name"]}</div>
            <div class="replyMessageTextMessage">${chatDataMessage[data["ReplyMessageID"]]["textMessage"]}</div>
        </div>
        </div>
    </div>
</div>
<div class="messageTextMessage">
    <p>
        ${data["textMessage"]}
    </p>
</div>
<div class="photoMessageWrap">
    <img class="photoMessage" src="${data["photoSRC"]}" alt="">
</div>
<div class="messageBottom">
    <div class="buttonRepleyWrap">
        <img class="buttonRepley" src="/src/ico/repley.svg">
    </div>
    <div class="timeMessage">${data["time"].slice(0, -3)}</div>
</div>
            </div>`;
            break;

        case "photo":
            messageCreate.innerHTML = `<div class="message ${data["class"]}" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${name}
          </p>
          </div>
          <div class="messageTextMessage">
          <p>
            ${data["textMessage"]}
            </p>
          </div>
          <div class="photoMessageWrap">
          <img class="photoMessage" src="${data["photoSRC"]}" alt="">
</div>
          <div class="messageBottom">
                      <div class="buttonRepleyWrap">
            <img class="buttonRepley" src="/src/ico/repley.svg">
</div>
            <div class="timeMessage">${data["time"].slice(0, -3)}</div>
          </div>
      </div>`;
            break;

        case "reply":
            messageCreate.innerHTML = `<div class="message ${data["class"]}" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${name}
          </p>
    <div class="replyWrap">
        <div class="replyContent">
            <div class="replyTrait"></div>
    <div class="photoReplyWrap">
    <img class="photoReply" src="${chatDataMessage[data["ReplyMessageID"]]["photoSRC"]}" alt="">
</div>
        <div class="reply">
            <div class="replyUsername">${chatDataMessage[data["ReplyMessageID"]]["name"]}</div>
            <div class="replyMessageTextMessage">${chatDataMessage[data["ReplyMessageID"]]["textMessage"]}</div>
        </div>
        </div>
    </div>
          </div>
          <div class="messageTextMessage">
          <p>
            ${data["textMessage"]}
            </p>
          </div>
          <div class="messageBottom">
                      <div class="buttonRepleyWrap">
            <img class="buttonRepley" src="/src/ico/repley.svg">
</div>
            <div class="timeMessage">${data["time"].slice(0, -3)}</div>
          </div>
      </div>`;
            break;

        case "donat":
            let message = JSON.parse(data["textMessage"]);
            messageCreate.innerHTML = `<div class="messageDonat" id="${data["messageID"]}">
          <div class="username">
            <img src="/src/ico/donationalerts.svg" alt="">
          </div>
                    <div class="messageTextBot">
          <p>
            ${message["botStart"]}
            </p>
            <p class="amount">${message["amount"]}</p>   
            <p>${message["botEnd"]}</p>         
          </div>
          <div class="messageTextMessageDonat">
          <p>
            ${message["Message"]}
            </p>
          </div>
          <div class="messageBottom">
            <div class="timeMessage">${data["time"].slice(0, -3)}</div>
          </div>
      </div>`;
            break;
    }

    // Вставляем сообщение в блок сообщений
    messageBlockElement.insertAdjacentElement("beforeend", messageCreate);
    chatScroll(array["comand"], data["userID"])
}

// Обработчик события клика по смайликам
emojiMenuList.addEventListener("click", (event) => {
    let td = event.target.closest("td");
    if (!td) return;

    // Получаем выбранный смайлик
    let selectedEmoji = td.innerText;

    // Преобразуем текст в поле ввода в массив
    let inputText = inputMessage.textContent.split("");

    // Разделяем массив на две части: левую (до позиции курсора) и правую (после позиции курсора)
    let rightText = inputText.splice(CaretPosition, inputText.length);

    // Устанавливаем в поле ввода текст с выбранным смайликом
    inputMessage.textContent = inputText.join("") + selectedEmoji + rightText.join("");
    CaretPosition = CaretPosition + selectedEmoji.length;
});

// Получение позиции курсора в поле ввода при отжатии любой клавиши
inputMessage.addEventListener("keyup", (event) => {
    CaretPosition = window.getSelection().getRangeAt(0).startOffset;
});

// Получение позиции курсора в поле ввода при клике
inputMessage.addEventListener("click", (event) => {
    CaretPosition = window.getSelection().getRangeAt(0).startOffset;
});

// Функция для отправки сообщения
function send() {
    if (inputMessage.textContent !== "" && inputMessage.textContent.trim().length > 0) {
        let message = inputMessage.textContent.replaceAll(/>/gi, "&gt;");
        message = message.replaceAll(/</gi, "&lt;");
        dataChatSend["messageText"] = message;
        dataChatSend["userID"] = "40817Presenter"
        dataChatSend["userCode"] = "ZXXdpboPdNvk8*!kfgwev54te"
        WS.send(JSON.stringify({"type":"sendMessage", "data":dataChatSend}))
    }
}

// Функция для вычисления скрытой части блока сообщений
function calc(block) {
    return block.scrollHeight - block.scrollTop - block.offsetHeight;
}

function replySend(id) {
    if (inputMessageReplay.firstChild !== null) inputMessageReplay.removeChild(inputMessageReplay.firstChild)
    dataChatSend["ReplyMessageID"] = id
    let replySendElement = document.createElement("div");
    replySendElement.innerHTML = `<div class="replySendWrap">
<div class="replyWrap">
<div class="replyContent">
    <div class="replyTrait"></div>
    <div class="photoReplyWrap">
    <img class="photoReply" src="${chatDataMessage[id]["photoSRC"]}" alt="">
</div>
        <div class="reply">
            <div class="replyUsername">${chatDataMessage[id]["name"]}</div>
            <div class="replyMessageTextMessage">${chatDataMessage[id]["textMessage"]}</div>
        </div>
    </div>
            <div class="deleteReplyWrap">
        <img class="deleteReply" src="/src/ico/close.svg" alt="">
</div>
</div>
</div>`

    inputMessageReplay.insertAdjacentElement("beforeend", replySendElement);
}

function buttonScroll() {
    let scrollBlock = calc(messageBlockElement)

    if (scrollBlock > 250) {
        buttonNewMessage.style.display = 'flex';
        setTimeout(function () {
            buttonNewMessage.style.opacity = 1;
        }, 10);
    } else if (scrollBlock < 200) {
        buttonNewMessage.style.opacity = 0;
        setTimeout(function () {
            buttonNewMessage.style.display = 'none';
        }, 300);
    }
}

function chatScroll(comand, messageUserID) {
    if (messageUserID === "40817Presenter" && comand !== "getChat") comand = "messageSend"
    let lastMessage = messageBlockElement.querySelector(".messageWarp:last-child")
    switch (comand) {
        case "getNewMessage":
            if (calc(messageBlockElement) < 50 || calc(messageBlockElement) < 50) {
                messageBlockElement.scroll({
                    top: lastMessage.offsetTop + lastMessage.clientHeight,
                    left: 0,
                    behavior: 'smooth'
                })
            }
            break

        case "getChat":
            if (lastMessage !== null) {
                setTimeout(()=>{
                    messageBlockElement.scroll({
                        top: lastMessage.offsetTop + lastMessage.clientHeight,
                        left: 0,
                        behavior: 'smooth'
                    })
                }, 10)
            }
            break

        case "messageSend":
            messageBlockElement.scroll({
                top: lastMessage.offsetTop + lastMessage.clientHeight,
                left: 0,
                behavior: 'smooth'
            })
            break

        default:
            messageBlockElement.scroll({
                top: lastMessage.offsetTop + lastMessage.clientHeight,
                left: 0,
                behavior: 'smooth'
            })
            break
    }
}

let fileInput = document.querySelector(".input__file")


fileInput.addEventListener("change", (event)=>{
    let imageContainer = `<div class="wrapSendPopUp">
<div class="imageConteiner"></div>
<div class="chat-send-message">
    <div class="chat-send-message-top"></div>
    <div class="chat-send-message-bottom">
        <div class="input-block" contenteditable="true" data-placeholder="Подпись" data-input></div>
        <div class="chat-btns">
            <div class="emojiWrap menu-container">
                <div class="emoji-btn menu-button">
                    <img src="/src/ico/emoji.svg" class="emoji-btn">
                </div>
                <div class="emojiMenuList menuList menuTop">
                   ${emojiTable}
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`
    const selectImage = event.target.files;
    if (selectImage.length > 0){
        const [imageFile] = selectImage
        const isImageType = imageFile.type.startsWith("image")

        if (isImageType){
            const fileReader = new FileReader()

            fileReader.onload = ()=>{
                const srcData = fileReader.result
                const img = new Image()
                img.src = srcData
                createPopUp("image_send", "Отправка фото", imageContainer, (type, response)=>{
                    let input = document.querySelector(".input__file")
                    if(type === "cancel") {
                        fileInput.value = ""
                    } else {
                        let formData = new FormData()
                        let file = input.files[0]
                        formData.append(input.name, file);
                        SendRequest("POST", "/php/uploadPhoto.php", formData, (data)=>{
                            data = JSON.parse(data)
                            switch (data["result"]) {
                                case "error":
                                    createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
                                    break

                                case "bigSize":
                                    createPopUp("message", "Ошибка", "Фотография не отправлена. Снимок должен весить не больше 5 мегабайт", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
                                    break

                                case "fileTypeNotFound":
                                    createPopUp("message", "Ошибка", "Не допустимый формат файла. можно загрузить толко файлы форматов: .jpeg .png .gif .bmp .tiff .webp и .svg", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
                                    break

                                case "saveOK":
                                    dataChatSend["photoSRC"] = "/src/userPhoto/" + data["src"]
                                    dataChatSend["messageText"] = response;
                                    dataChatSend["userID"] = "40817Presenter"
                                    dataChatSend["userCode"] = "40817Presenter"
                                    WS.send(JSON.stringify({"type":"sendMessage", "data":dataChatSend}))
                                    fileInput.value = ""
                                    break
                                default:
                                    createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
                                    break
                            }
                        }, "file")
                    }
                }, null, null, "Отправить", document.querySelector(".chat-wrapper"))
                // Обработчик события клика по смайликам
                let inputMessagePhotoSend = document.querySelector(".wrapSendPopUp .input-block")
                let emojiPhotoSend = document.querySelector(".wrapSendPopUp .emojiMenuList")
                emojiPhotoSend.addEventListener("click", (event) => {
                    let td = event.target.closest("td");
                    if (!td) return;

                    // Получаем выбранный смайлик
                    let selectedEmoji = td.innerText;

                    // Преобразуем текст в поле ввода в массив
                    let inputText = inputMessagePhotoSend.textContent.split("");

                    // Разделяем массив на две части: левую (до позиции курсора) и правую (после позиции курсора)
                    let rightText = inputText.splice(CaretPosition, inputText.length);

                    // Устанавливаем в поле ввода текст с выбранным смайликом
                    inputMessagePhotoSend.textContent = inputText.join("") + selectedEmoji + rightText.join("");
                    CaretPosition = CaretPosition + selectedEmoji.length;
                });

// Получение позиции курсора в поле ввода при отжатии любой клавиши
                inputMessagePhotoSend.addEventListener("keyup", (event) => {
                    CaretPosition = window.getSelection().getRangeAt(0).startOffset;
                });

// Получение позиции курсора в поле ввода при клике
                inputMessagePhotoSend.addEventListener("click", (event) => {
                    CaretPosition = window.getSelection().getRangeAt(0).startOffset;
                });
                let Container = document.querySelector(".imageConteiner")
                Container.innerHTML
                Container.append(img)
            }
            fileReader.readAsDataURL(imageFile)
        }

    }
})

function openPhoto (photoURL){

    let startX
    let startY
    let photoX
    let photoY
    let isMouseDown = false
    let transformOriginY = ""
    let transformOriginX = ""

    // Создаем модальное окно
    const modal = document.createElement("div");
    modal.classList.add("photo-modal");

    // Создаем контейнер для фото
    const photoContainer = document.createElement("div");
    photoContainer.classList.add("photo-container");

    // Создаем фото
    const photo = document.createElement("img");
    photo.classList.add("photo");
    photo.setAttribute("src", photoURL);
    photo.draggable = false

    // Создаем плашку изменения масштаба фото
    const zoomWrap = document.createElement("div");
    zoomWrap.classList.add("zoom-wrap");

    const zoomContainer = document.createElement("div");
    zoomContainer.classList.add("zoom-container");

    // Создаем кнопку уменьшения масштаба
    const zoomInButton = document.createElement("button");
    zoomInButton.classList.add("zoom-in-button");
    zoomInButton.innerHTML = "-";

    // Создаем слайдер изменения масштаба
    const zoomSlider = document.createElement("input");
    zoomSlider.classList.add("zoom-slider");
    zoomSlider.setAttribute("type", "range");
    zoomSlider.setAttribute("min", "0.1");
    zoomSlider.setAttribute("max", "10");
    zoomSlider.setAttribute("value", "1");
    zoomSlider.setAttribute("step", "0.1");

    // Создаем кнопку увеличения масштаба
    const zoomOutButton = document.createElement("button");
    zoomOutButton.classList.add("zoom-out-button");
    zoomOutButton.innerHTML = "+";

    // Создаем ползунок слайдера
    const zoomSliderThumb = document.createElement("div");
    zoomSliderThumb.classList.add("zoom-slider-thumb");

    // Добавляем ползунок в слайдер
    zoomSlider.appendChild(zoomSliderThumb);

    // Добавляем кнопки и слайдер в контейнер
    zoomContainer.appendChild(zoomInButton);
    zoomContainer.appendChild(zoomSlider);
    zoomContainer.appendChild(zoomOutButton);

    // Создаем крест для закрытия фото
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "&times;";

    // Добавляем фото, плашку изменения масштаба и крест в контейнер
    photoContainer.appendChild(photo);
    zoomWrap.appendChild(zoomContainer);
    modal.appendChild(zoomWrap);
    modal.appendChild(closeButton);

    // Добавляем контейнер в модальное окно
    modal.appendChild(photoContainer);

    // Добавляем модальное окно в body
    document.body.appendChild(modal);

    // Устанавливаем начальный масштаб фото
    let scale = 1;

    // Устанавливаем обработчик события на слайдер
    zoomSlider.addEventListener("input", (event) => {
        // Получаем новое значение масштаба
        scale = event.target.value;
        scale = +scale
        // Устанавливаем новый масштаб фото
        photo.style.transform = `scale(${scale})`;
        const photoRect = photo.getBoundingClientRect();
        if (photoRect.width < window.innerWidth) {
            transformOriginX = "center"
            photo.style.transformOrigin = transformOriginY + " " + transformOriginX
            photo.style.left = calculateAuto(photo)['left'] + "px"
            photo.style.right = calculateAuto(photo)['right'] + "px"
        }
        if (photoRect.height < window.innerHeight) {
            transformOriginY = "center"
            photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = calculateAuto(photo)['top'] + "px"
            photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
        }

    });

    // Устанавливаем обработчик события на кнопку уменьшения масштаба
    zoomInButton.addEventListener("mousedown", (event) => {
        // Уменьшаем масштаб фото
        const interval = setInterval(() => {
            if (scale > 0.2) scale -= 0.2;
            // Устанавливаем новый масштаб фото
            photo.style.transform = `scale(${scale})`;
            const photoRect = photo.getBoundingClientRect();
            if (photoRect.width < window.innerWidth) {
                transformOriginX = "center"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.left = calculateAuto(photo)['left'] + "px"
                photo.style.right = calculateAuto(photo)['right'] + "px"
            }
            if (photoRect.height < window.innerHeight) {
                transformOriginY = "center"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.top = calculateAuto(photo)['top'] + "px"
                photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
            }
            // Устанавливаем новое значение слайдера
            zoomSlider.value = scale;
        }, 100);

        // Останавливаем интервал при отпускании кнопки мыши
        document.addEventListener("mouseup", () => {
            clearInterval(interval);
        });
    });

    // Устанавливаем обработчик события на кнопку увеличения масштаба
    zoomOutButton.addEventListener("mousedown", (event) => {
        // Увеличиваем масштаб фото
        const interval = setInterval(() => {
            if (scale < 9.9) scale += 0.2;
            // Устанавливаем новый масштаб фото
            photo.style.transform = `scale(${scale})`;

            const photoRect = photo.getBoundingClientRect();
            if (photoRect.width < window.innerWidth) {
                transformOriginX = "center"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.left = calculateAuto(photo)['left'] + "px"
                photo.style.right = calculateAuto(photo)['right'] + "px"
            }
            if (photoRect.height < window.innerHeight) {
                transformOriginY = "center"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.top = calculateAuto(photo)['top'] + "px"
                photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
            }

            // Устанавливаем новое значение слайдера
            zoomSlider.value = scale;
        }, 100);

        // Останавливаем интервал при отпускании кнопки мыши
        document.addEventListener("mouseup", () => {
            clearInterval(interval);
        });
    });

    // Устанавливаем обработчик события на крест для закрытия фото
    closeButton.addEventListener("click", () => {
        modal.remove();
    });

    // Устанавливаем обработчик события на нажатие клавиши Esc
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.remove();
        }
    });

    // Устанавливаем обработчик события на изменение масштаба с помощью колёсика мыши
    photoContainer.addEventListener("wheel", (event) => {
        // Получаем направление прокрутки
        const delta = event.deltaY;

        // Увеличиваем или уменьшаем масштаб фото в зависимости от направления прокрутки
        if (delta > 0) {
            if (scale > 0.3) scale = scale - 0.5;
            if (scale <= 0) scale = 0.1
        } else {
            if (scale < 9.9) scale =  scale + 0.5
        }

        // Устанавливаем новое значение слайдера
        zoomSlider.value = scale;

        // Устанавливаем новый масштаб фото
        photo.style.transform = `scale(${scale})`;
        const photoRect = photo.getBoundingClientRect();
        if (photoRect.width < window.innerWidth) {
            transformOriginX = "center"
            photo.style.transformOrigin = transformOriginY + " " + transformOriginX
            photo.style.left = calculateAuto(photo)['left'] + "px"
            photo.style.right = calculateAuto(photo)['right'] + "px"
        }
        if (photoRect.height < window.innerHeight) {
            transformOriginY = "center"
            photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = calculateAuto(photo)['top'] + "px"
            photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
        }

        // Предотвращаем прокрутку страницы
        event.preventDefault();
    });

    // Устанавливаем обработчик события на перемещение фотографии с помощью курсора
    photoContainer.addEventListener("mousedown", (event) => {
        // Проверяем, нажата ли левая кнопка мыши
        if (event.target.className === "photo-container") modal.remove();
        if (event.button === 0) {
            // Устанавливаем флаг нажатия левой кнопки мыши
            isMouseDown = true;
            photo.style.transition = "transform 0.2s ease-in-out"

            // Получаем начальные координаты курсора мыши
            startX = event.clientX;
            startY = event.clientY;

            // Получаем начальные координаты фото
            photoX = photo.offsetLeft;
            photoY = photo.offsetTop;
        }
    });

    // Устанавливаем обработчик события на перемещение курсора мыши
    document.addEventListener("mousemove", (event) => {
        // Проверяем, нажата ли левая кнопка мыши
        if (isMouseDown) {
            // Получаем текущие координаты курсора мыши
            const currentX = event.clientX;
            const currentY = event.clientY;

            // Вычисляем смещение курсора мыши
            const dx = currentX - startX;
            const dy = currentY - startY;

            // Вычисляем новые координаты фото
            const newPhotoX = photoX + dx;
            const newPhotoY = photoY + dy;

            // Устанавливаем новые координаты фото
            photo.style.left = `${newPhotoX}px`;
            photo.style.top = `${newPhotoY}px`;

            // Обновляем начальные координаты курсора мыши и фото
            startX = currentX;
            startY = currentY;
            photoX = newPhotoX;
            photoY = newPhotoY;
        }
    });

    // Центрируем модальное окно
    const modalWidth = modal.offsetWidth;
    const modalHeight = modal.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const left = (windowWidth - modalWidth) / 2;
    const top = (windowHeight - modalHeight) / 2;
    modal.style.left = `${left}px`;
    modal.style.top = `${top}px`;

    // Устанавливаем обработчик события на отпускание левой кнопки мыши
    document.addEventListener("mouseup", (event) => {
        // Сбрасываем флаг нажатия левой кнопки мыши
        isMouseDown = false;
        photo.style.transition = "transform 0.2s ease-in-out, right 0.2s ease-in-out, left 0.2s ease-in-out, top 0.2s ease-in-out, bottom 0.2s ease-in-out, inset 0.2s ease-in-out"
        const photoRect = photo.getBoundingClientRect();
        if (photoRect.width > window.innerWidth) {
            if (photoRect.left > 0) {
                transformOriginX = "left"
                photo.style.right = calculateAuto(photo)['right'] + "px"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.left = `0px`;
            }
            if (photoRect.right < window.innerWidth) {
                transformOriginX = "right"
                photo.style.left = calculateAuto(photo)['left'] * 2 + "px"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.right = "0px"
            }
        }
        if (photoRect.height > window.innerHeight){
            if (photoRect.top > 0) {
                transformOriginY = "top"
                photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.top = `0px`;
            }
            if (photoRect.bottom < window.innerHeight) {
                transformOriginY = "bottom"
                photo.style.top = calculateAuto(photo)['top'] * 2  + "px"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.bottom = "0px"

            }
        }
        if (photoRect.width < window.innerWidth) {
            transformOriginX = "center"
            photo.style.transformOrigin = transformOriginY + " " + transformOriginX
            photo.style.left = calculateAuto(photo)['left'] + "px"
            photo.style.right = calculateAuto(photo)['right'] + "px"
        }
        if (photoRect.height < window.innerHeight) {
            transformOriginY = "center"
            photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = calculateAuto(photo)['top'] + "px"
            photo.style.bottom = calculateAuto(photo)['bottom'] + "px"
        }
    });

    function calculateAuto(element) {
        // Получить родительский элемент
        const parent = element.parentElement;

        // Получить размеры родительского элемента
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;

        // Получить размеры элемента
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        // Рассчитать значения auto
        const left = (parentWidth - elementWidth) / 2;
        const right = parentWidth - left - elementWidth;
        const top = (parentHeight - elementHeight) / 2;
        const bottom = parentHeight - top - elementHeight;

        // Вернуть объект со значениями auto
        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom,
        };
    }


}

