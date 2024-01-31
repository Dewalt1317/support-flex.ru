let inputMessage = document.querySelector(".inputMessage")
let emojiContainer = document.querySelector(".emojiContainer")

// Позиция курсора в поле текста
let CaretPosition = 0

// Если тут непонятно как работтает -> https://learn.javascript.ru/event-delegation
emojiContainer.addEventListener("click", (event) => {
  let td = event.target.closest("td")
  if (!td) return

  //Получим выбранный emoji
  let selectedEmoji = td.innerText

  //Превратим строку в массив
  let inputText = inputMessage.value.split("")
  //Разделим строку на 2 массива:
  //левый(до позиции курсора) и правый(после позиции курсора)
  let rightText = inputText.splice(CaretPosition, inputText.length)

  //Ставим в inputMessage текст с выбранным emoji
  inputMessage.value = inputText.join("") + selectedEmoji + rightText.join("")
  CaretPosition = CaretPosition + selectedEmoji.length
})

// Получение позиции курсора в поле ввода ".inputMessage" при отжатии любой клавиши
inputMessage.addEventListener("keyup", (event) => {
  CaretPosition = event.target.selectionStart
})
// Получение позиции курсора в поле ввода ".inputMessage" при клике
inputMessage.addEventListener("click", (event) => {
  CaretPosition = event.target.selectionStart
})
