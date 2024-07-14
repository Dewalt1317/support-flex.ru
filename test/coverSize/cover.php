<?php
function resizeAndSaveImage($imageUrl, $savePath, $fileName) {
    // Получение информации о файле и его расширении
    $fileInfo = pathinfo($imageUrl);
    $extension = isset($fileInfo['extension']) ? '.' . $fileInfo['extension'] : '';

    // Загрузка изображения
    $image = imagecreatefromstring(file_get_contents($imageUrl));
    if (!$image) {
        die('Не удалось загрузить изображение.');
    }

    // Получение размеров изображения
    $width = imagesx($image);
    $height = imagesy($image);

    // Проверка, нужно ли изменять размер изображения
    if ($width > 1000 || $height > 1000) {
        // Вычисление новых размеров
        $ratio = min(1000 / $width, 1000 / $height);
        $newWidth = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);

        // Создание нового изображения
        $newImage = imagecreatetruecolor($newWidth, $newHeight);

        // Копирование и изменение размера старого изображения в новое
        imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Сохранение нового изображения
        imagejpeg($newImage, $savePath . DIRECTORY_SEPARATOR . $fileName . $extension);

        // Освобождение памяти
        imagedestroy($newImage);
    } else {
        // Сохранение оригинального изображения, если его размер меньше 1000x1000
        imagejpeg($image, $savePath . DIRECTORY_SEPARATOR . $fileName . $extension);
    }

    // Освобождение памяти
    imagedestroy($image);
}
// Пример использования функции
resizeAndSaveImage('https://ia801907.us.archive.org/0/items/mbid-c100c980-581d-49c4-84d6-980eae13f4b3/mbid-c100c980-581d-49c4-84d6-980eae13f4b3-26937321769.jpg', '../../src/image/cover', 'Zivert Баста - Неболей');
