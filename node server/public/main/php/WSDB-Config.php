<?php
$fileConfDB = "config/DBconfig.conf";
$DBconfig = json_decode(file_get_contents($fileConfDB));

//Подключаемся к БД
$mysql = new mysqli($DBconfig->url, $DBconfig->userName, $DBconfig->password, $DBconfig->name);

// Установка кодировки соединения
$mysql->query("SET NAMES utf8mb4_unicode_ci");
$mysql->query("SET CHARACTER SET utf8mb4_unicode_ci");
$mysql->query("SET character_set_connection=utf8mb4_unicode_ci");