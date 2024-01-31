let dataChatSend = {"comand": "getChat"}
let messageBlockElement = document.querySelector(".messageBlock")
let emojiContainer = document.querySelector(".emojiContainer")
let inputMessage = document.querySelector(".input-block")
let CaretPosition = 0
let chatDataNew = {}
let chatDataMessage = {}
let lastMessage = {}

function getChat(data) {
    switch (data["result"]) {
        case "getOk":
            chatDataNew = data["message"]
            chatDataNew.forEach(addMessage)
            dataChatSend["lastMessage"] = lastMessage
            dataChatSend["comand"] = "getNewMessage"
            break

        case "sendOK":
            dataChatSend["lastMessage"] = lastMessage
            dataChatSend["comand"] = "getNewMessage"
            get()
            break

        case "regUser":
            createPopUp("input", "Представьтесь", "Для общения в чате введите свой никнейм", ()=>{
                dataChatSend["comand"] = "regUser"
                dataChatSend["name"] = "test"
                get()
            }, "text", "Введите никнейм", "Отправить сообщение", document.querySelector(".chat-wrapper"))
            break

        case "regOK":

            break

        case "error":
            createPopUp("message", "Ошибка", "Произошла какая-то ошибка, наши специалисты уже работают над её устранением", "", "", "", "Ок", document.querySelector(".chat-wrapper"))
            break
    }

}

function addMessage(index) {
    let type = ""
    let data = index
    if(lastMessage["date"] !== data["date"]){
        let currentYear = new Date().getFullYear();

        let monthName
        let date = data["date"].split("-")

        switch (date[1]){
            case "01":
                monthName = "Января"
                break

            case "02":
                monthName = "Февраля"
                break

            case "03":
                monthName = "Марта"
                break

            case "04":
                monthName = "Апреля"
                break

            case "05":
                monthName = "Мая"
                break

            case "06":
                monthName = "Июня"
                break

            case "07":
                monthName = "Июля"
                break

            case "08":
                monthName = "Августа"
                break

            case "09":
                monthName = "Сентября"
                break

            case "10":
                monthName = "Октября"
                break

            case "11":
                monthName = "Ноября"
                break

            case "12":
                monthName = "Декабря"
                break
        }

        if (currentYear != date[0]){
            date = date[2] + " " + monthName + " " + date[0] + "г."
        } else {
            date = date[2] + " " + monthName
        }

        let dataCreate = document.createElement("div")
        dataCreate.classList.add("messageDataWrap")
        dataCreate.innerHTML = `<div class="messageData" id="${data["date"]}">${date}</div>`
        messageBlockElement.insertAdjacentElement("beforeend", dataCreate)
    }
    chatDataMessage[data["messageID"]] = data
    lastMessage["ID"] = data["messageID"]
    lastMessage["date"] = data["date"]
    lastMessage["time"] = data["time"]
    let messageCreate = document.createElement("div")
    messageCreate.classList.add("messageWarp")
    if (data["ReplyMessageID"] !== "" && data["photoSRC"] !== "") {
        type = "photoReply"
    } else if (data["ReplyMessageID"] == "" && data["photoSRC"] !== "") {
        type = "photo"
    } else if (data["ReplyMessageID"] !== "" && data["photoSRC"] == "") {
        type = "reply"
    } else {
        type = "message"
    }
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
      </div>`
            break

        case "photoReply":
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
         <div class="username">
    <p>
        ${data["name"]}
    </p>
    <div class="replyWrap">
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
            </div>`
            break

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
      </div>`
            break

        case "reply":
            messageCreate.innerHTML = `<div class="message" id="${data["messageID"]}">
          <div class="username">
          <p>
          ${data["name"]}
          </p>
    <div class="replyWrap">
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
      </div>`
            break
    }

    messageBlockElement.insertAdjacentElement("beforeend", messageCreate)
}

// Если тут непонятно как работтает -> https://learn.javascript.ru/event-delegation
emojiContainer.addEventListener("click", (event) => {
    let td = event.target.closest("td")
    if (!td) return

    //Получим выбранный emoji
    let selectedEmoji = td.innerText

    //Превратим строку в массив
    let inputText = inputMessage.textContent.split("")
    //Разделим строку на 2 массива:
    //левый(до позиции курсора) и правый(после позиции курсора)
    let rightText = inputText.splice(CaretPosition, inputText.length)

    //Ставим в inputMessage текст с выбранным emoji
    inputMessage.textContent = inputText.join("") + selectedEmoji + rightText.join("")
    CaretPosition = CaretPosition + selectedEmoji.length
})

// Получение позиции курсора в поле ввода ".inputMessage" при отжатии любой клавиши
inputMessage.addEventListener("keyup", (event) => {
    CaretPosition = window.getSelection().getRangeAt(0).startOffset
})
// Получение позиции курсора в поле ввода ".inputMessage" при клике
inputMessage.addEventListener("click", (event) => {
    CaretPosition = window.getSelection().getRangeAt(0).startOffset
})