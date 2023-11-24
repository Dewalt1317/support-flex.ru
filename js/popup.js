function createPopUp(type, title, text, func, type_input, placeholder, text_input, insertTo) {
  if (document.querySelector(".pop-up-wrapper")) {
    console.error("Error: pop-up already exists!")
    return
  }
  if (title === ""){
    title = "Сообщение системы"
  }
  if (type_input === ""){
    type_input = "text"
  }
  if (placeholder === ""){
    placeholder = "Введите данные"
  }

  switch (type) {
    case "message":
      let popUp_wrapper_message = insertTo.createElement("div")
      popUp_wrapper_message.classList.add("pop-up-wrapper")

      popUp_wrapper_message.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}
          </div>
          <div class="bottom">
            <div id="pop-up-btn1" class="button">ОК</div>
          </div>
      </div>`

      insertTo.insertAdjacentElement("beforeend",popUp_wrapper_message)
      //Удаляем поп-ап по клику
      popUp_wrapper_message.querySelector("#pop-up-btn1").addEventListener("click", () => {
        popUp_wrapper_message.remove()
      })
      break

    case "confirm":
      let popUp_wrapper_confirm = document.createElement("div")
      popUp_wrapper_confirm.classList.add("pop-up-wrapper")

      popUp_wrapper_confirm.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}
          </div>
          <div class="bottom">
            <div id="pop-up-btn2" class="button">Отмена</div>
            <div id="pop-up-btn1" class="button">ОК</div>
          </div>
      </div>`

      document.body.insertAdjacentElement("beforeend",popUp_wrapper_confirm)
      //Удаляем поп-ап по клику
      popUp_wrapper_confirm.querySelector("#pop-up-btn2").addEventListener("click", () => {
        popUp_wrapper_confirm.remove()
      })
        popUp_wrapper_confirm.querySelector("#pop-up-btn1").addEventListener("click", () => {
          popUp_wrapper_confirm.remove()
          func()
        })
        break
    case "input":
      let popUp_wrapper_input = document.createElement("div")
      popUp_wrapper_input.classList.add("pop-up-wrapper")

      popUp_wrapper_input.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}<br><br>
            <div class="input_div">
            ${text_input}
            <input class="pop-up-input" type="${type_input}" placeholder="${placeholder}">
            </div>
          </div>
          <div class="bottom">
            <div id="pop-up-btn2" class="button">Отмена</div>
            <div id="pop-up-btn1" class="button">ОК</div>
          </div>
      </div>`
      document.body.insertAdjacentElement("beforeend",popUp_wrapper_input)
        let input = document.querySelector(".pop-up-input")
      //Удаляем поп-ап по клику
      popUp_wrapper_input.querySelector("#pop-up-btn2").addEventListener("click", () => {
        popUp_wrapper_input.remove()
      })
      popUp_wrapper_input.querySelector("#pop-up-btn1").addEventListener("click", () => {
        popUp_wrapper_input.remove()
        func(input.value)
      })
      break
    case "input_connect":
      let popUp_wrapper_input_connect = document.createElement("div")
      popUp_wrapper_input_connect.classList.add("pop-up-wrapper")

      popUp_wrapper_input_connect.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}<br><br>
            <div class="input_div">
            ${text_input}
            <input class="pop-up-input" type="${type_input}" placeholder="${placeholder}">
            </div>
          </div>
          <div class="bottom">
            <div id="pop-up-btn1" class="button">ОК</div>
          </div>
      </div>`
      document.body.insertAdjacentElement("beforeend",popUp_wrapper_input_connect)
      let input_connect = document.querySelector(".pop-up-input")
      //Удаляем поп-ап по клику
      popUp_wrapper_input_connect.querySelector("#pop-up-btn1").addEventListener("click", () => {
        popUp_wrapper_input_connect.remove()
        func(input_connect.value)
      })
          break
    case "message_func":
      let popUp_wrapper_message_func = document.createElement("div")
      popUp_wrapper_message_func.classList.add("pop-up-wrapper")

      popUp_wrapper_message_func.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}
          </div>
          <div class="bottom">
            <div id="pop-up-btn1" class="button">ОК</div>
          </div>
      </div>`

      document.body.insertAdjacentElement("beforeend",popUp_wrapper_message_func)
      //Удаляем поп-ап по клику
      popUp_wrapper_message_func.querySelector("#pop-up-btn1").addEventListener("click", () => {
        popUp_wrapper_message_func.remove()
        func()
      })
      break
    case "critical_error":
      let popUp_wrapper_critical_error = document.createElement("div")
      popUp_wrapper_critical_error.classList.add("pop-up-wrapper")

      popUp_wrapper_critical_error.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
            ${text}
          </div>
          <div class="bottom">
            <div id="pop-up-btn1" class="button">Обновить страницу</div>
          </div>
      </div>`

      document.body.insertAdjacentElement("beforeend",popUp_wrapper_critical_error)
      //Удаляем поп-ап по клику
      popUp_wrapper_critical_error.querySelector("#pop-up-btn1").addEventListener("click", () => {
        location.reload()
      })
      break
    case "load":
      let popUp_wrapper_load = document.createElement("div")
      popUp_wrapper_load.classList.add("pop-up-wrapper")

      popUp_wrapper_load.innerHTML = `<div class="pop-up">
          <div class="top">
          ${title}
          </div>
          <div class="message">
          <img src="../image/load.png" alt="">
            ${text}
          </div>
      </div>`

      document.body.insertAdjacentElement("beforeend",popUp_wrapper_load)
      //Удаляем поп-ап по клику

      break
  }
}