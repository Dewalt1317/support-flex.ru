document.querySelector("#trackName").addEventListener("input", searchTrack);

function SendRequest(method, url, data = "", responseHandler = (response) => {
    console.log(`Нет обработчика данных. Ответ сервера: ${response}`);
}, transform) {
    const xhr = new XMLHttpRequest();
    if (transform !== "file") {
        data = JSON.stringify(data);
    }
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json"); // Установите заголовок для JSON
    xhr.send(data);

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) {
            return;
        }
        if (xhr.status != 200) {
            console.log(`Ошибка: ${xhr.status} : ${xhr.statusText}`);
        } else {
            responseHandler(xhr.responseText);
        }
    }
}

function responseHandler(response) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = ''; // Очищаем список треков

    response.forEach(track => {
        const trackRow = document.createElement('tr');
        trackRow.innerHTML = `
            <td><input type="checkbox" id="${track.treckID}"></td>
            <td><span class="play-button" onclick="playTrack('${track.SRC}')">▶️</span></td>
            <td>${track.name}</td>
            <td>${track.artist}</td>
            <td>${track.duration}</td>
            <td>${track.mood}</td>
            <td>${track.category}</td>
            <td>${track.treckID}</td>
        `;
        trackList.appendChild(trackRow);
    });
}

function searchTrack() {
    const trackName = document.querySelector('#trackName').value;
    const apiUrl = 'php/screch.php';
    if (trackName !== "") {
        SendRequest('POST', apiUrl, trackName, (data) => {
            data = JSON.parse(data);
            if (data["result"] !== "error") {
                responseHandler(data["data"]);
            }
        });
    }
}

function goToAdminPage() {
    window.location.href = '/admin'; 
}

function getSelectedTracks() {
    const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    const selectedTrackIds = Array.from(checkboxes).map(checkbox => checkbox.id);
    const apiUrl = 'php/syslink.php'; 

    SendRequest('POST', apiUrl, { selectedTrackIds }, (data) => {
        data = JSON.parse(data);
        checkboxes.forEach(check => {
            check.checked = false;
        });
    });
}

function playTrack(src) {
    const player = document.getElementById('player');
    player.src = src;
    player.play();
}
