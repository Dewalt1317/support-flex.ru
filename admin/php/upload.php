<?php
include "../../php/DB-Config.php";
include "../../php/response.php";
include "../../php/idGenerator.php";
require_once('../../lib/php/getid3/getid3.php');
require_once('../../lib/php/getid3/write.php'); // Добавлено для записи тегов

if ($mysql->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysql->connect_error);
}

$data = [];
$uploadDir = '../../src/treck';

if (isset($_FILES['files'])) {
    $uploadedFiles = $_FILES['files'];

    foreach ($uploadedFiles['name'] as $key => $fileName) {
        $tmpFilePath = $uploadedFiles['tmp_name'][$key];

        if (pathinfo($fileName, PATHINFO_EXTENSION) == 'mp3') {
            $filePath = $uploadDir . '/' . $fileName;

            if (move_uploaded_file($tmpFilePath, $filePath)) {
                $treckID = id(8000);

                // Создаем новый экземпляр класса getID3
                $getID3 = new getID3;
                $tagwriter = new getid3_writetags;

                $tagwriter->filename = $filePath;
                $tagwriter->tagformats = array('id3v2.3');
                $tagwriter->overwrite_tags = true;
                $tagwriter->tag_encoding = 'UTF-8';
                $tagwriter->remove_other_tags = false;

                // Добавляем информацию в тег комментария
                $tagwriter->tag_data = array(
                    'comment' => array($treckID),
                );

                // Записываем теги в файл
                if (!$tagwriter->WriteTags()) {
                    echo 'Failed to write tags!<br>'.implode('<br><br>', $tagwriter->errors);
                }

                $fileInfo = $getID3->analyze($filePath);
                $playTime = $fileInfo['playtime_seconds'];
                $minutes = floor($playTime / 60);
                $seconds = $playTime % 60;
                $duration = "0:" . $minutes . ":" . $seconds;
                $filePath = "/src/treck" . '/' . $fileName;

                $mysql->query("INSERT INTO treck (`treckID`, `name`, `SRC`, `duration`) VALUES ('$treckID', '$fileName', '$filePath', '$duration')");
                $mysql->close();

                $data["uploadedFiles"] = "Файл " . $fileName . " Загружен";
            } else {
                $data["error"] = "Ошибка при перемещении файла: " . $fileName;
            }
        } else {
            $data["error"] = "Неподдерживаемый формат файла: " . $fileName;
        }
    }
} else {
    $data["error"] = "Нет отправленных файлов.";
}

systemResponse($data);
?>
