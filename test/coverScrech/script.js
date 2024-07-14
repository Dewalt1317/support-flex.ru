document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('covers');
  SendRequest("POST", "get_covers.php", "", (data)=>{
    data = JSON.parse(data)
    data.forEach(cover => {
      if (cover) {
          const coverDiv = document.createElement('div');
          coverDiv.className = 'cover';
          coverDiv.innerHTML = `<img src="${cover}" alt="Обложка альбома">`;
          container.appendChild(coverDiv);
      }
    });
  })
});




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
