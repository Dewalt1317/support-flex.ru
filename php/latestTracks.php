<?php
function latestTracks () {
    $result = [];
    include "WSDB-Config.php";
    $chat = $mysql->query("SELECT `title`, `link`, `coverSRC`, `time` FROM `treckHistory` ORDER BY `date` DESC, `time` DESC limit 30");
    if ($mysql->error_list[0]["errno"] == null){
        while ($row = $chat->fetch_assoc()) {
            array_push($result, $row);
        }
    } else {
        $errorLog["mysql"]  = $mysql;
        $result = null;
        file_put_contents("log/Error lastTracks request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
    }
    $mysql->close();
    return $result;
}