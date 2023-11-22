<?php
error_reporting(E_ALL); // Это поможет в отладке кода, показывая все ошибки и предупреждения
ini_set('display_errors', 1);

include "../../php/DB-Config.php";
include "../../php/idGenerator.php";
require_once('../../lib/php/getid3/getid3.php');

// Подключение к базе данных
if($mysql->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysql->connect_error);
}

// Путь для сохранения загруженных файлов
$uploadDir = '../../src/treck';

if(isset($_FILES['file'])) {
    $uploadedFiles = array($_FILES['file']);
} elseif (!empty($_FILES['files']['name'])) {
    $uploadedFiles = $_FILES['files'];
}
if(is_uploaded_file($_FILES["uploadfile"]["tmp_name"]))
{
    move_uploaded_file($_FILES["uploadfile"]["tmp_name"], $uploadDir.$_FILES['uploadfile']['name']);
} else {
    echo "<h3>Ошибка! Не удалось загрузить файл на сервер!</h3>";
    exit;
}









//// Проверка, были ли переданы файлы
////if(!empty($uploadedFiles['name'])) {
//    // Перебор загруженных файлов
//    foreach($uploadedFiles['name'] as $key => $fileName) {
//        $tmpFilePath = $uploadedFiles['tmp_name'][$key];
//
//        // Проверка, является ли загруженный файл MP3
//        if(pathinfo($fileName, PATHINFO_EXTENSION) == 'mp3') {
//            $newFileName = uniqid() . '-' . $fileName;
//            $filePath = $uploadDir . '/' . $newFileName;
//
//            // Перемещение файла на сервер
//            if(move_uploaded_file($tmpFilePath, $filePath)) {
//                // Получение информации о файле с помощью getID3
//                $getID3 = new getID3;
//
//                $fileInfo = $getID3->analyze($filePath);
//
//                // Получение длительности музыки
//                $duration = '0:' . $fileInfo['playtime_seconds'];
//                $treckID = id(8000);
//
//                // Запись информации о файле в базу данных
//                $mysql->query("INSERT INTO treck (`treckID`, `name`, `SRC`, `duration`) VALUES ('$treckID', '$fileName', '$filePath', '$duration')");
//                $mysql->close();
//            } else {
//                echo "Ошибка при перемещении файла: " . $fileName;
//            }
//        } else {
//            echo "Неподдерживаемый формат файла: " . $fileName;
//        }
//    }
////} else {
////    echo "Нет отправленных файлов.";
////}