<?php
session_start();
include "../../php/DB-Config.php";
include "../../php/response.php";
$data = json_decode(file_get_contents("php://input"));

$id = session_id();
$hor = $min = date("H");
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

switch ($data->comand) {
    case "get":
$mysql->query("UPDATE `treck` SET `selectIN` = CURTIME(), `sessionID` = '$id' WHERE `selectIN` < '$time' or `selectIN` is NULL and  `mood` is NULL  limit 1");
        $result = $mysql->query("SELECT `treckID`, `name`, `artist`, `SRC`, `duration`, `mood` FROM `treck` WHERE `sessionID` = '$id' limit 1");
$data = [];
while ($row = $result->fetch_assoc()) {
    array_push($data, $row);
}
        systemResponse($data);
        break;

    case "send":

        break;
}