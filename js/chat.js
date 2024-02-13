// Объект для отправки данных чата
let dataChatSend = {"comand": "getChat", "messageID": []};

let messageID = {}

// Элемент блока сообщений
let messageBlockElement = document.querySelector(".messageBlock");

let buttonNewMessage = document.querySelector(".newMessage")

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

let userID

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
            userID = data["userID"]
            chatDataNew = data["message"];
            chatDataNew.forEach((element)=>{
                addMessage(element, data)
            });
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            break;

        case "sendOK":
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            get();
            inputMessage.textContent = "";
            dataChatSend["photoSRC"] = ""
            dataChatSend["ReplyMessageID"] = ""
            if (inputMessageReplay.firstChild !== null) inputMessageReplay.removeChild(inputMessageReplay.firstChild)
            chatScroll()
            break;

        case "regUser":
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            createPopUp("input", "Представьтесь", "Для общения в чате введите свой никнейм", () => {
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

        default:
            dataChatSend["lastMessage"] = lastMessage;
            dataChatSend["comand"] = "getNewMessage";
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"));
            break;
    }
}

// Функция для добавления сообщения в блок сообщений
function addMessage(data, array) {
    let type
    //Сохраняем id сообщения в массив
    dataChatSend["messageID"].push(data["messageID"])
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
    if (data["userID"] === userID) {
        name = ""
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
function send() {
    if (inputMessage.textContent !== "" && inputMessage.textContent.trim().length > 0) {
        dataChatSend["messageText"] = inputMessage.textContent;
        dataChatSend["comand"] = "send";
        get();
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
    if (messageUserID === userID && comand !== "getChat") comand = "messageSend"
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
                    <table class="emojiContainer">
                        <tr>
                            <td>&#128512;</td>
                            <td>&#128515;</td>
                            <td>&#128516;</td>
                            <td>&#128513;</td>
                            <td>&#128518;</td>
                            <td>&#128517;</td>
                            <td>&#129315;</td>
                            <td>&#128514;</td>
                        </tr>
                        <tr>
                            <td>&#128578;</td>
                            <td>&#128579;</td>
                            <td>&#128521;</td>
                            <td>&#128522;</td>
                            <td>&#128519;</td>
                            <td>&#129392;</td>
                            <td>&#128525;</td>
                            <td>&#129321;</td>
                        </tr>
                        <tr>
                            <td>&#128536;</td>
                            <td>&#128535;</td>
                            <td>&#9786;</td>
                            <td>&#128538;</td>
                            <td>&#128537;</td>
                            <td>&#128523;</td>
                            <td>&#128539;</td>
                            <td>&#128540;</td>
                        </tr>
                        <tr>
                            <td>&#129322;</td>
                            <td>&#128541;</td>
                            <td>&#129297;</td>
                            <td>&#129303;</td>
                            <td>&#129325;</td>
                            <td>&#129323;</td>
                            <td>&#129300;</td>
                            <td>&#129296;</td>
                        </tr>
                        <tr>
                            <td>&#129320;</td>
                            <td>&#128528;</td>
                            <td>&#128529;</td>
                            <td>&#128566;</td>
                            <td>&#128527;</td>
                            <td>&#128530;</td>
                            <td>&#128580;</td>
                            <td>&#128556;</td>
                        </tr>
                        <tr>
                            <td>&#129317;</td>
                            <td>&#128524;</td>
                            <td>&#128532;</td>
                            <td>&#128554;</td>
                            <td>&#129316;</td>
                            <td>&#128564;</td>
                            <td>&#128567;</td>
                            <td>&#129298;</td>
                        </tr>
                        <tr>
                            <td>&#129301;</td>
                            <td>&#129314;</td>
                            <td>&#129326;</td>
                            <td>&#129319;</td>
                            <td>&#129397;</td>
                            <td>&#129398;</td>
                            <td>&#129396;</td>
                            <td>&#128565;</td>
                        </tr>
                        <tr>
                            <td>&#129327;</td>
                            <td>&#129312;</td>
                            <td>&#129395;</td>
                            <td>&#128526;</td>
                            <td>&#129299;</td>
                            <td>&#129488;</td>
                            <td>&#128533;</td>
                            <td>&#128543;</td>
                        </tr>
                        <tr>
                            <td>&#128577;</td>
                            <td>&#9785;</td>
                            <td>&#128558;</td>
                            <td>&#128559;</td>
                            <td>&#128562;</td>
                            <td>&#128563;</td>
                            <td>&#129402;</td>
                            <td>&#128550;</td>
                        </tr>
                        <tr>
                            <td>&#128551;</td>
                            <td>&#128552;</td>
                            <td>&#128560;</td>
                            <td>&#128549;</td>
                            <td>&#128546;</td>
                            <td>&#128557;</td>
                            <td>&#128561;</td>
                            <td>&#128534;</td>
                        </tr>
                        <tr>
                            <td>&#128547;</td>
                            <td>&#128542;</td>
                            <td>&#128531;</td>
                            <td>&#128553;</td>
                            <td>&#128555;</td>
                            <td>&#128548;</td>
                            <td>&#128545;</td>
                            <td>&#128544;</td>
                        </tr>
                        <tr>
                            <td>&#129324;</td>
                            <td>&#128520;</td>
                            <td>&#128127;</td>
                            <td>&#128128;</td>
                            <td>&#9760;</td>
                            <td>&#128169;</td>
                            <td>&#129313;</td>
                            <td>&#128121;</td>
                        </tr>
                        <tr>
                            <td>&#128122;</td>
                            <td>&#128123;</td>
                            <td>&#128125;</td>
                            <td>&#128126;</td>
                            <td>&#129302;</td>
                            <td>&#128570;</td>
                            <td>&#128568;</td>
                            <td>&#128569;</td>
                        </tr>
                        <tr>
                            <td>&#128571;</td>
                            <td>&#128572;</td>
                            <td>&#128573;</td>
                            <td>&#128576;</td>
                            <td>&#128575;</td>
                            <td>&#128574;</td>
                            <td>&#128584;</td>
                            <td>&#128585;</td>
                        </tr>
                        <tr>
                            <td>&#128586;</td>
                            <td>&#128139;</td>
                            <td>&#128140;</td>
                            <td>&#128152;</td>
                            <td>&#128157;</td>
                            <td>&#128150;</td>
                            <td>&#128151;</td>
                            <td>&#128147;</td>
                        </tr>
                        <tr>
                            <td>&#128158;</td>
                            <td>&#128149;</td>
                            <td>&#128159;</td>
                            <td>&#10083;</td>
                            <td>&#128148;</td>
                            <td>&#10084;</td>
                            <td>&#129505;</td>
                            <td>&#128155;</td>
                        </tr>
                        <tr>
                            <td>&#128154;</td>
                            <td>&#128153;</td>
                            <td>&#128156;</td>
                            <td>&#128420;</td>
                            <td>&#128175;</td>
                            <td>&#128162;</td>
                            <td>&#128165;</td>
                            <td>&#128171;</td>
                        </tr>
                        <tr>
                            <td>&#128166;</td>
                            <td>&#128168;</td>
                            <td>&#128371;</td>
                            <td>&#128163;</td>
                            <td>&#128172;</td>
                            <td>&#128065;</td>
                            <td>&#128488;</td>
                            <td>&#128495;</td>
                        </tr>
                        <tr>
                            <td>&#128173;</td>
                            <td>&#128164;</td>
                            <td>&#128133;</td>
                            <td>&#129331;</td>
                            <td>&#128170;</td>
                            <td>&#129461;</td>
                            <td>&#129462;</td>
                            <td>&#128066;</td>
                        </tr>
                        <tr>
                            <td>&#128067;</td>
                            <td>&#129504;</td>
                            <td>&#129463;</td>
                            <td>&#129460;</td>
                            <td>&#128064;</td>
                            <td>&#128069;</td>
                            <td>&#128068;</td>
                            <td>&#128118;</td>
                        </tr>
                        <tr>
                            <td>&#129490;</td>
                            <td>&#128102;</td>
                            <td>&#128103;</td>
                            <td>&#129489;</td>
                            <td>&#128113;</td>
                            <td>&#128104;</td>
                            <td>&#129492;</td>
                            <td>&#129491;</td>
                        </tr>
                        <tr>
                            <td>&#128116;</td>
                            <td>&#128117;</td>
                            <td>&#128589;</td>
                            <td>&#128590;</td>
                            <td>&#128581;</td>
                            <td>&#128582;</td>
                            <td>&#128129;</td>
                            <td>&#128587;</td>
                        </tr>
                        <tr>
                            <td>&#128583;</td>
                            <td>&#129318;</td>
                            <td>&#129335;</td>
                            <td>&#128105;</td>
                            <td>&#128110;</td>
                            <td>&#128373;</td>
                            <td>&#128130;</td>
                            <td>&#128119;</td>
                        </tr>
                        <tr>
                            <td>&#129332;</td>
                            <td>&#128120;</td>
                            <td>&#128115;</td>
                            <td>&#128114;</td>
                            <td>&#129493;</td>
                            <td>&#129333;</td>
                            <td>&#128112;</td>
                            <td>&#129328;</td>
                        </tr>
                        <tr>
                            <td>&#129329;</td>
                            <td>&#128124;</td>
                            <td>&#127877;</td>
                            <td>&#129334;</td>
                            <td>&#129464;</td>
                            <td>&#129465;</td>
                            <td>&#129497;</td>
                            <td>&#129498;</td>
                        </tr>
                        <tr>
                            <td>&#129499;</td>
                            <td>&#129500;</td>
                            <td>&#129501;</td>
                            <td>&#129502;</td>
                            <td>&#129503;</td>
                            <td>&#128134;</td>
                            <td>&#128135;</td>
                            <td>&#128694;</td>
                        </tr>
                        <tr>
                            <td>&#127939;</td>
                            <td>&#128131;</td>
                            <td>&#128378;</td>
                            <td>&#128372;</td>
                            <td>&#128111;</td>
                            <td>&#129494;</td>
                            <td>&#129495;</td>
                            <td>&#129338;</td>
                        </tr>
                        <tr>
                            <td>&#127943;</td>
                            <td>&#9975;</td>
                            <td>&#127938;</td>
                            <td>&#127948;</td>
                            <td>&#127940;</td>
                            <td>&#128675;</td>
                            <td>&#127946;</td>
                            <td>&#9977;</td>
                        </tr>
                        <tr>
                            <td>&#127947;</td>
                            <td>&#128692;</td>
                            <td>&#128693;</td>
                            <td>&#129336;</td>
                            <td>&#129340;</td>
                            <td>&#129341;</td>
                            <td>&#129342;</td>
                            <td>&#129337;</td>
                        </tr>
                        <tr>
                            <td>&#129496;</td>
                            <td>&#128704;</td>
                            <td>&#128716;</td>
                            <td>&#128109;</td>
                            <td>&#128107;</td>
                            <td>&#128108;</td>
                            <td>&#128143;</td>
                            <td>&#128145;</td>
                        </tr>
                        <tr>
                            <td>&#128483;</td>
                            <td>&#128100;</td>
                            <td>&#127975;</td>
                            <td>&#128686;</td>
                            <td>&#128688;</td>
                            <td>&#9855;</td>
                            <td>&#128697;</td>
                            <td>&#128698;</td>
                        </tr>
                        <tr>
                            <td>&#128699;</td>
                            <td>&#128700;</td>
                            <td>&#128702;</td>
                            <td>&#128706;</td>
                            <td>&#128707;</td>
                            <td>&#128708;</td>
                            <td>&#128709;</td>
                            <td>&#9888;</td>
                        </tr>
                        <tr>
                            <td>&#128696;</td>
                            <td>&#9940;</td>
                            <td>&#128683;</td>
                            <td>&#128691;</td>
                            <td>&#128685;</td>
                            <td>&#128687;</td>
                            <td>&#128689;</td>
                            <td>&#128695;</td>
                        </tr>
                        <tr>
                            <td>&#128245;</td>
                            <td>&#128286;</td>
                            <td>&#9762;</td>
                            <td>&#9763;</td>
                            <td>&#11014;</td>
                            <td>&#8599;</td>
                            <td>&#10145;</td>
                            <td>&#8600;</td>
                        </tr>
                        <tr>
                            <td>&#11015;</td>
                            <td>&#8601;</td>
                            <td>&#11013;</td>
                            <td>&#8598;</td>
                            <td>&#8597;</td>
                            <td>&#8596;</td>
                            <td>&#8617;</td>
                            <td>&#8618;</td>
                        </tr>
                        <tr>
                            <td>&#10548;</td>
                            <td>&#10549;</td>
                            <td>&#128259;</td>
                            <td>&#128260;</td>
                            <td>&#128281;</td>
                            <td>&#128282;</td>
                            <td>&#128283;</td>
                            <td>&#128284;</td>
                        </tr>
                        <tr>
                            <td>&#128285;</td>
                            <td>&#128720;</td>
                            <td>&#9883;</td>
                            <td>&#128329;</td>
                            <td>&#10017;</td>
                            <td>&#9784;</td>
                            <td>&#9775;</td>
                            <td>&#10013;</td>
                        </tr>
                        <tr>
                            <td>&#9766;</td>
                            <td>&#9770;</td>
                            <td>&#9774;</td>
                            <td>&#128334;</td>
                            <td>&#128303;</td>
                            <td>&#9800;</td>
                            <td>&#9801;</td>
                            <td>&#9802;</td>
                        </tr>
                        <tr>
                            <td>&#9803;</td>
                            <td>&#9804;</td>
                            <td>&#9805;</td>
                            <td>&#9806;</td>
                            <td>&#9807;</td>
                            <td>&#9808;</td>
                            <td>&#9809;</td>
                            <td>&#9810;</td>
                        </tr>
                        <tr>
                            <td>&#9811;</td>
                            <td>&#9934;</td>
                            <td>&#128256;</td>
                            <td>&#128257;</td>
                            <td>&#128258;</td>
                            <td>&#9654;</td>
                            <td>&#9193;</td>
                            <td>&#9197;</td>
                        </tr>
                        <tr>
                            <td>&#9199;</td>
                            <td>&#9664;</td>
                            <td>&#9194;</td>
                            <td>&#9198;</td>
                            <td>&#128316;</td>
                            <td>&#9195;</td>
                            <td>&#128317;</td>
                            <td>&#9196;</td>
                        </tr>
                        <tr>
                            <td>&#9208;</td>
                            <td>&#9209;</td>
                            <td>&#9210;</td>
                            <td>&#9167;</td>
                            <td>&#127910;</td>
                            <td>&#128261;</td>
                            <td>&#128262;</td>
                            <td>&#128246;</td>
                        </tr>
                        <tr>
                            <td>&#128243;</td>
                            <td>&#128244;</td>
                            <td>&#9792;</td>
                            <td>&#9794;</td>
                            <td>&#9877;</td>
                            <td>&#9854;</td>
                            <td>&#9851;</td>
                            <td>&#9884;</td>
                        </tr>
                        <tr>
                            <td>&#128305;</td>
                            <td>&#128219;</td>
                            <td>&#128304;</td>
                            <td>&#11093;</td>
                            <td>&#9989;</td>
                            <td>&#9745;</td>
                            <td>&#10004;</td>
                            <td>&#10006;</td>
                        </tr>
                        <tr>
                            <td>&#10060;</td>
                            <td>&#10062;</td>
                            <td>&#10133;</td>
                            <td>&#10134;</td>
                            <td>&#10135;</td>
                            <td>&#10160;</td>
                            <td>&#10175;</td>
                            <td>&#12349;</td>
                        </tr>
                        <tr>
                            <td>&#10035;</td>
                            <td>&#10036;</td>
                            <td>&#10055;</td>
                            <td>&#8252;</td>
                            <td>&#8265;</td>
                            <td>&#10067;</td>
                            <td>&#10068;</td>
                            <td>&#10069;</td>
                        </tr>
                        <tr>
                            <td>&#10071;</td>
                            <td>&#12336;</td>
                            <td>&#169;</td>
                            <td>&#174;</td>
                            <td>&#8482;</td>
                            <td>&#35;</td>
                            <td>&#42;</td>
                            <td>&#48;</td>
                        </tr>
                        <tr>
                            <td>&#49;</td>
                            <td>&#50;</td>
                            <td>&#51;</td>
                            <td>&#52;</td>
                            <td>&#53;</td>
                            <td>&#54;</td>
                            <td>&#55;</td>
                            <td>&#56;</td>
                        </tr>
                        <tr>
                            <td>&#57;</td>
                            <td>&#128287;</td>
                            <td>&#128288;</td>
                            <td>&#128289;</td>
                            <td>&#128290;</td>
                            <td>&#128291;</td>
                            <td>&#128292;</td>
                            <td>&#127344;</td>
                        </tr>
                        <tr>
                            <td>&#127374;</td>
                            <td>&#127345;</td>
                            <td>&#127377;</td>
                            <td>&#127378;</td>
                            <td>&#127379;</td>
                            <td>&#8505;</td>
                            <td>&#127380;</td>
                            <td>&#9410;</td>
                        </tr>
                        <tr>
                            <td>&#127381;</td>
                            <td>&#127382;</td>
                            <td>&#127358;</td>
                            <td>&#127383;</td>
                            <td>&#127359;</td>
                            <td>&#127384;</td>
                            <td>&#127385;</td>
                            <td>&#127386;</td>
                        </tr>
                        <tr>
                            <td>&#127489;</td>
                            <td>&#127490;</td>
                            <td>&#127543;</td>
                            <td>&#127542;</td>
                            <td>&#127535;</td>
                            <td>&#127568;</td>
                            <td>&#127545;</td>
                            <td>&#127514;</td>
                        </tr>
                        <tr>
                            <td>&#127538;</td>
                            <td>&#127569;</td>
                            <td>&#127544;</td>
                            <td>&#127540;</td>
                            <td>&#127539;</td>
                            <td>&#12951;</td>
                            <td>&#12953;</td>
                            <td>&#127546;</td>
                        </tr>
                        <tr>
                            <td>&#127541;</td>
                            <td>&#128308;</td>
                            <td>&#128309;</td>
                            <td>&#9898;</td>
                            <td>&#9899;</td>
                            <td>&#11036;</td>
                            <td>&#11035;</td>
                            <td>&#9724;</td>
                        </tr>
                        <tr>
                            <td>&#9723;</td>
                            <td>&#9725;</td>
                            <td>&#9726;</td>
                            <td>&#9643;</td>
                            <td>&#9642;</td>
                            <td>&#128310;</td>
                            <td>&#128311;</td>
                            <td>&#128312;</td>
                        </tr>
                        <tr>
                            <td>&#128313;</td>
                            <td>&#128314;</td>
                            <td>&#128315;</td>
                            <td>&#128160;</td>
                            <td>&#128280;</td>
                            <td>&#128306;</td>
                            <td>&#128307;</td>
                            <td>&#128083;</td>
                        </tr>
                        <tr>
                            <td>&#128374;</td>
                            <td>&#129405;</td>
                            <td>&#129404;</td>
                            <td>&#128084;</td>
                            <td>&#128085;</td>
                            <td>&#128086;</td>
                            <td>&#129507;</td>
                            <td>&#129508;</td>
                        </tr>
                        <tr>
                            <td>&#129509;</td>
                            <td>&#129510;</td>
                            <td>&#128087;</td>
                            <td>&#128088;</td>
                            <td>&#128089;</td>
                            <td>&#128090;</td>
                            <td>&#128091;</td>
                            <td>&#128092;</td>
                        </tr>
                        <tr>
                            <td>&#128093;</td>
                            <td>&#128717;</td>
                            <td>&#127890;</td>
                            <td>&#128094;</td>
                            <td>&#128095;</td>
                            <td>&#129406;</td>
                            <td>&#129407;</td>
                            <td>&#128096;</td>
                        </tr>
                        <tr>
                            <td>&#128097;</td>
                            <td>&#128098;</td>
                            <td>&#128081;</td>
                            <td>&#128082;</td>
                            <td>&#127913;</td>
                            <td>&#127891;</td>
                            <td>&#129506;</td>
                            <td>&#9937;</td>
                        </tr>
                        <tr>
                            <td>&#128255;</td>
                            <td>&#128132;</td>
                            <td>&#128141;</td>
                            <td>&#128142;</td>
                            <td>&#128263;</td>
                            <td>&#128264;</td>
                            <td>&#128265;</td>
                            <td>&#128266;</td>
                        </tr>
                        <tr>
                            <td>&#128226;</td>
                            <td>&#128227;</td>
                            <td>&#128239;</td>
                            <td>&#128276;</td>
                            <td>&#128277;</td>
                            <td>&#127932;</td>
                            <td>&#127925;</td>
                            <td>&#127926;</td>
                        </tr>
                        <tr>
                            <td>&#127897;</td>
                            <td>&#127898;</td>
                            <td>&#127899;</td>
                            <td>&#127908;</td>
                            <td>&#127911;</td>
                            <td>&#128251;</td>
                            <td>&#127927;</td>
                            <td>&#127928;</td>
                        </tr>
                        <tr>
                            <td>&#127929;</td>
                            <td>&#127930;</td>
                            <td>&#127931;</td>
                            <td>&#129345;</td>
                            <td>&#128241;</td>
                            <td>&#128242;</td>
                            <td>&#9742;</td>
                            <td>&#128222;</td>
                        </tr>
                        <tr>
                            <td>&#128223;</td>
                            <td>&#128224;</td>
                            <td>&#128267;</td>
                            <td>&#128268;</td>
                            <td>&#128187;</td>
                            <td>&#128421;</td>
                            <td>&#128424;</td>
                            <td>&#9000;</td>
                        </tr>
                        <tr>
                            <td>&#128433;</td>
                            <td>&#128434;</td>
                            <td>&#128189;</td>
                            <td>&#128190;</td>
                            <td>&#128191;</td>
                            <td>&#128192;</td>
                            <td>&#129518;</td>
                            <td>&#127909;</td>
                        </tr>
                        <tr>
                            <td>&#127902;</td>
                            <td>&#128253;</td>
                            <td>&#127916;</td>
                            <td>&#128250;</td>
                            <td>&#128247;</td>
                            <td>&#128248;</td>
                            <td>&#128249;</td>
                            <td>&#128252;</td>
                        </tr>
                        <tr>
                            <td>&#128269;</td>
                            <td>&#128270;</td>
                            <td>&#128367;</td>
                            <td>&#128161;</td>
                            <td>&#128294;</td>
                            <td>&#127982;</td>
                            <td>&#128212;</td>
                            <td>&#128213;</td>
                        </tr>
                        <tr>
                            <td>&#128214;</td>
                            <td>&#128215;</td>
                            <td>&#128216;</td>
                            <td>&#128217;</td>
                            <td>&#128218;</td>
                            <td>&#128211;</td>
                            <td>&#128210;</td>
                            <td>&#128195;</td>
                        </tr>
                        <tr>
                            <td>&#128220;</td>
                            <td>&#128196;</td>
                            <td>&#128240;</td>
                            <td>&#128478;</td>
                            <td>&#128209;</td>
                            <td>&#128278;</td>
                            <td>&#127991;</td>
                            <td>&#128176;</td>
                        </tr>
                        <tr>
                            <td>&#128180;</td>
                            <td>&#128181;</td>
                            <td>&#128182;</td>
                            <td>&#128183;</td>
                            <td>&#128184;</td>
                            <td>&#128179;</td>
                            <td>&#129534;</td>
                            <td>&#128185;</td>
                        </tr>
                        <tr>
                            <td>&#128177;</td>
                            <td>&#128178;</td>
                            <td>&#9993;</td>
                            <td>&#128231;</td>
                            <td>&#128232;</td>
                            <td>&#128233;</td>
                            <td>&#128228;</td>
                            <td>&#128229;</td>
                        </tr>
                        <tr>
                            <td>&#128230;</td>
                            <td>&#128235;</td>
                            <td>&#128234;</td>
                            <td>&#128236;</td>
                            <td>&#128237;</td>
                            <td>&#128238;</td>
                            <td>&#128499;</td>
                            <td>&#9999;</td>
                        </tr>
                        <tr>
                            <td>&#10002;</td>
                            <td>&#128395;</td>
                            <td>&#128394;</td>
                            <td>&#128396;</td>
                            <td>&#128397;</td>
                            <td>&#128221;</td>
                            <td>&#128188;</td>
                            <td>&#128193;</td>
                        </tr>
                        <tr>
                            <td>&#128194;</td>
                            <td>&#128450;</td>
                            <td>&#128197;</td>
                            <td>&#128198;</td>
                            <td>&#128466;</td>
                            <td>&#128467;</td>
                            <td>&#128199;</td>
                            <td>&#128200;</td>
                        </tr>
                        <tr>
                            <td>&#128201;</td>
                            <td>&#128202;</td>
                            <td>&#128203;</td>
                            <td>&#128204;</td>
                            <td>&#128205;</td>
                            <td>&#128206;</td>
                            <td>&#128391;</td>
                            <td>&#128207;</td>
                        </tr>
                        <tr>
                            <td>&#128208;</td>
                            <td>&#9986;</td>
                            <td>&#128451;</td>
                            <td>&#128452;</td>
                            <td>&#128465;</td>
                            <td>&#128274;</td>
                            <td>&#128275;</td>
                            <td>&#128271;</td>
                        </tr>
                        <tr>
                            <td>&#128272;</td>
                            <td>&#128273;</td>
                            <td>&#128477;</td>
                            <td>&#128296;</td>
                            <td>&#9935;</td>
                            <td>&#9874;</td>
                            <td>&#128736;</td>
                            <td>&#128481;</td>
                        </tr>
                        <tr>
                            <td>&#9876;</td>
                            <td>&#128299;</td>
                            <td>&#127993;</td>
                            <td>&#128737;</td>
                            <td>&#128295;</td>
                            <td>&#128297;</td>
                            <td>&#9881;</td>
                            <td>&#128476;</td>
                        </tr>
                        <tr>
                            <td>&#9878;</td>
                            <td>&#128279;</td>
                            <td>&#9939;</td>
                            <td>&#129520;</td>
                            <td>&#129522;</td>
                            <td>&#9879;</td>
                            <td>&#129514;</td>
                            <td>&#129515;</td>
                        </tr>
                        <tr>
                            <td>&#129516;</td>
                            <td>&#128300;</td>
                            <td>&#128301;</td>
                            <td>&#128225;</td>
                            <td>&#128137;</td>
                            <td>&#128138;</td>
                            <td>&#128682;</td>
                            <td>&#128719;</td>
                        </tr>
                        <tr>
                            <td>&#128715;</td>
                            <td>&#128701;</td>
                            <td>&#128703;</td>
                            <td>&#128705;</td>
                            <td>&#129524;</td>
                            <td>&#129527;</td>
                            <td>&#129529;</td>
                            <td>&#129530;</td>
                        </tr>
                        <tr>
                            <td>&#129531;</td>
                            <td>&#129532;</td>
                            <td>&#129533;</td>
                            <td>&#129519;</td>
                            <td>&#128722;</td>
                            <td>&#128684;</td>
                            <td>&#9904;</td>
                            <td>&#9905;</td>
                        </tr>
                        <tr>
                            <td>&#128511;</td>
                            <td>&#8381;</td>
                            <td>&#8376;</td>
                            <td>&yen;</td>
                            <td>&euro;</td>
                            <td>&#36;</td>
                            <td>&cent;</td>
                            <td>&pound;</td>
                        </tr>
                        <tr>
                            <td>&#8377;</td>
                            <td>&#8372;</td>
                            <td>&spades;</td>
                            <td>&clubs;</td>
                            <td>&hearts;</td>
                            <td>&diams;</td>
                            <td>&#127875;</td>
                            <td>&#127876;</td>
                        </tr>
                        <tr>
                            <td>&#127878;</td>
                            <td>&#127879;</td>
                            <td>&#129512;</td>
                            <td>&#10024;</td>
                            <td>&#127880;</td>
                            <td>&#127881;</td>
                            <td>&#127882;</td>
                            <td>&#127883;</td>
                        </tr>
                        <tr>
                            <td>&#127885;</td>
                            <td>&#127886;</td>
                            <td>&#127887;</td>
                            <td>&#127888;</td>
                            <td>&#127889;</td>
                            <td>&#129511;</td>
                            <td>&#127872;</td>
                            <td>&#127873;</td>
                        </tr>
                        <tr>
                            <td>&#127895;</td>
                            <td>&#127903;</td>
                            <td>&#127915;</td>
                            <td>&#127894;</td>
                            <td>&#127942;</td>
                            <td>&#127941;</td>
                            <td>&#129351;</td>
                            <td>&#129352;</td>
                        </tr>
                        <tr>
                            <td>&#129353;</td>
                            <td>&#9917;</td>
                            <td>&#9918;</td>
                            <td>&#129358;</td>
                            <td>&#127936;</td>
                            <td>&#127952;</td>
                            <td>&#127944;</td>
                            <td>&#127945;</td>
                        </tr>
                        <tr>
                            <td>&#127934;</td>
                            <td>&#129359;</td>
                            <td>&#127923;</td>
                            <td>&#127951;</td>
                            <td>&#127953;</td>
                            <td>&#127954;</td>
                            <td>&#129357;</td>
                            <td>&#127955;</td>
                        </tr>
                        <tr>
                            <td>&#127992;</td>
                            <td>&#129354;</td>
                            <td>&#129355;</td>
                            <td>&#129349;</td>
                            <td>&#9971;</td>
                            <td>&#9976;</td>
                            <td>&#127907;</td>
                            <td>&#127933;</td>
                        </tr>
                        <tr>
                            <td>&#127935;</td>
                            <td>&#128759;</td>
                            <td>&#129356;</td>
                            <td>&#127919;</td>
                            <td>&#127921;</td>
                            <td>&#128302;</td>
                            <td>&#129535;</td>
                            <td>&#127918;</td>
                        </tr>
                        <tr>
                            <td>&#128377;</td>
                            <td>&#127920;</td>
                            <td>&#127922;</td>
                            <td>&#129513;</td>
                            <td>&#129528;</td>
                            <td>&#9823;</td>
                            <td>&#127183;</td>
                            <td>&#126980;</td>
                        </tr>
                        <tr>
                            <td>&#127924;</td>
                            <td>&#127917;</td>
                            <td>&#128444;</td>
                            <td>&#127912;</td>
                            <td>&#129525;</td>
                            <td>&#129526;</td>
                            <td>&#127937;</td>
                            <td>&#128681;</td>
                        </tr>
                        <tr>
                            <td>&#127884;</td>
                            <td>&#127988;</td>
                            <td>&#65039;&#8205;&#127752;</td>
                            <td>&#127987;</td>
                            <td>&#128144;</td>
                            <td>&#127800;</td>
                            <td>&#128174;</td>
                            <td>&#127989;</td>
                        </tr>
                        <tr>
                            <td>&#127801;</td>
                            <td>&#129344;</td>
                            <td>&#127802;</td>
                            <td>&#127803;</td>
                            <td>&#127804;</td>
                            <td>&#127799;</td>
                            <td>&#127793;</td>
                            <td>&#127794;</td>
                        </tr>
                        <tr>
                            <td>&#127795;</td>
                            <td>&#127796;</td>
                            <td>&#127797;</td>
                            <td>&#127806;</td>
                            <td>&#127807;</td>
                            <td>&#9752;</td>
                            <td>&#127808;</td>
                            <td>&#127809;</td>
                        </tr>
                        <tr>
                            <td>&#127810;</td>
                            <td>&#127811;</td>
                            <td>&#127761;</td>
                            <td>&#127762;</td>
                            <td>&#127763;</td>
                            <td>&#127764;</td>
                            <td>&#127765;</td>
                            <td>&#127766;</td>
                        </tr>
                        <tr>
                            <td>&#127767;</td>
                            <td>&#127768;</td>
                            <td>&#127769;</td>
                            <td>&#127770;</td>
                            <td>&#127771;</td>
                            <td>&#127772;</td>
                            <td>&#127777;</td>
                            <td>&#9728;</td>
                        </tr>
                        <tr>
                            <td>&#127773;</td>
                            <td>&#127774;</td>
                            <td>&#11088;</td>
                            <td>&#127775;</td>
                            <td>&#127776;</td>
                            <td>&#9729;</td>
                            <td>&#9925;</td>
                            <td>&#9928;</td>
                        </tr>
                        <tr>
                            <td>&#127780;</td>
                            <td>&#127781;</td>
                            <td>&#127782;</td>
                            <td>&#127783;</td>
                            <td>&#127784;</td>
                            <td>&#127785;</td>
                            <td>&#127786;</td>
                            <td>&#127787;</td>
                        </tr>
                        <tr>
                            <td>&#127788;</td>
                            <td>&#127744;</td>
                            <td>&#127752;</td>
                            <td>&#127746;</td>
                            <td>&#9730;</td>
                            <td>&#9748;</td>
                            <td>&#9969;</td>
                            <td>&#9889;</td>
                        </tr>
                        <tr>
                            <td>&#10052;</td>
                            <td>&#9731;</td>
                            <td>&#9924;</td>
                            <td>&#9732;</td>
                            <td>&#128293;</td>
                            <td>&#128167;</td>
                            <td>&#127754;</td>
                            <td>&#128053;</td>
                        </tr>
                        <tr>
                            <td>&#128018;</td>
                            <td>&#129421;</td>
                            <td>&#128054;</td>
                            <td>&#128021;</td>
                            <td>&#128041;</td>
                            <td>&#128058;</td>
                            <td>&#129418;</td>
                            <td>&#129437;</td>
                        </tr>
                        <tr>
                            <td>&#128049;</td>
                            <td>&#128008;</td>
                            <td>&#129409;</td>
                            <td>&#128047;</td>
                            <td>&#128005;</td>
                            <td>&#128006;</td>
                            <td>&#128052;</td>
                            <td>&#128014;</td>
                        </tr>
                        <tr>
                            <td>&#129412;</td>
                            <td>&#129427;</td>
                            <td>&#129420;</td>
                            <td>&#128046;</td>
                            <td>&#128002;</td>
                            <td>&#128003;</td>
                            <td>&#128004;</td>
                            <td>&#128055;</td>
                        </tr>
                        <tr>
                            <td>&#128022;</td>
                            <td>&#128023;</td>
                            <td>&#128061;</td>
                            <td>&#128015;</td>
                            <td>&#128017;</td>
                            <td>&#128016;</td>
                            <td>&#128042;</td>
                            <td>&#128043;</td>
                        </tr>
                        <tr>
                            <td>&#129433;</td>
                            <td>&#129426;</td>
                            <td>&#128024;</td>
                            <td>&#129423;</td>
                            <td>&#129435;</td>
                            <td>&#128045;</td>
                            <td>&#128001;</td>
                            <td>&#128000;</td>
                        </tr>
                        <tr>
                            <td>&#128057;</td>
                            <td>&#128048;</td>
                            <td>&#128007;</td>
                            <td>&#128063;</td>
                            <td>&#129428;</td>
                            <td>&#129415;</td>
                            <td>&#128059;</td>
                            <td>&#128040;</td>
                        </tr>
                        <tr>
                            <td>&#128060;</td>
                            <td>&#129432;</td>
                            <td>&#129441;</td>
                            <td>&#128062;</td>
                            <td>&#129411;</td>
                            <td>&#128020;</td>
                            <td>&#128019;</td>
                            <td>&#128035;</td>
                        </tr>
                        <tr>
                            <td>&#128036;</td>
                            <td>&#128037;</td>
                            <td>&#128038;</td>
                            <td>&#128039;</td>
                            <td>&#128330;</td>
                            <td>&#129413;</td>
                            <td>&#129414;</td>
                            <td>&#129442;</td>
                        </tr>
                        <tr>
                            <td>&#129417;</td>
                            <td>&#129434;</td>
                            <td>&#129436;</td>
                            <td>&#128056;</td>
                            <td>&#128010;</td>
                            <td>&#128034;</td>
                            <td>&#129422;</td>
                            <td>&#128013;</td>
                        </tr>
                        <tr>
                            <td>&#128050;</td>
                            <td>&#128009;</td>
                            <td>&#129429;</td>
                            <td>&#129430;</td>
                            <td>&#128051;</td>
                            <td>&#128011;</td>
                            <td>&#128044;</td>
                            <td>&#128031;</td>
                        </tr>
                        <tr>
                            <td>&#128032;</td>
                            <td>&#128033;</td>
                            <td>&#129416;</td>
                            <td>&#128025;</td>
                            <td>&#128026;</td>
                            <td>&#128012;</td>
                            <td>&#129419;</td>
                            <td>&#128027;</td>
                        </tr>
                        <tr>
                            <td>&#128028;</td>
                            <td>&#128029;</td>
                            <td>&#128030;</td>
                            <td>&#129431;</td>
                            <td>&#128375;</td>
                            <td>&#128376;</td>
                            <td>&#129410;</td>
                            <td>&#129439;</td>
                        </tr>
                        <tr>
                            <td>&#129440;</td>
                            <td>&#127815;</td>
                            <td>&#127816;</td>
                            <td>&#127817;</td>
                            <td>&#127818;</td>
                            <td>&#127819;</td>
                            <td>&#127820;</td>
                            <td>&#127821;</td>
                        </tr>
                        <tr>
                            <td>&#129389;</td>
                            <td>&#127822;</td>
                            <td>&#127823;</td>
                            <td>&#127824;</td>
                            <td>&#127825;</td>
                            <td>&#127826;</td>
                            <td>&#127827;</td>
                            <td>&#129373;</td>
                        </tr>
                        <tr>
                            <td>&#127813;</td>
                            <td>&#129381;</td>
                            <td>&#129361;</td>
                            <td>&#127814;</td>
                            <td>&#129364;</td>
                            <td>&#129365;</td>
                            <td>&#127805;</td>
                            <td>&#127798;</td>
                        </tr>
                        <tr>
                            <td>&#129362;</td>
                            <td>&#129388;</td>
                            <td>&#129382;</td>
                            <td>&#127812;</td>
                            <td>&#129372;</td>
                            <td>&#127792;</td>
                            <td>&#127838;</td>
                            <td>&#129360;</td>
                        </tr>
                        <tr>
                            <td>&#129366;</td>
                            <td>&#129384;</td>
                            <td>&#129391;</td>
                            <td>&#129374;</td>
                            <td>&#129472;</td>
                            <td>&#127830;</td>
                            <td>&#127831;</td>
                            <td>&#129385;</td>
                        </tr>
                        <tr>
                            <td>&#129363;</td>
                            <td>&#127828;</td>
                            <td>&#127839;</td>
                            <td>&#127829;</td>
                            <td>&#127789;</td>
                            <td>&#129386;</td>
                            <td>&#127790;</td>
                            <td>&#127791;</td>
                        </tr>
                        <tr>
                            <td>&#129369;</td>
                            <td>&#129370;</td>
                            <td>&#127859;</td>
                            <td>&#129368;</td>
                            <td>&#127858;</td>
                            <td>&#129379;</td>
                            <td>&#129367;</td>
                            <td>&#127871;</td>
                        </tr>
                        <tr>
                            <td>&#129474;</td>
                            <td>&#129387;</td>
                            <td>&#127857;</td>
                            <td>&#127832;</td>
                            <td>&#127833;</td>
                            <td>&#127834;</td>
                            <td>&#127835;</td>
                            <td>&#127836;</td>
                        </tr>
                        <tr>
                            <td>&#127837;</td>
                            <td>&#127840;</td>
                            <td>&#127842;</td>
                            <td>&#127843;</td>
                            <td>&#127844;</td>
                            <td>&#127845;</td>
                            <td>&#129390;</td>
                            <td>&#127841;</td>
                        </tr>
                        <tr>
                            <td>&#129375;</td>
                            <td>&#129376;</td>
                            <td>&#129377;</td>
                            <td>&#129408;</td>
                            <td>&#129438;</td>
                            <td>&#129424;</td>
                            <td>&#129425;</td>
                            <td>&#127846;</td>
                        </tr>
                        <tr>
                            <td>&#127847;</td>
                            <td>&#127848;</td>
                            <td>&#127849;</td>
                            <td>&#127850;</td>
                            <td>&#127874;</td>
                            <td>&#127856;</td>
                            <td>&#129473;</td>
                            <td>&#129383;</td>
                        </tr>
                        <tr>
                            <td>&#127851;</td>
                            <td>&#127852;</td>
                            <td>&#127853;</td>
                            <td>&#127854;</td>
                            <td>&#127855;</td>
                            <td>&#127868;</td>
                            <td>&#129371;</td>
                            <td>&#9749;</td>
                        </tr>
                        <tr>
                            <td>&#127861;</td>
                            <td>&#127862;</td>
                            <td>&#127870;</td>
                            <td>&#127863;</td>
                            <td>&#127864;</td>
                            <td>&#127865;</td>
                            <td>&#127866;</td>
                            <td>&#127867;</td>
                        </tr>
                        <tr>
                            <td>&#129346;</td>
                            <td>&#129347;</td>
                            <td>&#129380;</td>
                            <td>&#129378;</td>
                            <td>&#127869;</td>
                            <td>&#127860;</td>
                            <td>&#129348;</td>
                            <td>&#128298;</td>
                        </tr>
                        <tr>
                            <td>&#127994;</td>
                            <td>&#127757;</td>
                            <td>&#127758;</td>
                            <td>&#127759;</td>
                            <td>&#127760;</td>
                            <td>&#128506;</td>
                            <td>&#128510;</td>
                            <td>&#129517;</td>
                        </tr>
                        <tr>
                            <td>&#127956;</td>
                            <td>&#9968;</td>
                            <td>&#127755;</td>
                            <td>&#128507;</td>
                            <td>&#127957;</td>
                            <td>&#127958;</td>
                            <td>&#127964;</td>
                            <td>&#127965;</td>
                        </tr>
                        <tr>
                            <td>&#127966;</td>
                            <td>&#127967;</td>
                            <td>&#127963;</td>
                            <td>&#127959;</td>
                            <td>&#129521;</td>
                            <td>&#127960;</td>
                            <td>&#127962;</td>
                            <td>&#127968;</td>
                        </tr>
                        <tr>
                            <td>&#127969;</td>
                            <td>&#127970;</td>
                            <td>&#127971;</td>
                            <td>&#127972;</td>
                            <td>&#127973;</td>
                            <td>&#127974;</td>
                            <td>&#127976;</td>
                            <td>&#127977;</td>
                        </tr>
                        <tr>
                            <td>&#127978;</td>
                            <td>&#127979;</td>
                            <td>&#127980;</td>
                            <td>&#127981;</td>
                            <td>&#127983;</td>
                            <td>&#127984;</td>
                            <td>&#128146;</td>
                            <td>&#128508;</td>
                        </tr>
                        <tr>
                            <td>&#128509;</td>
                            <td>&#9962;</td>
                            <td>&#128332;</td>
                            <td>&#128333;</td>
                            <td>&#9961;</td>
                            <td>&#128331;</td>
                            <td>&#9970;</td>
                            <td>&#9978;</td>
                        </tr>
                        <tr>
                            <td>&#127745;</td>
                            <td>&#127747;</td>
                            <td>&#127961;</td>
                            <td>&#127748;</td>
                            <td>&#127749;</td>
                            <td>&#127750;</td>
                            <td>&#127751;</td>
                            <td>&#127753;</td>
                        </tr>
                        <tr>
                            <td>&#9832;</td>
                            <td>&#127756;</td>
                            <td>&#127904;</td>
                            <td>&#127905;</td>
                            <td>&#127906;</td>
                            <td>&#128136;</td>
                            <td>&#127914;</td>
                            <td>&#128642;</td>
                        </tr>
                        <tr>
                            <td>&#128643;</td>
                            <td>&#128644;</td>
                            <td>&#128645;</td>
                            <td>&#128646;</td>
                            <td>&#128647;</td>
                            <td>&#128648;</td>
                            <td>&#128649;</td>
                            <td>&#128650;</td>
                        </tr>
                        <tr>
                            <td>&#128669;</td>
                            <td>&#128670;</td>
                            <td>&#128651;</td>
                            <td>&#128652;</td>
                            <td>&#128653;</td>
                            <td>&#128654;</td>
                            <td>&#128656;</td>
                            <td>&#128657;</td>
                        </tr>
                        <tr>
                            <td>&#128658;</td>
                            <td>&#128659;</td>
                            <td>&#128660;</td>
                            <td>&#128661;</td>
                            <td>&#128662;</td>
                            <td>&#128663;</td>
                            <td>&#128664;</td>
                            <td>&#128665;</td>
                        </tr>
                        <tr>
                            <td>&#128666;</td>
                            <td>&#128667;</td>
                            <td>&#128668;</td>
                            <td>&#127950;</td>
                            <td>&#127949;</td>
                            <td>&#128757;</td>
                            <td>&#128690;</td>
                            <td>&#128756;</td>
                        </tr>
                        <tr>
                            <td>&#128761;</td>
                            <td>&#128655;</td>
                            <td>&#128739;</td>
                            <td>&#128740;</td>
                            <td>&#128738;</td>
                            <td>&#9981;</td>
                            <td>&#128680;</td>
                            <td>&#128677;</td>
                        </tr>
                        <tr>
                            <td>&#128678;</td>
                            <td>&#128721;</td>
                            <td>&#128679;</td>
                            <td>&#9875;</td>
                            <td>&#9973;</td>
                            <td>&#128758;</td>
                            <td>&#128676;</td>
                            <td>&#128755;</td>
                        </tr>
                        <tr>
                            <td>&#9972;</td>
                            <td>&#128741;</td>
                            <td>&#128674;</td>
                            <td>&#9992;</td>
                            <td>&#128745;</td>
                            <td>&#128747;</td>
                            <td>&#128748;</td>
                            <td>&#128186;</td>
                        </tr>
                        <tr>
                            <td>&#128641;</td>
                            <td>&#128671;</td>
                            <td>&#128672;</td>
                            <td>&#128673;</td>
                            <td>&#128752;</td>
                            <td>&#128640;</td>
                            <td>&#128760;</td>
                            <td>&#128718;</td>
                        </tr>
                        <tr>
                            <td>&#129523;</td>
                            <td>&#8987;</td>
                            <td>&#9203;</td>
                            <td>&#8986;</td>
                            <td>&#9200;</td>
                            <td>&#9201;</td>
                            <td>&#9202;</td>
                            <td>&#128368;</td>
                        </tr>
                        <tr>
                            <td>&#128347;</td>
                            <td>&#128359;</td>
                            <td>&#128336;</td>
                            <td>&#128348;</td>
                            <td>&#128337;</td>
                            <td>&#128349;</td>
                            <td>&#128338;</td>
                            <td>&#128350;</td>
                        </tr>
                        <tr>
                            <td>&#128339;</td>
                            <td>&#128351;</td>
                            <td>&#128340;</td>
                            <td>&#128352;</td>
                            <td>&#128341;</td>
                            <td>&#128353;</td>
                            <td>&#128342;</td>
                            <td>&#128354;</td>
                        </tr>
                        <tr>
                            <td>&#128343;</td>
                            <td>&#128355;</td>
                            <td>&#128344;</td>
                            <td>&#128356;</td>
                            <td>&#128345;</td>
                            <td>&#128357;</td>
                            <td>&#128346;</td>
                            <td>&#128358;</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`

fileInput.addEventListener("change", (event)=>{
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
                                dataChatSend["comand"] = "send";
                                get();
                                fileInput.value = ""
                                break
                        }
                    }, "file")
                    }
                }, null, null, "Отправить", document.querySelector(".chat-wrapper"))
                // Обработчик события клика по смайликам
                let inputMessagePhotoSend = document.querySelector(".wrapSendPopUp .input-block")
                let emojiPhotoSend = document.querySelector(".wrapSendPopUp .emojiContainer")
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
        if (photoRect.width < window.innerWidth + 20) {
            transformOriginX = "center"
            photo.style.transformOrigin = transformOriginY + " " + transformOriginX
            photo.style.left = "auto"
            photo.style.right = "auto"
        }
        if (photoRect.height < window.innerHeight + 20) {
            transformOriginY = "center"
            photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = "auto"
            photo.style.bottom = "auto"
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
            if (photoRect.width < window.innerWidth + 20) {
                transformOriginX = "center"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.left = "auto"
                photo.style.right = "auto"
            }
            if (photoRect.height < window.innerHeight + 20) {
                transformOriginY = "center"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.top = "auto"
                photo.style.bottom = "auto"
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
            if (photoRect.width < window.innerWidth + 20) {
                transformOriginX = "center"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.left = "auto"
                photo.style.right = "auto"
            }
            if (photoRect.height < window.innerHeight + 20) {
                transformOriginY = "center"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.top = "auto"
                photo.style.bottom = "auto"
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
        if (photoRect.width < window.innerWidth + 20) {
            transformOriginX = "center"
            photo.style.transformOrigin = transformOriginY + " " + transformOriginX
            photo.style.left = "auto"
            photo.style.right = "auto"
        }
        if (photoRect.height < window.innerHeight + 20) {
            transformOriginY = "center"
            photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = "auto"
            photo.style.bottom = "auto"
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

            // Получаем начальные координаты курсора мыши
            startX = event.clientX;
            startY = event.clientY;

            // Получаем начальные координаты фото
            photoX = photo.offsetLeft;
            photoY = photo.offsetTop;
        }
    });

    // Устанавливаем обработчик события на отпускание левой кнопки мыши
    document.addEventListener("mouseup", (event) => {
        // Сбрасываем флаг нажатия левой кнопки мыши
        isMouseDown = false;
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
        const photoRect = photo.getBoundingClientRect();
        if (photoRect.width > window.innerWidth) {
            if (photoRect.left > 0) {
                photo.style.right = "auto"
                transformOriginX = "left"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.left = `0px`;
            }
            if (photoRect.right < window.innerWidth) {
                photo.style.left = "auto"
                transformOriginX = "right"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
                photo.style.right = "0px"
            }
        }
        if (photoRect.height > window.innerHeight){
            if (photoRect.top > 0) {
                photo.style.bottom = "auto"
                transformOriginY = "top"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.top = `0px`;
            }
            if (photoRect.bottom < window.innerHeight) {
                photo.style.top = "auto"
                transformOriginY = "bottom"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.bottom = "0px"

            }
        }
            if (photoRect.width < window.innerWidth) {
                transformOriginX = "center"
                photo.style.transformOrigin = transformOriginY + " " + transformOriginX
                photo.style.left = "auto"
                photo.style.right = "auto"
            }
            if (photoRect.height < window.innerHeight) {
                transformOriginY = "center"
                photo.style.transformOrigin = transformOriginX + " " + transformOriginY
            photo.style.top = "auto"
            photo.style.bottom = "auto"
            }
    });
}

