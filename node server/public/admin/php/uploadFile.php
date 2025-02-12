<?php
include "../../php/response.php";
$data = [];
$uploadNum = 0;
$uploadDir = '../file/uploads';
if (isset($_FILES['files'])) {
    $uploadedFiles = $_FILES['files'];
    foreach ($uploadedFiles['name'] as $key => $fileName) {
        $tmpFilePath = $uploadedFiles['tmp_name'][$key];
            $filePath = $uploadDir . '/' . $fileName;
            if (move_uploaded_file($tmpFilePath, $filePath)) {
                $uploadNum = $uploadNum  + 1;
                $filePath = "/src/treck" . '/' . $fileName;
            } else {
                $data["error"] = $data["error"] .  "Ошибка при перемещении файла: " . $fileName . "<br>";
            }
    }
} else {
    $data["error"] = $data["error"] . "Нет отправленных файлов." . "<br>";
}
$data["result"] = "Загруженно " . $uploadNum . " Файлов" ."<br>";
systemResponse($data);