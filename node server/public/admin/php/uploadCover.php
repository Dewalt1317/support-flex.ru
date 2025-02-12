<?php
include "../../php/response.php";
$data = json_decode(file_get_contents("php://input"));

function sanitize_filename($filename) {
  return preg_replace('/[^ a-zа-я\\d.]/ui', '', $filename);
}

$result = resizeAndSaveImage($data);
systemResponse(["url" => $result]);


function resizeAndSaveImage($data)
{
  $imageUrl = $data->url;
  $fileName = sanitize_filename($data->name);
  $savePath = '../../src/image/cover';

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

    // Генерация уникального имени файла, если файл с таким именем уже существует
    $finalFileName = $fileName;
    $counter = 1;
    while (file_exists($savePath . DIRECTORY_SEPARATOR . $finalFileName . $extension)) {
      $finalFileName = $fileName . '_' . $counter;
      $counter++;
    }

    // Сохранение нового изображения
    imagejpeg($newImage, $savePath . DIRECTORY_SEPARATOR . $finalFileName . $extension);

    // Освобождение памяти
    imagedestroy($newImage);
  } else {
    // Генерация уникального имени файла, если файл с таким именем уже существует
    $finalFileName = $fileName;
    $counter = 1;
    while (file_exists($savePath . DIRECTORY_SEPARATOR . $finalFileName . $extension)) {
      $finalFileName = $fileName . '_' . $counter;
      $counter++;
    }

    // Сохранение оригинального изображения, если его размер меньше 1000x1000
    imagejpeg($image, $savePath . DIRECTORY_SEPARATOR . $finalFileName . $extension);
  }

  // Освобождение памяти
  imagedestroy($image);

  $savePath = '/src/image/cover';

  // Возвращение пути к файлу
  return $savePath . "/" . $finalFileName . $extension;
}