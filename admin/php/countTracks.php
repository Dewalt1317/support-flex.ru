<?php
include "../../php/DB-Config.php";
include "../../php/response.php";
$dataSend = [];
$dataresult = [];

$sql = $mysql->query("SELECT COUNT(*) AS total, SUM(CASE WHEN analysis = 1 THEN 1 ELSE 0 END) AS analyzed, SUM(CASE WHEN analysis = 0 THEN 1 ELSE 0 END) AS notAnalyzed, SUM(CASE WHEN sessionID = 'skiped' THEN 1 ELSE 0 END) AS skip FROM treck;");

if ($mysql->error_list[0]["errno"] == null) {
    while ($row = $sql->fetch_assoc()) {
        array_push($dataresult, $row);
    }
    $dataSend["data"] = $dataresult[0];
    $dataSend['result'] = "getOk";
} else {
    $dataSend['result'] = 'error';
}
$mysql->close();

systemResponse($dataSend);

    