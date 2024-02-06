<?php
include "DB-Config.php";
include "idGenerator.php";
include "response.php";
include "getTitle.php";
include "chat.php";
include "donatRequest.php";
$data = ["title" => $dataTitle, "chat"=> $dataChat];
systemResponse($data);
$mysql->close();