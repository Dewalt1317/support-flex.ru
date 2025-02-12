function createPopUp(type, title = "Сообщение системы", text, callback, type_input = "text", placeholder = "Введите данные", buttonText = "ОК", insertTo = document.body) {
  const existingPopUp = insertTo.querySelector(".pop-up-wrapper");
  if (existingPopUp) {
    console.error("Error: pop-up already exists!");
    return
  }

  let popUpWrapper = document.createElement("div");
  popUpWrapper.className = "pop-up-wrapper";

  popUpWrapper.innerHTML = `
    <div class="pop-up">
      <div class="top">${title}</div>
      <div class="messagePopUp">${text}</div>
      <div class="bottom">
        ${type === 'confirm' || type === 'input' || type === 'image_send'
      ? '<div id="pop-up-cancel" class="button">Отмена</div>'
      : ''}
        ${type === 'connect_fail'
      ? ''
      : '<div id="pop-up-ok" class="button">' + buttonText +'</div>'}
      </div>
    </div>`;

  // Добавим специфичный для типа 'input' контент
  if (type === 'input' || type === 'input_connect') {
    const inputHtml = `
      <br><br>
      <div class="input_div">
        <input id="popup-input" type="${type_input}" placeholder="${placeholder}" data-input="true">
      </div>`;
    popUpWrapper.querySelector('.messagePopUp').insertAdjacentHTML('beforeend', inputHtml);
  }

  // События для кнопок
  const OKButton = popUpWrapper.querySelector('#pop-up-ok');
  if (OKButton){
    popUpWrapper.querySelector('#pop-up-ok').onclick = () => {
      const input = popUpWrapper.querySelector('#popup-input');
      let response
      if (type === 'input' || type === 'input_connect') response = input.value
      if (type === "image_send") response = document.querySelector(".wrapSendPopUp .input-block").textContent;
      if (callback) callback("Ok",  response);
      popUpWrapper.remove();
    };
  }

  const cancelButton = popUpWrapper.querySelector('#pop-up-cancel');
  if (cancelButton) {
    cancelButton.onclick = () => {
      if (callback) callback("cancel")
      popUpWrapper.remove();
    }
  }

  // Отображаем поп-ап
  insertTo.appendChild(popUpWrapper);
}

// Использование функции:
// createPopUp('message', 'Заголовок', 'Сообщение...', null, null, null, null, document.querySelector('#insert-here'));