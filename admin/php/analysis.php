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
    $sqlf = "";
    if ($arr == null) {
        return;
    } elseif ($add == "add") {
        foreach ($arr as $value) {
            if ($value != "no") {
                $sqlf = $sqlf . "INSERT INTO $table ($colum1, $colum2) values('$value', '$prefixID');";
            }
        }
        return ($sqlf);
    }
}

switch ($data->comand) {
    case "get":
            $myid = $data->id;
            if($data->id){
                $whire = " WHERE `treckID` = '$data->id' ";
                $whire2 = " WHERE `treckID` = '$data->id' ";
            } else {
                $whire = " WHERE (`analysis` IS NULL OR `analysis` = 0) AND ((`selectIN` < '$time' or `selectIN` IS NULL) AND (`sessionID` = '$id' or `sessionID` IS NULL)) ";
                $whire2 = " WHERE `sessionID` = '$id' ";
            }
            $sql = "UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = '$id'".$whire." LIMIT 1";
            $mysql->query($sql);    
            $sql = "SELECT `treckID`, `name`, `artist`, `SRC`, `cover`, `duration`, `moodID`, `appleLink`, `yandexLink`, `youtubeLink`, `uploaded`, `analyzed`, `ExplicitContent`, `year`, `hookIn`, `hookOut` FROM `treck`".$whire2."limit 1";
            $result = $mysql->query($sql);
            $row = $result->fetch_assoc();
            $updated_id = $row['treckID'];
            $mood_id = $row['moodID'];
            $mysql->multi_query("SELECT c.categoryID, c.category FROM category c JOIN treckCategory tc ON c.categoryID = tc.categoryID WHERE tc.treckID = '$updated_id'; SELECT a.artistLinkID, a.artistLink FROM artistLink a JOIN treckArtistLink ta ON a.artistLinkID = ta.artistLinkID WHERE ta.treckID = '$updated_id'; SELECT `moodID`, `mood` FROM `mood` WHERE `moodID` = '$mood_id';");
            $data = [];
            do {
                if ($result = $mysql->store_result()) {
                    array_push($data, $result->fetch_all(MYSQLI_ASSOC));
                    $result->free();
                }
            } while ($mysql->more_results() && $mysql->next_result());
            if(!$row['analyzed']){
                $analyzed = $_SESSION['user_name'];
            } else {
                $analyzed = $row['analyzed'];
            }
            $data = ['name' => $row['name'], 'artistText' => $row['artist'], 'treckID' => $row['treckID'], 'SRC' => $row['SRC'], 'cover' => $row['cover'], 'duration' => $row['duration'], 'moodID' => $row['moodID'], 'appleLink' => $row['appleLink'], 'yandexLink' => $row['yandexLink'], 'youtubeLink' => $row['youtubeLink'], 'uploaded' => $row['uploaded'], 'analyzed' => $analyzed, 'ExplicitContent' => $row['ExplicitContent'], 'year' => $row['year'], 'hookIn' => $row['hookIn'], 'hookOut' => $row['hookOut'], 'artists' => $data[1], 'category' => $data[0], 'mood' => $data[2]];

            if ($data['treckID'] == null){
                $data = ['status' => 'absent', 'data' => $myid];
            }
            systemResponse($data);
        break;

    case "getSkipped":
        $mysql->query("UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = '$id' WHERE `sessionID` = 'skiped' limit 1");
        $result = $mysql->query("SELECT `treckID`, `name`, `artist`, `SRC`, `cover`, `duration`, `moodID`, `appleLink`, `yandexLink`, `youtubeLink`, `uploaded`, `analyzed`, `ExplicitContent`, `year`, `hookIn`, `hookOut` FROM `treck` WHERE `sessionID` = '$id' limit 1");
        $row = $result->fetch_assoc();
        $updated_id = $row['treckID'];
        $mysql->multi_query("SELECT c.categoryID, c.category FROM category c JOIN treckCategory tc ON c.categoryID = tc.categoryID WHERE tc.treckID = '$updated_id'; SELECT a.artistLinkID, a.artistLink FROM artistLink a JOIN treckArtistLink ta ON a.artistLinkID = ta.artistLinkID WHERE ta.treckID = '$updated_id'; SELECT `moodID`, `mood` FROM `mood` WHERE `moodID` = '$updated_id';");
        $data = [];
        do {
            if ($result = $mysql->store_result()) {
                array_push($data, $result->fetch_all(MYSQLI_ASSOC));
                $result->free();
            }
        } while ($mysql->more_results() && $mysql->next_result());
        if(!$row['analyzed']){
            $analyzed = $_SESSION['user_name'];
        } else {
            $analyzed = $row['analyzed'];
        }
        $data = ['name' => $row['name'], 'artistText' => $row['artist'], 'treckID' => $row['treckID'], 'SRC' => $row['SRC'], 'cover' => $row['cover'], 'duration' => $row['duration'], 'moodID' => $row['moodID'], 'appleLink' => $row['appleLink'], 'yandexLink' => $row['yandexLink'], 'youtubeLink' => $row['youtubeLink'], 'uploaded' => $row['uploaded'], 'analyzed' => $analyzed, 'ExplicitContent' => $row['ExplicitContent'], 'year' => $row['year'], 'hookIn' => $row['hookIn'], 'hookOut' => $row['hookOut'], 'artists' => $data[1], 'category' => $data[0], 'mood' => $data[2]];
        if ($data['treckID'] == null){
            $data = ['status' => 'absent'];
        }
        systemResponse($data);
        break;

    case "send":
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
$mysql->close();
