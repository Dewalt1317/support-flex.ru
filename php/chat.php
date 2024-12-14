<?php

/**
 * Функция для обработки команд чата.
 * 
 * @param string $comand Команда, которая должна быть выполнена (send, getChat, regUser).
 * @param object $data Данные, переданные в команду (например, текст сообщения, идентификаторы).
 * 
 * @return array Результат выполнения команды, отправляемый клиенту.
 */
function chat($comand, $data) {
    // Массив для формирования ответа
    $dataChat = [];
    $userId = htmlspecialchars($data->userID, ENT_QUOTES, 'UTF-8'); // Защита от XSS
    $userCode = htmlspecialchars($data->userCode, ENT_QUOTES, 'UTF-8'); // Защита от XSS
    $message = []; // Массив для хранения сообщений

    switch ($comand) {
        case "send": // Обработка команды отправки сообщения
            if (empty($userId)) {
                $dataChat["result"] = "regUser"; // Требуется регистрация
                $dataChat["comand"] = $comand;
            } else {
                include "WSDB-Config.php"; // Подключение к базе данных

                // Подготовленный запрос для проверки пользователя
                $stmt = $mysql->prepare("SELECT `name` FROM `user` WHERE `userID` = ? AND `code` = ?");
                $stmt->bind_param("ss", $userId, $userCode);
                $stmt->execute();
                $result = $stmt->get_result();
                $userResult = $result->fetch_assoc()["name"];
                $stmt->close();
                $mysql->close();

                if ($userResult) { // Пользователь найден
                    if ($data->messageType == "donation") {
                        $messageText = $data->messageText;
                        $ReplyMessageID = "";
                        $photoSRC = "";
                    } else {
                        $messageText = htmlspecialchars($data->messageText, ENT_QUOTES, 'UTF-8'); // Защита текста сообщения
                        $ReplyMessageID = htmlspecialchars($data->ReplyMessageID, ENT_QUOTES, 'UTF-8'); // Защита идентификатора
                        $photoSRC = htmlspecialchars($data->photoSRC, ENT_QUOTES, 'UTF-8'); // Защита URL изображения
                    }
                    $messageId = id(11032022); // Генерация уникального ID сообщения

                    include "WSDB-Config.php";
                    // Подготовленный запрос для вставки сообщения в базу данных
                    $stmt = $mysql->prepare("INSERT INTO `chat` 
                        (`messageID`, `userID`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC`) 
                        VALUES (?, ?, CURDATE(), CURTIME(), ?, ?, ?)");
                    $stmt->bind_param("sssss", $messageId, $userId, $messageText, $ReplyMessageID, $photoSRC);
                    $stmt->execute();

                    if ($stmt->error) {
                        // Логирование ошибок базы данных
                        $errorLog = [
                            "dataChat" => $dataChat,
                            "mysql" => $stmt->error
                        ];
                        file_put_contents("log/Error_chat_" . date('d.m.Y_H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
                        $dataChat['result'] = 'error';
                    } else {
                        $dataChat['result'] = 'sendOK';
                        $dataChat["comand"] = $comand;
                        $dataChat["messageID"] = $messageId;
                        $dataChat["name"] = $userResult;
                    }
                    $stmt->close();
                    $mysql->close();
                } else {
                    $dataChat['result'] = 'regUser'; // Пользователь не найден, требуется регистрация
                    $dataChat["userID"] = $userId;
                    $dataChat["comand"] = $comand;
                }
            }
            break;

        case "getChat": // Обработка команды получения чата
            include "WSDB-Config.php";

            // Получение всех сообщений чата с сортировкой по дате и времени
            $stmt = $mysql->prepare("SELECT `messageID`, `chat`.`userID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` 
                FROM `chat` 
                LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID` 
                ORDER BY `date`, `time`");
            $stmt->execute();
            $result = $stmt->get_result();

            if ($stmt->error) {
                // Логирование ошибок базы данных
                $errorLog = [
                    "dataChat" => $dataChat,
                    "mysql" => $stmt->error
                ];
                file_put_contents("log/Error_chat_" . date('d.m.Y_H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
                $dataChat['result'] = 'error';
            } else {
                while ($row = $result->fetch_assoc()) {
                    if($row["name"] == "40817BOTdonationalerts") {
                        $row["textMessage"] = $row["textMessage"];
                        $row["name"] = $row["name"];
                        $row["photoSRC"] = "";
                    } else {
                        // Экранирование данных для защиты от XSS при возврате
                        $row["textMessage"] = htmlspecialchars($row["textMessage"], ENT_QUOTES, 'UTF-8');
                        $row["name"] = htmlspecialchars($row["name"], ENT_QUOTES, 'UTF-8');
                        $row["photoSRC"] = htmlspecialchars($row["photoSRC"], ENT_QUOTES, 'UTF-8');
                    }
                    array_push($message, $row);
                }
                $dataChat["userID"] = $userId;
                $dataChat["message"] = $message;
                $dataChat['result'] = "getOk";
                $dataChat["comand"] = $comand;
            }
            $stmt->close();
            $mysql->close();
            break;

        case "regUser": // Обработка команды регистрации пользователя
            $username = htmlspecialchars($data->name, ENT_QUOTES, 'UTF-8'); // Защита от XSS
            $id = id(40817); // Генерация уникального ID пользователя
            $code = id(substr($id, -5)); // Генерация уникального кода пользователя

            include "WSDB-Config.php";
            // Подготовленный запрос для регистрации нового пользователя
            $stmt = $mysql->prepare("INSERT INTO `user` (`userID`, `code`, `name`) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $id, $code, $username);
            $stmt->execute();

            if ($stmt->error) {
                // Логирование ошибок базы данных
                $errorLog = [
                    "dataChat" => $dataChat,
                    "mysql" => $stmt->error
                ];
                file_put_contents("log/Error_chat_" . date('d.m.Y_H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
                $dataChat['result'] = 'error';
            } else {
                $dataChat['result'] = "regOK";
                $dataChat["comand"] = $comand;
                $dataChat["userID"] = $id;
                $dataChat["code"] = $code;
            }
            $stmt->close();
            $mysql->close();
            break;

        default: // Обработка неизвестной команды
            $dataChat['result'] = "unknown";
            $dataChat["comand"] = $comand;
            // Логирование неизвестной команды
            $errorLog = ["dataChat" => $dataChat];
            file_put_contents("log/Error_chat_" . date('d.m.Y_H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
            break;
    }

    return $dataChat; // Возврат результата выполнения команды
}
