<?php
function getTitle()
{
    $fileTemp = "temp/TitleData.json";
    $isecastConf = "config/isecast.conf";
    $config = json_decode(file_get_contents($isecastConf));
    $temp = json_decode(file_get_contents($fileTemp));
    $data = file_get_contents($config->link);
    $data = json_decode($data);
    $title = $data->icestats->source->title;
    $listeners = $data->icestats->source->listeners;
    $dataTitle = "";

    if (!$title) {
        $dataTitle = ["name" => "Трансляция отключена", "artist" => "Попробуйте зайти позже", "listeners" => 0, "cover" => "off", "applelink" => "https://music.apple.com", "yandexlink" => "https://music.yandex.ru/", "youtubelink" => "https://music.youtube.com/", "status" => "off", "trackID" => "off"];
        file_put_contents($fileTemp, "");
        return $dataTitle;
    }

    $title = json_decode($title);

    if ($title->trackID == $temp->trackID || $title->name == $temp->name) {
        $dataTitle = ["name" => $temp->name, "artist" => $temp->artist, "listeners" => $listeners, "cover" => $temp->cover, "applelink" => $temp->applelink, "yandexlink" => $temp->yandexlink, "youtubelink" => $temp->youtubelink, "status" => "noResponse", "trackID" => $temp->trackID];
        return $dataTitle;
    } elseif ($title->trackID) {
        $trackData = [];
        include "WSDB-Config.php";
        $track = $mysql->query("SELECT `name`, `artist`, `cover`, `appleLink`, `yandexLink`, `youtubeLink`, `analysis`, `ExplicitContent` FROM `treck` WHERE `treckID` = '$title->trackID'");
        if ($mysql->error_list[0]["errno"] == null) {
            while ($row = $track->fetch_assoc()) {
                array_push($trackData, $row);
            }
            $mysql->close();
            $trackData = $trackData[0];
            if($trackData["analysis"] == true){
                if(!$trackData["appleLink"]){
                    $trackData["appleLink"] = "off";
                }
                if(!$trackData["yandexLink"]){
                    $trackData["yandexLink"] = "off";
                }
                if(!$trackData["youtubeLink"]){
                    $trackData["youtubeLink"] = "off";
                }
            $dataTitle = ["name" => $trackData["name"], "artist" => $trackData["artist"], "listeners" => $listeners, "cover" => $trackData["cover"], "applelink" => $trackData["appleLink"], "yandexlink" => $trackData["yandexLink"], "youtubelink" => $trackData["youtubeLink"], "status" => "responseFromDB", "trackID" => $title->trackID];
        } else {
            $trackData = "";
        }
        } else {
            $trackData = "";
        }
    }

    if (!$title->trackID || !$trackData) {
        $search = str_replace(" ", "%20", str_replace(" - ", " ", str_replace("&", " ", $title->artist)));
        $search = $search . "%20" . str_replace(" ", "%20", str_replace(" - ", " ", str_replace("&", " ", $title->name)));
        $link = "https://itunes.apple.com/search?term=" . $search;
        $data = file_get_contents($link);
        $data = json_decode($data);
        $linkTrack = $data->results[0]->trackViewUrl;
        if ($data->results[0]->kind == "music-video") {
            $link = "https://itunes.apple.com/lookup?id=" . $data->results[0]->collectionId;
            $data = file_get_contents($link);
            $data = json_decode($data);
        }
        $cover = str_replace("100x100", "1000x1000", $data->results[0]->artworkUrl100);
        if ($linkTrack == "") {
            $linkTrack = "off";
        }

        $dataTitle = ["name" => $title->name, "artist" => $title->artist, "listeners" => $listeners, "cover" => $cover, "applelink" => $linkTrack, "yandexlink" => "off", "youtubelink" => "off", "status" => "responseFromApple", "trackID" => id(404)];
    }
    if(!$dataTitle["cover"]){
        $dataTitle["cover"] = "off";
    }
    $cover = $dataTitle["cover"];
    $data = json_encode($dataTitle, JSON_UNESCAPED_UNICODE);
    file_put_contents($fileTemp, $data);
    include "WSDB-Config.php";
    $id = id(8443);
    $title = $dataTitle["name"] . " - " .$dataTitle["artist"];
    $mysql->query("INSERT INTO `treckHistory` (`treckHistoryID`, `title`, `coverSRC`, `link`, `listeners`, `date`, `time`) VALUES ('$id', '$title', '$cover', '$link', '$listeners', CURDATE(), CURTIME())");
    print_r($mysql);
    $mysql->close();

    return $dataTitle;
}