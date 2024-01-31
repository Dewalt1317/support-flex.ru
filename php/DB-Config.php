<?php
//Подключаемся к БД
$mysql = new mysqli('127.0.0.1:3306', 'SFS', '/pBwYAS]povt/)zk', 'Support-Flex.ru');

// Установка кодировки соединения
$mysql->query("SET NAMES utf8mb4_unicode_ci");
$mysql->query("SET CHARACTER SET utf8mb4_unicode_ci");
$mysql->query("SET character_set_connection=utf8mb4_unicode_ci");

