<?php
include "DB-Config.php";
include "idGenerator.php";
include "response.php";
include "getTitle.php";
include "chat.php";
$data = ["title" => $dataTitle, "chat"=> $dataChat];
systemResponse($data);