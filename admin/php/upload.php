<?php
include "../../php/DB-Config.php";
include "../../php/idGenerator.php";
require_once('../../lib/php/getid3/getid3.php');
if ($mysql->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysql->connect_error);
}
$uploadDir = '../../src/treck';
if (isset($_FILES['files'])) {
    $uploadedFiles = $_FILES['files'];
    foreach ($uploadedFiles['name'] as $key => $fileName) {
        $tmpFilePath = $uploadedFiles['tmp_name'][$key];
        if (pathinfo($fileName, PATHINFO_EXTENSION) == 'mp3') {
            $filePath = $uploadDir . '/' . $fileName;
            if (move_uploaded_file($tmpFilePath, $filePath)) {
                $getID3 = new getID3;
                $fileInfo = $getID3->analyze($filePath);
                $playTime = $fileInfo['playtime_seconds'];
                $minutes = floor($playTime / 60);
                $seconds = $playTime % 60;
                $duration = "0:" . $minutes . ":" . $seconds;
                $filePath = "/src/treck" . '/' . $fileName;
                $treckID = id(8000);
                $mysql->query("INSERT INTO treck (`treckID`, `name`, `SRC`, `duration`) VALUES ('$treckID', '$fileName', '$filePath', '$duration')");
                $mysql->close();
            } else {
                echo "Ошибка при перемещении файла: " . $fileName;
            }
        } else {
            echo "Неподдерживаемый формат файла: " . $fileName;
        }
    }
} else {
    echo "Нет отправленных файлов.";
}