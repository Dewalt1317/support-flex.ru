let presentersData = {}; // Хранилище данных о ведущих
let presenterBlock = document.querySelector('.presenter-block');
let lastTrackBlock = document.querySelector('.lastTrack-block')

function updatePresentersData(newPresenters) {
    if (!Array.isArray(newPresenters)) {
        newPresenters = [];
    }

    let newPresentersNames = newPresenters.map(presenter => presenter.name);

    // Удаляем информацию о ведущих, которых нет в новом списке
    for (let name in presentersData) {
        if (!newPresentersNames.includes(name)) {
            delete presentersData[name];
            removePresenterFromPage(name);
        }
    }

    // Добавляем или обновляем информацию о ведущих из нового списка
    for (let presenter of newPresenters) {
        presentersData[presenter.name] = presenter.photoSRC;
        addOrUpdatePresenterOnPage(presenter);
    }

    // Обновляем свойство justify-content в зависимости от количества ведущих
    presenterBlock.style.justifyContent = newPresenters.length > 1 ? 'space-between' : 'end';
}

function addOrUpdatePresenterOnPage(presenter) {
    let presenterOnAir = presenterBlock.querySelector(`.presenterOnAir[data-name="${presenter.name}"]`);

    if (!presenterOnAir) {
        presenterOnAir = document.createElement('div');
        presenterOnAir.className = 'presenterOnAir';
        presenterOnAir.dataset.name = presenter.name;

        let presenterPhotoWrap = document.createElement('div');
        presenterPhotoWrap.className = 'presenterPhotoWrap';
        let presenterPhoto = document.createElement('img');
        presenterPhoto.className = 'presenterPhoto';
        presenterPhotoWrap.appendChild(presenterPhoto);

        let presenterName = document.createElement('div');
        presenterName.className = 'presenterName';

        presenterOnAir.appendChild(presenterPhotoWrap);
        presenterOnAir.appendChild(presenterName);

        presenterBlock.appendChild(presenterOnAir);
    }

    let presenterPhoto = presenterOnAir.querySelector('.presenterPhoto');
    presenterPhoto.src = presenter.photoSRC;

    let presenterName = presenterOnAir.querySelector('.presenterName');
    presenterName.textContent = presenter.name;
}

function removePresenterFromPage(name) {
    let presenterOnAir = presenterBlock.querySelector(`.presenterOnAir[data-name="${name}"]`);

    if (presenterOnAir) {
        presenterBlock.removeChild(presenterOnAir);
    }
}

function addTrackToBlock(trackData, type) {
    if (type === "start") {
        trackData = trackData.reverse()
        trackData.pop()
    }
    trackData.forEach(track => {
        if (track.coverSRC === "off") {
            track.coverSRC = "/src/image/Default%20cover.PNG"
        }
        // Создаем элементы
        let trackBlock = document.createElement('div');
        let timeElement = document.createElement('p');
        let coverElement = document.createElement('img');
        let titleElement = document.createElement('p');

        // Устанавливаем содержимое и атрибуты
        let timeWithoutSeconds = track.time.slice(0, -3); // Удаляем секунды из времени
        timeElement.textContent = timeWithoutSeconds;
        coverElement.src = track.coverSRC;
        titleElement.textContent = track.title;

        // Добавляем элементы в блок трека
        trackBlock.appendChild(timeElement);
        trackBlock.appendChild(coverElement);
        trackBlock.appendChild(titleElement);

        // Добавляем блок трека в начало lastTrack-block
        lastTrackBlock.insertBefore(trackBlock, lastTrackBlock.firstChild);
    });
}


