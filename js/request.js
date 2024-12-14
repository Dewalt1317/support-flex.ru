function SendRequest(
  method,
  url,
  data = "",
  responseHandler = (response) => {
    console.log(`Нет обработчика данных. Ответ сервера: ${response}`)
  },
  transform,
  sync = true
) {
  const xhr = new XMLHttpRequest()
  if (transform !== "file") {
    data = JSON.stringify(data)
  }
  
  if (method === "POST") {
    xhr.open(method, url, sync)
    xhr.send(data)
  } else if (method === "GET") {
    xhr.open(method, url, sync)
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
  return xhr
}
