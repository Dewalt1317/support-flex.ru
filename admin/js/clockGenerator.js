const $selectMood = document.querySelector(".selectMood")
const $selectCategory = document.querySelector(".selectCategory")
const $selectWrappers = document.querySelectorAll(".multiple_select_wrapper")

// test data
let data = {}
data.mood = [
  { moodID: "0", mood: "m1" },
  { moodID: "0", mood: "m2" },
  { moodID: "0", mood: "m3" },
]
data.category = [
  { categoryID: "0", category: "c1" },
  { categoryID: "0", category: "c2" },
  { categoryID: "0", category: "c3" },
]

addSelect($selectMood, data.mood, "mood")
addSelect($selectCategory, data.category, "category")

// function addCategoryBlock() {
//     const categoriesContainer = document.getElementById('category-blocks');
//     const newCategoryBlock = document.createElement('div');
//     newCategoryBlock.innerHTML = `
//     <label>Категория:</label>
//     <select>
//       <option value="rock">Рок</option>
//       <option value="pop">Поп</option>
//       <option value="hip-hop">Хип-хоп</option>
//     </select>
//     <label>Настроение</label>
//     <select>
//       <option value="rock">Рок</option>
//       <option value="pop">Поп</option>
//       <option value="hip-hop">Хип-хоп</option>
// </select>
//     <button class="remove-btn" onclick="removeBlock(this.parentElement)">Удалить</button>
//   `;
//     categoriesContainer.appendChild(newCategoryBlock);
//     updateRemoveButtons();
// }

function addScheduleBlock() {
  const scheduleContainer = document.getElementById("schedule-blocks")
  const newTimeBlock = document.createElement("div")
  newTimeBlock.innerHTML = `
    <label>Название клока:</label>
    <input type="text">
    <label>Дата:</label>
    <input type="date">
    <label>Время:</label>
    <input type="time">
    <button class="remove-btn" onclick="removeBlock(this.parentElement)">Удалить</button>
  `
  scheduleContainer.appendChild(newTimeBlock)
  updateRemoveButtons()
  toggleAllDay()
}

function toggleAllDay() {
  const allDayCheckbox = document.getElementById("all-day-checkbox")
  const timeInputs = document.querySelectorAll(
    '#schedule-blocks input[type="time"]'
  )
  const buttons = document.querySelectorAll(
    "#schedule-blocks .remove-btn, #schedule-blocks > div > button:not(.remove-btn)"
  )

  if (allDayCheckbox.checked) {
    timeInputs.forEach((input) => (input.disabled = true))
  } else {
    timeInputs.forEach((input) => (input.disabled = false))
  }
}

function removeBlock(block) {
  block.parentNode.removeChild(block)
  updateRemoveButtons()
}

function updateRemoveButtons() {
  // const categoryBlocks = document.querySelectorAll('#category-blocks > div');
  const scheduleBlocks = document.querySelectorAll("#schedule-blocks > div")

  // categoryBlocks.forEach(block => {
  //     const removeBtn = block.querySelector('.remove-btn');
  //     removeBtn.style.display = categoryBlocks.length > 1 ? 'inline-block' : 'none';
  // });

  scheduleBlocks.forEach((block) => {
    const removeBtn = block.querySelector(".remove-btn")
    removeBtn.style.display =
      scheduleBlocks.length > 1 ? "inline-block" : "none"
  })
}

// Инициализация первых блоков
window.onload = function () {
  // addCategoryBlock();
  addScheduleBlock()
}

function generate() {
  console.log("Генерация")
}

// Функция добавления селекта
function addSelect(contextEl, options, teg) {
  let selectCount = contextEl.dataset.selectcount
  let selectName = contextEl.dataset.selectname
  let selectHeader = contextEl.dataset.selectheader
  let optionsStr

  if (!options) {
    optionsStr = contextEl.querySelector("select").innerHTML
  }
  let optionValue = ""
  let optionName = ""
  let no
  let button
  switch (teg) {
    case "artist":
      optionValue = "artistLinkID"
      optionName = "artistLink"
      no = '<option value="no">Нет</option>'
      button = ""
      break

    case "category":
      optionValue = "categoryID"
      optionName = "category"
      button = ""
      break

    case "mood":
      optionValue = "moodID"
      optionName = "mood"
      button = ""
      break
  }

  //   Если начальный селект
  if (selectCount == 0) {
    optionsStr = []
    options.forEach((option) => {
      optionsStr.push(
        `<option value="${option[optionValue]}">${option[optionName]}</option>`
      )
    })
    optionsStr =
      `<option value="non">-----------</option>` +
      no +
      optionsStr.join("") +
      `<option value="another">Свой вариант</option>`
    contextEl.insertAdjacentHTML(
      "beforeend",
      `
      <h2>${selectHeader}</h2>
            <div class="select">
              <p>${selectName}</p>
              <select>
              ${optionsStr}
              </select>
              <input
                class="another_choise_inpt _hide"
                type="text"
                name="another_choise"
                placeholder="Свой вариант"
              />
            </div>
  
            <div class="btns">
              ${button}
              <button class="remove-select-btn _hide">Удалить</button>
            </div>
      `
    )
    selectCount++
    contextEl.dataset.selectcount = selectCount
    return
  }

  let $removeSelectBtn = contextEl.querySelector(".remove-select-btn")

  contextEl.querySelector(".btns").insertAdjacentHTML(
    "beforebegin",
    `
              <div class="select">
            <p>${selectName} ${+selectCount + 1}</p>
            <select>
            ${optionsStr}
            </select>
            <input
              class="another_choise_inpt _hide"
              type="text"
              name="another_choise"
              placeholder="${selectName}"
            />
          </div>
              `
  )

  selectCount++
  contextEl.dataset.selectcount = selectCount

  if (selectCount > 1) {
    $removeSelectBtn.classList.remove("_hide")
  } else {
    $removeSelectBtn.classList.add("_hide")
  }
}

// Функция удаления селекта
function removeSelect(contextEl) {
  let $removeSelectBtn = contextEl.querySelector(".remove-select-btn")
  let selectCount = contextEl.dataset.selectcount

  let $allSelects = contextEl.querySelectorAll(".select")
  $allSelects[$allSelects.length - 1].remove()

  selectCount--
  contextEl.dataset.selectcount = selectCount

  if (selectCount > 1) {
    $removeSelectBtn.classList.remove("_hide")
  } else {
    $removeSelectBtn.classList.add("_hide")
  }
}

// События кликов в полях выбора и по кнопкам
$selectWrappers.forEach((el) => {
  el.addEventListener("click", (event) => {
    let eventTarget = event.target

    switch (eventTarget.localName) {
      case "select":
        let $select = eventTarget.closest(".select")
        let $another_choise_inpt = $select.querySelector(".another_choise_inpt")

        if (eventTarget.value === "another") {
          $another_choise_inpt.classList.remove("_hide")
        } else {
          $another_choise_inpt.classList.add("_hide")
        }
        break
      case "button":
        switch (eventTarget.className) {
          case "add-select-btn":
            addSelect(eventTarget.closest(".multiple_select_wrapper"))
            break
          case "remove-select-btn":
            removeSelect(eventTarget.closest(".multiple_select_wrapper"))
            break
        }
        break
    }
  })
})

const selectsTemlate = `
  <div style="border: 3px dashed red;">
  <div
        class="multiple_select_wrapper selectCategory"
        data-selectcount="0"
        data-selectname="Категория"
        data-selectheader="Выбор категории"
      ></div>
      <div
      class="multiple_select_wrapper selectMood"
      data-selectcount="0"
      data-selectname="Настроение"
      data-selectheader="Выбор настроения"
    ></div></div>`

const $addCatBlockBtn = document.querySelector(".addCatBlockBtn")
const $removeCatBlockBtn = document.querySelector(".removeCatBlockBtn")

$removeCatBlockBtn.addEventListener("click", () => {
  document.querySelector("#category-blocks > div:last-child").remove()
})

$addCatBlockBtn.addEventListener("click", () => {
  document
    .querySelector("#category-blocks")
    .insertAdjacentHTML("beforeend", selectsTemlate)
  addSelect(
    document.querySelector("#category-blocks div:last-child .selectCategory"),
    data.category,
    "category"
  )
  addSelect(
    document.querySelector("#category-blocks div:last-child .selectMood"),
    data.mood,
    "mood"
  )
})
