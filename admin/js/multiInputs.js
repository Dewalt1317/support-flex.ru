let currentOptions = [];
let oldValue
// Функция для добавления множественного ввода с поддержкой обратного вызова
function addMultiInput(inputClass, inputContainerId, optionsFunc, name, callback, addBtn) {
    // Получаем контейнер для ввода
    const inputContainer = document.getElementById(inputContainerId)

    if (addBtn) {
        if (inputContainer.querySelectorAll('.multiInputBtnWraper').length < 1) {
            const multiInputBtnWraper = document.createElement("div")
            const addMultiInputButton = document.createElement("button")
            multiInputBtnWraper.className = "multiInputBtnWraper"
            multiInputBtnWraper.style.display = "flex"
            multiInputBtnWraper.style.justifyContent = "center"
            multiInputBtnWraper.style.alignItems = "center"
            addMultiInputButton.textContent = "Добавить"
            multiInputBtnWraper.appendChild(addMultiInputButton)
            inputContainer.appendChild(multiInputBtnWraper)
            addMultiInputButton.addEventListener("click", () => {
                addMultiInput(inputClass, inputContainerId, optionsFunc, name, callback, addBtn)
            })
        }
    }

    // Создаем элементы для нашего множественного ввода
    const multiInputWraper = document.createElement("div")
    const multiInputGroup = document.createElement("div")
    const multiInputGroupWraper = document.createElement("div")
    const input = document.createElement("input")
    const multiInputlable = document.createElement("label")
    const listContainer = document.createElement("div")
    const notFoundMessage = document.createElement("div")
    const deleteButton = document.createElement("button")
    const addButton = document.createElement("button")

    // Устанавливаем классы и значения для наших элементов
    multiInputlable.className = "multiInput-label"
    multiInputlable.textContent = name
    listContainer.className = "list-container inputTop"
    multiInputGroupWraper.className = "multiInput-groupWrap"
    multiInputGroupWraper.style.display = "flex"
    multiInputGroup.className = "multiInput-group"
    input.type = "text"
    input.dataset.key = "new"
    input.required = true
    multiInputWraper.className = "multiInputWraper"
    input.className = "multiInput " + inputClass
    notFoundMessage.textContent = "Ничего не найдено"
    deleteButton.textContent = "Удалить"
    deleteButton.className = "multiInputDelButton"
    addButton.textContent = "Добавить"
    addButton.style.display = "none"
    listContainer.style.display = "none"

    // Добавляем элементы в нашу группу ввода
    multiInputGroup.appendChild(input)
    multiInputGroup.appendChild(multiInputlable)
    multiInputGroupWraper.appendChild(multiInputGroup)
    if (addBtn) {
        multiInputGroupWraper.appendChild(deleteButton)
    }
    multiInputWraper.appendChild(multiInputGroupWraper)
    listContainer.appendChild(notFoundMessage)
    listContainer.appendChild(addButton)
    multiInputWraper.appendChild(listContainer)
    inputContainer.appendChild(multiInputWraper)


    if (inputContainer.querySelectorAll('.multiInputWraper').length > 1) {
        inputContainer.querySelectorAll('.multiInputDelButton').forEach(button => {
            button.disabled = false;
        });
    } else {
        inputContainer.querySelectorAll('.multiInputDelButton').forEach(button => {
            button.disabled = true;
        });
    }

    // Добавляем обработчик событий для кнопки "Добавить"
    addButton.addEventListener("click", () => {
        if (callback) {
            input.value = oldValue
            input.dataset.key = callback(oldValue)
        }
    })

    deleteButton.addEventListener("click", (event) => {
        if (event.target.closest('.multiInputWraper')) {
            event.target.closest('.multiInputWraper').remove();
        }
        if (inputContainer.querySelectorAll('.multiInputWraper').length > 1) {
            inputContainer.querySelectorAll('.multiInputDelButton').forEach(button => {
                button.disabled = false;
            });
        } else {
            inputContainer.querySelectorAll('.multiInputDelButton').forEach(button => {
                button.disabled = true;
            });
        }
    })

    // Добавляем обработчики событий для нашего ввода
    input.addEventListener(
        "input",
        updateList(input, listContainer, () => optionsFunc(), notFoundMessage, addButton, callback)
    )

    input.addEventListener("focus", () => {
        if (input.dataset.key !== "new") {
            input.value = ""
            input.dataset.key = "new"
        }
        updateList(input, listContainer, optionsFunc(), notFoundMessage, addButton, callback)()
    })

    input.addEventListener("blur", () => {
        const value = input.value.toLowerCase()
        oldValue = input.value
        const matchingOption = currentOptions.find(
            (option) => option.name.toLowerCase() === value
        )

        if (matchingOption) {
            input.value = matchingOption.name
            input.dataset.key = matchingOption.key
        } else {
            input.value = ""
        }

        listContainer.style.opacity = 0
        setTimeout(() => {
            listContainer.innerHTML = ""
            addButton.style.display = "none"
            listContainer.style.display = "none"
        }, 250)
    })
}
// Функция для обновления списка ввода
const updateList = (input, listContainer, options, notFoundMessage, addButton, callback) => {
    return () => {
        if (listContainer.style.display === "none") {
            currentOptions = options;
        }
        const value = input.value.toLowerCase()
        const filteredOptions = currentOptions.filter((option) =>
            option.name.toLowerCase().includes(value)
        )

        listContainer.innerHTML = ""
        listContainer.appendChild(notFoundMessage)

        if (value === "") { // Если инпут пустой, не показываем кнопку
            addButton.style.display = "none"
        } else {
            addButton.style.display = "block"
        }

        if (filteredOptions.length > 0) {
            notFoundMessage.style.display = "none"
            listContainer.style.display = "flex"
            listContainer.classList.add("multiInputList-container") // Добавляем класс для flexbox
            setTimeout(() => {
                listContainer.style.opacity = 1
            }, 10)
            const optionsContainer = document.createElement("div")
            optionsContainer.classList.add("options-container") // Добавляем класс для контейнера опций
            filteredOptions.forEach((option) => {
                const div = document.createElement("div")
                div.textContent = option.name
                div.classList.add("option")
                div.addEventListener("click", () => {
                    input.value = option.name
                    input.dataset.key = option.key
                    listContainer.style.opacity = 0
                    setTimeout(() => {
                        listContainer.style.display = "none"
                    }, 250)
                })
                optionsContainer.appendChild(div)
            })
            listContainer.appendChild(optionsContainer)
            const buttonContainer = document.createElement("div")
            buttonContainer.classList.add("button-container") // Добавляем класс для контейнера кнопки
            buttonContainer.appendChild(addButton)
            listContainer.appendChild(buttonContainer)
        } else {
            if (!callback) {
                listContainer.style.opacity = 0
                setTimeout(() => {
                    listContainer.style.display = "none"
                }, 250)
            } else {
                notFoundMessage.style.display = "block"
                listContainer.style.display = "flex"
                listContainer.classList.add("multiInputList-containerCentered") // Добавляем класс "centered"
                const buttonContainer = document.createElement("div")
                buttonContainer.classList.add("button-container") // Добавляем класс для контейнера кнопки
                buttonContainer.appendChild(addButton)
                listContainer.appendChild(buttonContainer)
            }
        }
    }
}
// Функция для сбора данных
function idCollection(allQuery) {
    let keys = [];
    allQuery.forEach(element => {
        const inputs = element.querySelectorAll('input');
        inputs.forEach(input => {
            if (keys !== "stop") {
                if (input.dataset.key === "new") {
                    keys = "stop"
                } else {
                    keys.push(input.dataset.key);
                }
            }
        });
    });
    return keys;
}
