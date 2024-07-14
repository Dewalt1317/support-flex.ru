document.querySelector("#trackName").addEventListener("input", searchTrack)
// Функция для отправки запроса на сервер
function SendRequest(
method,
url,
data = "",
responseHandler = (response) => {
console.log(`Нет обработчика данных. Ответ сервера: ${response}`)
},
transform
) {
const xhr = new XMLHttpRequest()
if (transform !== "file") {
data = JSON.stringify(data)
}
if (method === "POST") {
xhr.open(method, url, true)
xhr.send(data)
} else if (method === "GET") {
xhr.open(method, url, true)
xhr.send()
}

xhr.onreadystatechange = function () {
if (xhr.readyState != 4) {
return
}
// Если нет ошибок, то запускаем хэндлер для полученных данных
if (xhr.status != 200) {
(`${xhr.status} : ${xhr.statusText}`)
} else {
responseHandler(xhr.responseText)
}
}
}

// Функция для обработки ответа от сервера
function responseHandler(response) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = ''; // Очищаем список треков

    response.forEach(track => {
        const trackRow = document.createElement('div');
        trackRow.classList.add('track-row');
        trackRow.innerHTML = `
            <div><span class="play-button" onclick="playTrack('${track.SRC}')">▶️</span></div>
            <div>${track.name}</div>
            <div>${track.artist}</div>
            <div>${track.duration}</div>
            <div>${track.treckID}</div>
        `;
        trackList.appendChild(trackRow);
    });
}

// Функция для поиска трека
function searchTrack() {
    const trackName = document.querySelector('.nameTrack').value;
    const apiUrl = 'php/screch.php';
    if (trackName !== ""){
                // Отправка запроса на сервер
                SendRequest('POST', apiUrl, trackName, (data)=>{
                  data = JSON.parse(data)
                  if(data["result"] !== "error") {
                  responseHandler(data["data"])
                }
});
    }
}

// Функция для перехода на страницу /admin
function goToAdminPage() {
    window.location.href = '/admin'; 
}

// Функция для получения выбранных треков
function getSelectedTracks() {
    const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    const selectedTrackIds = Array.from(checkboxes).map(checkbox => checkbox.id);
    const apiUrl = 'php/syslink.php'; 

    // Отправка запроса на сервер
    SendRequest('POST', apiUrl, { selectedTrackIds }, (data)=>{
                  data = JSON.parse(data)
                  checkboxes.forEach(check =>{
                    check.checked = false
                  })
});
}
// Функция для воспроизведения трека
function playTrack(src) {
    const player = document.getElementById('player');
    player.src = src;
    player.play();
}