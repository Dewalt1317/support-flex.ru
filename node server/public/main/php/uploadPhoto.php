<?php
include "response.php";
$uploadDir = '../src/userPhoto/';
$data = [];

// Максимальный размер файла в байтах
$maxFileSize = 5 * 1024 * 1024;

// Допустимые форматы изображений
$allowedImageTypes = array(
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
    'image/svg+xml',
);

// Получаем данные о загружаемом файле
    $file = $_FILES['file'];

// Проверяем, был ли файл загружен
if ($file['error'] !== UPLOAD_ERR_OK) {
    $error = 'Ошибка загрузки файла';
    saveError($error);
    $data['result'] = 'error';
    systemResponse($data);
    $data["image"] = $file;
    $data['error'] = $error;
    saveError($data);
    exit();
}

// Проверяем размер файла
if ($file['size'] > $maxFileSize) {
    $error = 'Размер файла превышает допустимый';
    $data['result'] = 'bigSize';
    systemResponse($data);
    $data["image"] = $file;
    $data['error'] = $error;
    saveError($data);
    exit();
}

// Проверяем тип файла
if (!in_array($file['type'], $allowedImageTypes)) {
    $error = 'Не допустимый тип файла';
    $data['result'] = 'fileTypeNotFound';
    systemResponse($data);
    $data["image"] = $file;
    $data['error'] = $error;
    saveError($data);
    exit();
}

// Формируем путь к файлу на сервере
$fileName = uniqid() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
$filePath = $uploadDir . $fileName;

// Перемещаем файл на сервер
if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    $error = 'Не удалось сохранить файл на сервере';
    $data['result'] = 'error';
    systemResponse($data);
    $data["image"] = $file;
    $data['error'] = $error;
    saveError($data);
    exit();
}

// Возвращаем путь к файлу на сервере
$data['result'] = 'saveOK';
$data['src'] = $fileName;
systemResponse($data);


// Функция для сохранения ошибок в файл
function saveError($error) {
    file_put_contents('../log/Upload File error.json ' . date('d.m.Y H-i-s') . ".log", json_encode($error, JSON_UNESCAPED_UNICODE));
}