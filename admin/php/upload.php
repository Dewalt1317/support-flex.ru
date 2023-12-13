<?php
include "../../php/DB-Config.php";
include "../../php/response.php";
include "../../php/idGenerator.php";
require_once('../../lib/php/getid3/getid3.php');
if ($mysql->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysql->connect_error);
}
$data = [];
$uploadNum = 0;
$uploadDir = '../../src/treck';
if (isset($_FILES['files'])) {
    $uploadedFiles = $_FILES['files'];
    foreach ($uploadedFiles['name'] as $key => $fileName) {
        $tmpFilePath = $uploadedFiles['tmp_name'][$key];
        if (pathinfo($fileName, PATHINFO_EXTENSION) == 'mp3') {
            $filePath = $uploadDir . '/' . $fileName;
            if (move_uploaded_file($tmpFilePath, $filePath)) {
                $uploadNum = $uploadNum  + 1;
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
                $data["error"] = $data["error"] .  "Ошибка при перемещении файла: " . $fileName . "<br>";
            }
        } else {
            $data["error"] = $data["error"] . "Неподдерживаемый формат файла: " . $fileName . "<br>";
        }
    }
} else {
    $data["error"] = $data["error"] . "Нет отправленных файлов." . "<br>";
}
$data["result"] = "Загруженно " . $uploadNum . " Файлов" ."<br>";
systemResponse($data);