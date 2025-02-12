<?php
include "../../php/response.php"; // Подключаем функции ответа
session_start();
if ($_SESSION["user_name"] == "" || $_SESSION["session_time"] <= time()) {
    $user = ["result" => "failed"];
    systemResponse($user);
    $_SESSION["user_name"] = "";
    $_SESSION["session_time"] = "";
} else {
    $user = ["result" => "loginOK"];
    systemResponse($user);
    $_SESSION["session_time"] = time() + 1800;
}