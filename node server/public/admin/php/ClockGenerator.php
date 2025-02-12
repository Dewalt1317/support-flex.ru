<?php
session_start();
include "../../php/DB-Config.php";
include "../../php/response.php";
include "../../php/idGenerator.php";
$data = json_decode(file_get_contents("php://input"));

$id = session_id();
$hor = date("H");
$min = date("i") - 30;
$sec = date("s");

if ($min < 0) {
    $min = 60 + $min;
    $hor = $hor - 1;
}

if ($hor < 0) {
    $hor = 24 + $hor;
}
$time = $hor . ":" . $min . ":" . $sec;

function SQLCollector($arr, $table, $add, $prefixID, $colum1, $colum2)
{
    if ($arr == null) {
        return;
    } elseif ($add == "new") {
        $newID = [];
        $new = [];
        foreach ($arr as $value) {

            $id = id($prefixID);
            $sql = $sql . "INSERT INTO $table ($colum1, $colum2) values('$id', '$value');";
            array_push($newID, $id);
        }
        $new["sql"] = $sql;
        $new["id"] = $newID;
        return ($new);

    } elseif ($add == "add") {
        foreach ($arr as $value) {
            if ($value != "no") {
                $sql = $sql . "INSERT INTO $table ($colum1, $colum2) values('$value', '$prefixID');";
            }
        }
        return ($sql);
    }
}

switch ($data->comand) {
    case "get":
        $mysql->multi_query("SELECT `categoryID`, `category` FROM `category`; SELECT `moodID`, `mood` FROM `mood`;");
        $data = [];
        do {
            if ($result = $mysql->store_result()) {
                array_push($data, $result->fetch_all(MYSQLI_ASSOC));
                $result->free();
            }
        } while ($mysql->more_results() && $mysql->next_result());
        $data = ['category' => $data[0], 'mood' => $data[1], 'status' => 'getOK'];

        if ($data == null) {
            $data = ['status' => 'absent'];
        }
        systemResponse($data);
        break;
}

function systemResponse($data)
{
  if (!$data) { // Проверяем не пустые ли данные
    echo json_encode(["error" => "Пустой ответ от сервера"]);
    exit();
  }
  // Если все в порядке и есть что отправлять, отправляем ответ на фронт 
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function getTrackDetails($data) {
    // Подключение к базе данных (замените параметры на свои)
    $fileConfDB = "../../config/DBconfig.conf";
    $DBconfig = json_decode(file_get_contents($fileConfDB));

    // Подключаемся к БД
    $mysql = new mysqli($DBconfig->url, $DBconfig->userName, $DBconfig->password, $DBconfig->name);

    // Установка кодировки соединения
    $mysql->query("SET NAMES utf8mb4_unicode_ci");
    $mysql->query("SET CHARACTER SET utf8mb4_unicode_ci");
    $mysql->query("SET character_set_connection=utf8mb4_unicode_ci");

    $conn = $mysql;

    // Проверка соединения
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Массив для хранения результатов
    $result = [];

    // Перебор каждого элемента в массиве $data
    foreach ($data as $item) {
        $categoryID = $item['catrgory'];
        $moodID = $item['mood'];

        // SQL запрос для получения id треков и длительности
        $sql = "SELECT t.treckID, t.duration 
                FROM treckCategory tc
                JOIN treck t ON tc.treckID = t.treckID
                WHERE tc.categoryID = '$categoryID' AND t.moodID = '$moodID'";

        $queryResult = $conn->query($sql);

        $categoryMoodTracks = [];
        if ($queryResult->num_rows > 0) {
            // Сохранение результатов в массив
            while ($row = $queryResult->fetch_assoc()) {
                $treckID = $row['treckID'];
                $duration = $row['duration'];

                // SQL запрос для получения id артистов
                $sqlArtists = "SELECT artistLinkID 
                               FROM treckArtistLink 
                               WHERE treckID = '$treckID'";

                $queryResultArtists = $conn->query($sqlArtists);

                $artistLinkIDs = [];
                if ($queryResultArtists->num_rows > 0) {
                    while ($rowArtist = $queryResultArtists->fetch_assoc()) {
                        $artistLinkIDs[] = $rowArtist['artistLinkID'];
                    }
                }

                // SQL запрос для получения всех категорий трека
                $sqlCategories = "SELECT categoryID 
                                  FROM treckCategory 
                                  WHERE treckID = '$treckID'";

                $queryResultCategories = $conn->query($sqlCategories);

                $categories = [];
                if ($queryResultCategories->num_rows > 0) {
                    while ($rowCategory = $queryResultCategories->fetch_assoc()) {
                        $categories[] = $rowCategory['categoryID'];
                    }
                }

                $categoryMoodTracks[] = [
                    'treckID' => $treckID,
                    'duration' => $duration,
                    'artistLinkIDs' => $artistLinkIDs,
                    'categories' => $categories
                ];
            }
        }

        $result[] = [
            'categoryID' => $categoryID,
            'moodID' => $moodID,
            'tracks' => $categoryMoodTracks
        ];
    }

    // Закрытие соединения
    $conn->close();

    return $result;
}