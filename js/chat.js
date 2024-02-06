// Объект для отправки данных чата
let dataChatSend = {"comand": "getChat", "messageID":[]};

let messageID = {}

// Элемент блока сообщений
let messageBlockElement = document.querySelector(".messageBlock");

// Контейнер для смайликов
let emojiContainer = document.querySelector(".emojiContainer");

// Контейнер кнопеи ответа
let buttonReplay = document.querySelectorAll(".buttonRepleyWrap")

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
buttonSend.addEventListener("click", send);
// Обработчик события клика по кнопке ответить на сообщение
messageBlockElement.addEventListener("click", function(event) {
    // Проверка, что событие произошло на нужном элементе
    if (event.target.matches(".buttonRepleyWrap") || event.target.matches(".buttonRepley")) {
        let element = event.target.parentNode.parentNode
        if (element.id === "") element = element.parentNode
        replySend(element.id)
    }
});

inputMessageReplay.addEventListener("click", function(event) {
    // Проверка, что событие произошло на нужном элементе
    if (event.target.matches(".deleteReply") || event.target.matches(".deleteReplyWrap")) {
        inputMessageReplay.removeChild(inputMessageReplay.firstChild)
    }
});

// Функция для обработки ответа сервера при получении чата
function getChat(data) {
    switch (data["result"]) {
        case "getOk":
            chatDataNew = data["message"];
            chatDataNew.forEach(addMessage);
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            break;

        case "sendOK":
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            get();
            inputMessage.textContent = "";
            if (inputMessageReplay.firstChild !== null) inputMessageReplay.removeChild(inputMessageReplay.firstChild)
            messageBlockElement.scrollTop =  messageBlockElement.scrollHeight;
            break;

        case "regUser":
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            createPopUp("input", "Представьтесь", "Для общения в чате введите свой никнейм", ()=>{
                dataChatSend["comand"] = "regUser";
                dataChatSend["name"] = document.querySelector("#popup-input").value;
                get();
            }, "text", "Введите никнейм", "Отправить сообщение", document.querySelector(".chat-wrapper"));
            break;

        case "regOK":
            send();
            break;

        case "error":
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
            break;
    }
}

// Функция для добавления сообщения в блок сообщений
function addMessage(index) {
    let type = "";
    let data = index;
    //Сохраняем id сообщения в массив
    dataChatSend["messageID"].push(data["messageID"])
    // Проверяем, если дата текущего сообщения отличается от предыдущего, добавляем блок с датой
    if(lastMessage["date"] !== data["date"]){
        let currentYear = new Date().getFullYear();
        let monthName;
        let date = data["date"].split("-");

        switch (date[1]){
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

        if (currentYear != date[0]){
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
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${data["name"]}
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
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
         <div class="username">
    <p>
        ${data["name"]}
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
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${data["name"]}
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
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${data["name"]}
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

    // Проверяем, нужно ли прокрутить блок сообщений вниз
    let scroll;
    if (calc(messageBlockElement) === 0){
        scroll = true;
    } else {
        scroll = false;
    }

    // Вставляем сообщение в блок сообщений
    messageBlockElement.insertAdjacentElement("beforeend", messageCreate);

    // Прокручиваем блок сообщений вниз, если нужно
    if (scroll === true) {
        messageBlockElement.scrollTop =  messageBlockElement.scrollHeight;
    }
}

// Обработчик события клика по смайликам
emojiContainer.addEventListener("click", (event) => {
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
function send () {
    if (inputMessage.textContent !== ""){
        dataChatSend["messageText"] = inputMessage.textContent;
        dataChatSend["comand"] = "send";
        get();
    }
}

// Функция для вычисления скрытой части блока сообщений
function calc(block) {
    return  block.scrollHeight - block.scrollTop - block.offsetHeight;
}
 function replySend (id) {
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