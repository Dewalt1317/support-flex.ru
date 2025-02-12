<?php
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

// Пример использования функции
$data = [
    ["catrgory" => "199669db853d05a56.15727506", "mood" => "3009657298650f5df1.19639936"],
    ["catrgory" => "199669db853d05202.52927627", "mood" => "3009657298650f5df1.19639936"]
];
    $validTimeIteration = 0;
    $validTime = 0;
function manipulateDateTime($time1, $date1, $time2, $day, $operation) {
    global $validTime;
    $timeFormat = 'H:i:s';
    $dateFormat = 'Y-m-d';
    $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $time1");
    $datetime2 = DateTime::createFromFormat($timeFormat, $time2);
    
    if (!$datetime1 || !$datetime2) {
        return "Invalid time or date format.";
    }

    switch ($operation) {
        case 'subtract':
            $interval = new DateInterval("P{$day}D");
            $datetime1->sub($interval);
            $interval = $datetime2->diff(new DateTime('00:00:00'));
            $datetime1->add($interval);
            $result = 'subtract';
            break;
        case 'add':
            $interval = new DateInterval("P{$day}D");
            $datetime1->add($interval);
            $interval = $datetime2->diff(new DateTime('00:00:00'));
            $datetime1->sub($interval);
            $result = 'add';
            break;
        case 'compare':
          $timeCompare2 = DateTime::createFromFormat("$dateFormat $timeFormat", "$day $time2");
            if ($datetime1 > $timeCompare2) {
                $result = 'greater';
            } elseif ($datetime1 < $timeCompare2) {
                $result = 'less';
            } else {
                $result = 'equal';
            }
            break;
        case 'clockAdd':
          $time1 = explode(":",$time1);
          $time2 = explode(":",$time2);
          $s = abs(validTimeAdd($time1[2] + $time2[2]));
          $m = abs(validTimeAdd($time1[1] + $time2[1] + $validTime));
          $h = abs($time1[0] + $time2[0] + $validTime);
          if($h < 10){
            $h = 0 . $h;
          }
          if($m < 10){
            $m = 0 . $m;
          }
          if($s < 10){
            $s = 0 . $s;
          }
          $HSM = $h . ":" . $m . ":" . $s;
          $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $HSM");
            $result = 'add';
            break;
        case 'clockSubtract':
            $time1 = explode(":",$time1);
            $time2 = explode(":",$time2);
            $s = abs(validTimeSubtract($time1[2] - $time2[2]));
            $m = abs(validTimeSubtract($time1[1] - $time2[1] - $validTime));
            $h = abs($time1[0] - $time2[0] - $validTime);
            if($h < 10){
                $h = 0 . $h;
              }
              if($m < 10){
                $m = 0 . $m;
              }
              if($s < 10){
                $s = 0 . $s;
              }
            $HSM = $h . ":" . $m . ":" . $s;
             $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $HSM");
            $result = 'subtract';
            break;
        case 'clockCompare':
            $time1 = explode(":",$time1);
            $time2 = explode(":",$time2);
            if ($time1[0] > $time2[0]) {
                $result = 'greater';
            } elseif ($time1[0] < $time2[0]) {
                $result = 'less';
            } else {
                if ($time1[1] > $time2[1]) {
                    $result = 'greater';
                } elseif ($time1[1] < $time2[1]) {
                    $result = 'less';
                } else {
                    if ($time1[2] > $time2[2]) {
                        $result = 'greater';
                    } elseif ($time1[2] < $time2[2]) {
                        $result = 'less';
                    } else {
                        $result = 'equal';
                    }
                }
            }   
            break;
        default:
            return "Invalid operation.";
    }

    return [
        "date" => $datetime1->format($dateFormat),
        "time" => $datetime1->format($timeFormat),
        "result" => $result
    ];
}
function validTimeAdd ($time) {
    global $validTimeIteration;
    global $validTime;
    if($time > 60) {
        $time = $time - 60;
        $validTimeIteration = $validTimeIteration + 1;
        return validTimeAdd($time);
    } else {
        $validTime = $validTimeIteration;
        $validTimeIteration = 0;
        return $time;
    }
}

function validTimeSubtract ($time) {
    global $validTimeIteration;
    global $validTime;
    if($time < 0) {
        $time = $time + 60;
        $validTimeIteration = $validTimeIteration + 1;
        return validTimeSubtract($time);
    } else {
        $validTime = $validTimeIteration;
        $validTimeIteration = 0;
        return $time;
    }
}

function generateClock($name, $date, $time, $duration, $tracks, $stopCategories, $nonRepetitionRules, $previousTracks, $nextTracks, $maxEnumeration, $maxShortfall) {
  $stop = false;
  $trackAdd = true;
  $categoryID = "";
  $dur = "00:00:00";
  $clock = [];
  $durationShortfall = manipulateDateTime($duration, $date, $maxShortfall, '0', 'clockSubtract')['time'];
  $durationEnumeration = manipulateDateTime($duration, $date, $maxEnumeration, '0', 'clockAdd')['time'];
  while (manipulateDateTime($dur, $date, $durationShortfall, "0", 'clockCompare')["result"] !== "greater"){
    foreach($tracks as  $key => $cat){
      if(!$trackAdd){
        if($categoryID !== $cat["categoryID"]){
          continue;
        }
      }
      if(!$cat["tracks"]){
        $stop = true;
        break 2;
      }
        $trackKey = array_key_first($cat["tracks"]);
        $trackClock = $cat["tracks"][$trackKey];
      if(!checkStopCategories($trackClock["categories"], $stopCategories)){
        unset($cat["tracks"][$trackKey]);
        $tracks[$key]["tracks"] =  $cat["tracks"];
        $categoryID = $cat["categoryID"];
        $trackAdd = false;
        continue;
      }
      $trackTimeDate = manipulateDateTime($time, $date, manipulateDateTime($dur, $date, $trackClock["duration"], "0", 'clockAdd')["time"], "0", 'add');
      if(!checkArtistStopAndTrackID($trackClock, $previousTracks, $nextTracks, $trackTimeDate, $nonRepetitionRules)){
        unset($cat["tracks"][$trackKey]);
        $tracks[$key]["tracks"] =  $cat["tracks"];
        $categoryID = $cat["categoryID"];
        $trackAdd = false;
        continue;
      }

      if(!checkArtistStopAndTrackIDForClock($trackClock, $clock, $trackTimeDate, $nonRepetitionRules)){
        unset($cat["tracks"][$trackKey]);
        $tracks[$key]["tracks"] =  $cat["tracks"];
        $categoryID = $cat["categoryID"];
        $trackAdd = false;
        continue;
      }

      $dur = manipulateDateTime($dur, $date, $trackClock["duration"], "0", 'clockAdd')["time"];
      $data = ["treckID"=>$trackClock["treckID"], "time"=>$trackTimeDate["time"], "date"=>$trackTimeDate["date"], "artistLinkIDs"=>$trackClock["artistLinkIDs"]];
      array_push($clock, $data);
      $trackAdd = true;
      $categoryID = "";

        unset($cat["tracks"][$trackKey]);
        $tracks[$key]["tracks"] =  $cat["tracks"];
        }
        unset($cat); 
   }
   print_r(json_encode($clock));
   if($stop){
    return "Нам не хватило треков" . "<br>" . $dur;
   }
} 

function checkStopCategories($idArr, $catAarr) {
  foreach($idArr as $id) {
    foreach($catAarr as $cat) {
      if ($id === $cat) {
        return false;
      }
    }
  }
  return true;
}

function checkArtistStopAndTrackID($TrackAnalysis, $tracksArr1, $tracksArr2, $trackAnalysisTimeDate, $nonRepetitionRules) {
  foreach($tracksArr1 as $track){
    $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["track"], "0", 'subtract');
    if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
      if($TrackAnalysis["treckID"] !== $track["treckID"]){
        $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["artist"], "0", 'subtract');
        if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
          foreach($TrackAnalysis["artistLinkIDs"] as $artist){
            foreach($track["artistLinkIDs"] as $artistArr){
              if($artist === $artistArr){
                return false;
              }
            }
            unset($artistArr);
          }
          unset($artist);
        }
      } else {
        return false;
      }
    }
  }
  unset($track);
  foreach($tracksArr2 as $track){
    $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["track"], "0", 'add');
    if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "greater"){
      if($TrackAnalysis["treckID"] !== $track["treckID"]){
        $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["artist"], "0", 'add');
        if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "greater"){
        foreach($TrackAnalysis["artistLinkIDs"] as $artist){
          foreach($track["artistLinkIDs"] as $artistArr){
            if($artist === $artistArr){
              return false;
            }
          }
          unset($artistArr);
        }
        unset($artist);
      }
      } else {
        return false;
      }
    }
  }
  unset($track);
  return true;
}

function checkArtistStopAndTrackIDForClock($TrackAnalysis, $tracksArr, $trackAnalysisTimeDate, $nonRepetitionRules){
  foreach($tracksArr as $track){
    $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["track"], "0", 'subtract');
    if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
      if($TrackAnalysis["treckID"] !== $track["treckID"]){
        $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["artist"], "0", 'subtract');
        if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
          foreach($TrackAnalysis["artistLinkIDs"] as $artist){
            foreach($track["artistLinkIDs"] as $artistArr){
              if($artist === $artistArr){
                return false;
              }
            }
            unset($artistArr);
          }
          unset($artist);
        }
      } else {
        return false;
      }
    }
  }
  unset($track);
  return true;
}

$name = "Morning Show";
$date = "2024-07-17";
$time = "01:00:00";
$maxShortfall = "00:00:10";
$maxEnumeration = "00:00:30";
$duration = "02:00:00"; // 1 час
$tracks = getTrackDetails($data);
$stopCategories = ["1996572cd54d8b498.20963332", "1996572cd54d8b468.24089727"];
$nonRepetitionRules = ["artist" => "02:00:00", "track" => "06:00:00"];
$previousTracks = [
    [
        "treckID" => "9000779580d9he5b90.69795410",
        "time" => "00:45:00",
        "date" => "2024-07-10",
        "artistLinkIDs" => ["350977052fbb5b7361.01458755", "350977052fbb5b73e6.29529753", "350977052fbb5b7408.61347589"]
    ],
    [
        "treckID" => "7000557368b7fc3a78.47573208",
        "time" => "00:30:00",
        "date" => "2024-07-17",
        "artistLinkIDs" => ["140755831d9983a514.79236421", "140755831d9983a529.07307419", "140755831d9983a541.39125255"]
    ],
    [
        "treckID" => "6000446257a6eb2a67.36462107",
        "time" => "00:15:00",
        "date" => "2024-07-17",
        "artistLinkIDs" => ["240644720c8872a403.57115287", "240644720c8872a418.85186285", "240644720c8872a430.17004121"]
    ],
    [
        "treckID" => "5000335146a5da196.25351006",
        "time" => "01:30:00",
        "date" => "2024-07-17",
        "artistLinkIDs" => ["340533609b7761a292.34994153", "340533609b7761a307.63065151", "340533609b7761a319.94882987"]
    ]
];
$nextTracks = [
    [
        "treckID" => "7000557368b7fc3a78.47573208",
        "time" => "02:30:12",
        "date" => "2024-07-27",
        "artistLinkIDs" => ["140755831d9983a514.79236421", "140755831d9983a529.07307419", "140755831d9983a541.39125255"]
    ],
    [
        "treckID" => "6000446257a6eb2a67.36462107",
        "time" => "02:10:00",
        "date" => "2024-07-27",
        "artistLinkIDs" => ["240644720c8872a403.57115287", "240644720c8872a418.85186285", "240644720c8872a430.17004121"]
    ],
    [
        "treckID" => "5000335146a5da196.25351006",
        "time" => "02:05:00",
        "date" => "2024-07-17",
        "artistLinkIDs" => ["340533609b7761a292.34994153", "340533609b7761a307.63065151", "340533609b7761a319.94882987"]
    ],
    [
        "treckID" => "9000779580d9he5b90.69795410",
        "time" => "02:00:00",
        "date" => "2024-07-17",
        "artistLinkIDs" => ["350977052fbb5b7361.01458755", "350977052fbb5b73e6.29529753", "350977052fbb5b7408.61347589"]
    ]
];

print_r(generateClock($name, $date, $time, $duration, $tracks, $stopCategories, $nonRepetitionRules, $previousTracks, $nextTracks, $maxEnumeration, $maxShortfall));
