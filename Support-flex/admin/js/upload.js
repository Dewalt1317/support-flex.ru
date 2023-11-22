function success(data) {
    // делаем с ответом сервера что душе угодно,
    // например распечатаем его в консоль
   console.log(data)
}
function error(status) {
    // показываем код ошибки
    alert('Error: ' + status);
}
window.onload = function() {
    // подвязываем переменные к элементам
    var $send_btn = document.getElementById('send'),
        $input = document.getElementById('file');
    $send_btn.addEventListener('click', function(e) {
        e.preventDefault();
        // проверяем массив файлов в файловом инпуте
        if($input.files.length > 0) {
            for(var i = 0; i < $input.files.length; i++) {
                var formData = new FormData(),
                    file = $input.files[i],
                    xhr = new XMLHttpRequest();
                // заполняем объект FormData (данные формы)
                formData.append($input.name, file);
                // готовим ajax запрос
                xhr.open('POST', 'php/upload.php');
                xhr.setRequestHeader('X-FILE-NAME', file.name);
                xhr.onreadystatechange = function(e) {
                    if(e.target.readyState == 4) {
                        if(e.target.status == 200) {
                            // успешно отправили файл
                            success(e.target.responseText);
                            return;
                        }
                        else {
                            // произошла ошибка
                            error(e.status);
                        }
                    }
                };
                xhr.send(formData);
            }
        }
    });
}