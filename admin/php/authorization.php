<?php
include "../../php/response.php"; // Подключаем функции ответа
//Объявляем на какие данные расчитан этот скрипт
header("Content-Type: application/json");

//Стартуем сессию
session_start();

//Принимаем данные с фронта
$data = json_decode(file_get_contents("php://input"));
$login = filter_var(
    trim($data->login),
    FILTER_SANITIZE_STRING
);
$passwd = filter_var(
    trim($data->password),
    FILTER_SANITIZE_STRING
);

//Валидация
if ($login == "") {
    $user = ["result" => "NOlogin"];
    systemResponse($user);
    exit();
} else if ($passwd == "") {
    $user = ["result" => "NOpass"];
    systemResponse($user);
    exit();
}
//Добавляем соль к паролю и хешируем
$passwd = md5($passwd . "matveeva");

//Подключаемся к БД
require "../../php/DB-Config.php";


//Проверяем есть ли пользователь в таблице основных пользователей
$result = $mysql->query("SELECT `login`, `pass` FROM `userAdmin` WHERE  `login` = '$login' and `pass` = '$passwd'");
$user = $result->fetch_assoc();
if ($user == null) { //Если нет в основных пользователях
    $user = ["result" => "failed"];
    systemResponse($user);
    $mysql->close();
    exit();
}

//После успешной авторизации добавляем логин и ключ в сессию
$_SESSION['user_name'] = $login;
$_SESSION["session_time"] = time() +900;

//Закрываем соеденение с БД
$mysql->close();

//Создаём массив для передачи на фронт, и передаём его как json объект
$user = ["result" => "loginOK"];
systemResponse($user);
