function addCategoryBlock() {
    const categoriesContainer = document.getElementById('category-blocks');
    const newCategoryBlock = document.createElement('div');
    newCategoryBlock.innerHTML = `
    <label>Категория:</label>
    <select>
      <option value="rock">Рок</option>
      <option value="pop">Поп</option>
      <option value="hip-hop">Хип-хоп</option>
    </select>
    <label>Настроение</label>
    <select>
      <option value="rock">Рок</option>
      <option value="pop">Поп</option>
      <option value="hip-hop">Хип-хоп</option>
</select>
    <button class="remove-btn" onclick="removeBlock(this.parentElement)">Удалить</button>
  `;
    categoriesContainer.appendChild(newCategoryBlock);
    updateRemoveButtons();
}

function addScheduleBlock() {
    const scheduleContainer = document.getElementById('schedule-blocks');
    const newTimeBlock = document.createElement('div');
    newTimeBlock.innerHTML = `
    <label>Название клока:</label>
    <input type="text">
    <label>Дата:</label>
    <input type="date">
    <label>Время:</label>
    <input type="time">
    <button class="remove-btn" onclick="removeBlock(this.parentElement)">Удалить</button>
  `;
    scheduleContainer.appendChild(newTimeBlock);
    updateRemoveButtons();
    toggleAllDay();
}

function toggleAllDay() {
    const allDayCheckbox = document.getElementById('all-day-checkbox');
    const timeInputs = document.querySelectorAll('#schedule-blocks input[type="time"]');
    const buttons = document.querySelectorAll('#schedule-blocks .remove-btn, #schedule-blocks > div > button:not(.remove-btn)');

    if (allDayCheckbox.checked) {
        timeInputs.forEach(input => input.disabled = true);
    } else {
        timeInputs.forEach(input => input.disabled = false);
    }
}

function removeBlock(block) {
    block.parentNode.removeChild(block);
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const categoryBlocks = document.querySelectorAll('#category-blocks > div');
    const scheduleBlocks = document.querySelectorAll('#schedule-blocks > div');

    categoryBlocks.forEach(block => {
        const removeBtn = block.querySelector('.remove-btn');
        removeBtn.style.display = categoryBlocks.length > 1 ? 'inline-block' : 'none';
    });

    scheduleBlocks.forEach(block => {
        const removeBtn = block.querySelector('.remove-btn');
        removeBtn.style.display = scheduleBlocks.length > 1 ? 'inline-block' : 'none';
    });
}

// Инициализация первых блоков
window.onload = function() {
    addCategoryBlock();
    addScheduleBlock();
};

function generate (){
    console.log("Генерация")
}
