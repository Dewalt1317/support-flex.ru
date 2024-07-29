<?php
session_start();
include "../../php/DB-Config.php";
include "../../php/response.php";
include "../../php/idGenerator.php";
$data = json_decode(file_get_contents("php://input"));
$sql;

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
        $mysql->query("UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = '$id' WHERE (`analysis` IS NULL OR `analysis` = 0) AND ((`selectIN` < '$time' or `selectIN` IS NULL) AND (`sessionID` = '$id' or `sessionID` IS NULL))limit 1");
        $mysql->multi_query("SELECT `treckID`, `name`, `SRC`, `duration` FROM `treck` WHERE `sessionID` = '$id' limit 1; SELECT `categoryID`, `category` FROM `category`; SELECT `artistLinkID`, `artistLink` FROM `artistLink`; SELECT `moodID`, `mood` FROM `mood`;");
        $data = [];
        do {
            if ($result = $mysql->store_result()) {
                array_push($data, $result->fetch_all(MYSQLI_ASSOC));
                $result->free();
            }
        } while ($mysql->more_results() && $mysql->next_result());
        $data = ['name' => $data[0][0]['name'], 'treckID' => $data[0][0]['treckID'], 'SRC' => $data[0][0]['SRC'], 'duration' => $data[0][0]['duration'], 'artists' => $data[2], 'category' => $data[1], 'mood' => $data[3]];

        if ($data['treckID'] == null){
            $data = ['status' => 'absent'];
        }
        systemResponse($data);
        break;

    case "getSkipped":
        $mysql->query("UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = '$id' WHERE `sessionID` = 'skiped' limit 1");
        $mysql->multi_query("SELECT `treckID`, `name`, `SRC`, `duration` FROM `treck` WHERE `sessionID` = '$id' limit 1; SELECT `categoryID`, `category` FROM `category`; SELECT `artistLinkID`, `artistLink` FROM `artistLink`; SELECT `moodID`, `mood` FROM `mood`;");
        $data = [];
        do {
            if ($result = $mysql->store_result()) {
                array_push($data, $result->fetch_all(MYSQLI_ASSOC));
                $result->free();
            }
        } while ($mysql->more_results() && $mysql->next_result());
        $data = ['name' => $data[0][0]['name'], 'treckID' => $data[0][0]['treckID'], 'SRC' => $data[0][0]['SRC'], 'duration' => $data[0][0]['duration'], 'artists' => $data[2], 'category' => $data[1], 'mood' => $data[3]];
        if ($data['treckID'] == null){
            $data = ['status' => 'absent'];
        }
        systemResponse($data);
        break;

    case "send":
        $newMood = SQLCollector($data->treck->moodNew, "mood", "new", 3009, "moodID", "mood");
        $newCategory = SQLCollector($data->treck->categoryNew, "category", "new", 0307, "categoryID", "category");
        $newArtist = SQLCollector($data->treck->artistLinkNew, "artistLink", "new", 2408, "artistLinkID", "artistLink");
        $sql = $newMood["sql"];
        $sql = $sql . $newCategory["sql"];
        $sql = $sql . $newArtist["sql"];
        $sql = $sql . SQLCollector($newCategory["id"], "treckCategory", "add", $data->treck->treckID, "categoryID", "treckID");
        $sql = $sql . SQLCollector($newArtist["id"], "treckArtistLink", "add", $data->treck->treckID, "artistLinkID", "treckID");
        $sql = $sql . SQLCollector($data->treck->category, "treckCategory", "add", $data->treck->treckID, "categoryID", "treckID");
        $sql = $sql . SQLCollector($data->treck->artistLink, "treckArtistLink", "add", $data->treck->treckID, "artistLinkID", "treckID");
        if ($newMood["id"][0] == "") {
            $mood = $data->treck->mood[0];
        } else {
            $mood = $newMood["id"][0];
        }
        if ($data->treck->SRC != $data->treck->SRCNew){
            copy('../..'.$data->treck->SRC, '../..'.$data->treck->SRCNew);
            unlink('../..'.$data->treck->SRC);
        }
        $name = mysqli_real_escape_string($mysql, addslashes($data->treck->name));
        $artist = mysqli_real_escape_string($mysql, addslashes($data->treck->artist));
        $SRC = mysqli_real_escape_string($mysql, addslashes($data->treck->SRCNew));
        $duration = mysqli_real_escape_string($mysql, addslashes($data->treck->duration));
        $treckID = mysqli_real_escape_string($mysql, addslashes($data->treck->treckID));
        $appleLink = mysqli_real_escape_string($mysql, addslashes($data->treck->appleLink));
        $yandexLink = mysqli_real_escape_string($mysql, addslashes($data->treck->yandexLink));
        $youtubeLink = mysqli_real_escape_string($mysql, addslashes($data->treck->youtubeLink));
        $cover = mysqli_real_escape_string($mysql, addslashes($data->treck->cover));
        $year = mysqli_real_escape_string($mysql, addslashes($data->treck->year));
        $hookIn = mysqli_real_escape_string($mysql, addslashes($data->treck->hookIn));
        $hookOut = mysqli_real_escape_string($mysql, addslashes($data->treck->hookOut));
        if($data->treck->ExplicitContent){
            $ExplicitContent = 1;
        } else {
            $ExplicitContent = 0;
        }
        $login = mysqli_real_escape_string($mysql, addslashes($_SESSION['user_name']));
        $sql = $sql . "UPDATE `treck` SET `selectIN` = NULL, `sessionID` = NULL, `name` = '$name', `artist` = '$artist', `SRC` = '$SRC', `duration` = '$duration', `moodID` = '$mood', `appleLink` = '$appleLink', `yandexLink` = '$yandexLink', `youtubeLink` = '$youtubeLink', `analysis` = '1', `analyzed` = '$login', `cover` = '$cover', `ExplicitContent` = '$ExplicitContent', `year` = '$year', `hookIn` = '$hookIn', `hookOut` = '$hookOut' WHERE `treckID` = '$treckID';";
        $dataSend["sql"] = $sql;
        $sql = $mysql->multi_query($sql);
        if ($mysql->error_list[0]["errno"] == null){
            $dataSend["result"] = "saveOK";
            $dataSend["data"] = $data;
        } else {
            $dataSend['result'] = 'error';
            $dataSend["data"] = $data;
            $dataSend["sql"] = $sql;
        }
        systemResponse($dataSend);
        break;

    case "skip":
        $id = $data->id;
        $mysql->query("UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = 'skiped' WHERE `treckID` = '$id'");
        $dataSend["result"] = "skipOK";
        systemResponse($dataSend);
        break;

    case "out":
        $id = $data->id;
        $mysql->query("UPDATE `treck` SET `selectIN` = NULL, `sessionID` = NULL WHERE `treckID` = '$id'");
        break;
}