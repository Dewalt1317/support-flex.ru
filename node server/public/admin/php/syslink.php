<?php

function getFilePathById($id) {
  require "../../php/DB-Config.php";
    // Подготавливаем SQL-запрос
    $stmt = $mysql->query("SELECT SRC FROM track WHERE trackID = '$id'");
   
   print_r($mysq);
   print_r("test");
    // Получаем результат
      // $row = $stmt->fetch_assoc();

    if ($row) {
        return $row['SRC'];
    } else {
        return null;
    }
    $mysql->close();
}

function createSymbolicLinks($ids) {
    $destinationFolder = '../file/track/received/';

    foreach ($ids as $id) {
        // Получаем путь к файлу по ID
        $filePath = getFilePathById($id);

        // Создаем имя для символьной ссылки
        $linkName = $destinationFolder . 'link_to_' . $id;

        // Создаем символьную ссылку
        if (!symlink($filePath, $linkName)) {
            echo "Не удалось создать символьную ссылку для файла: $filePath\n";
        }
    }
}

// Массив ID файлов
$fileIds = json_decode(file_get_contents("php://input"));
createSymbolicLinks($fileIds->selectedTrackIds);
?>
