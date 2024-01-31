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