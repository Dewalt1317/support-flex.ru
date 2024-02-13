<?php
$fileTemp = "../temp/TitleData.json";
$isecastConf = "../config/isecast.conf";
$config = json_decode(file_get_contents($isecastConf));
$temp = json_decode(file_get_contents($fileTemp));
$data = file_get_contents($config->link);
$data = json_decode($data);
$title = $data->icestats->source->title;
$listeners = $data->icestats->source->listeners;
$dataTitle = "";
if ($title == ""){
    $dataTitle = ["title" => "Попробуйте зайти позже - Трансляция отключена", "listeners" => 0, "cover" => "off", "link" => "https://music.apple.com/ru/browse", "status" => "off"];
    file_put_contents($fileTemp, "");
} elseif ($title == $temp->title) {
    $dataTitle = ["title" => $temp->title, "listeners" => $listeners, "cover" => $temp->cover, "link" => $temp->link, "status" => "no response"];
} else {
    $search = str_replace(" ", "%20", str_replace(" - ", " ", str_replace("&", " ", $title)));
    $link = "https://itunes.apple.com/search?term=" . $search;
    $data = file_get_contents($link);
    $data = json_decode($data);
    $linkTrack = $data->results[0]->trackViewUrl;
    if ($data->results[0]->kind == "music-video"){
        $link = "https://itunes.apple.com/lookup?id=" . $data->results[0]->collectionId;
        $data = file_get_contents($link);
        $data = json_decode($data);
    }
    $cover = str_replace("100x100", "1000x1000", $data->results[0]->artworkUrl100);
    if ($linkTrack == ""){
        $linkTrack = "off";
    }
    if ($cover == ""){
        $cover = "off";
    }
    $dataTitle = ["title" => $title, "listeners" => $listeners, "cover" => $cover, "link" => $linkTrack,"status" => "response"];
    $data = json_encode($dataTitle, JSON_UNESCAPED_UNICODE);
    file_put_contents($fileTemp, $data);
    $id = id(8443);
    $mysql->query("INSERT INTO `treckHistory` (`treckHistoryID`, `title`, `coverSRC`, `link`, `listeners`, `data`, `time`) VALUES ('$id', '$title', '$cover', '$link', '$listeners', CURDATE(), CURTIME())");
}