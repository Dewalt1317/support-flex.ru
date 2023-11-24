let dataChatSend = {"comand": "getChat"}
let messageBlockElement = document.querySelector(".messageBlock")
let chatDataNew = {}
let chatDataMessage = {}

function getChat(data) {
    switch (data["result"]) {
        case "getOk":
            chatDataNew = data["message"]
            chatDataNew.forEach(addMessage)
            dataChatSend["comand"] = ""
            break

        case "sendOK":
            dataChatSend["comand"] = "getNewMessage"
            get()
            break

        case "regUser":

            break

        case "regOK":

            break

        case "error":

            break
    }

}

function addMessage(index) {
    let type = ""
    let data = index
    chatDataMessage[data["messageID"]] = data
    let messageCreate = document.createElement("div")
    messageCreate.classList.add("messageWarp")
    messageCreate.id = data["messageID"]
    if (data["ReplyMessageID"] !== "" && data["photoSRC"] !== "") {
        type = "photoReply"
    } else if (data["ReplyMessageID"] == "" && data["photoSRC"] !== "") {
        type = "photo"
    } else if (data["ReplyMessageID"] !== "" && data["photoSRC"] == "") {
        type = "reply"
    } else {
        type = "message"
    }
    console.log(type)
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