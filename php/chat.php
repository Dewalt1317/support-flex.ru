<?php
session_start();
$data = json_decode(file_get_contents("php://input"));
$dataChat = [];
$message = [];
switch ($data->chat->comand){
    case "send":
        if ($_SESSION['userID'] == ""){

            $dataChat["result"] = "regUser";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $userId = $_SESSION['userID'];
            $messageText = $data->chat->messageText;
            $ReplyMessageID = $data->chat->ReplyMessageID;
            $photoSRC = $data->chat->photoSRC;
        $messageId = id(11032022);
        $mysql->query("INSERT INTO `chat` (`messageID`, `userID`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC`) VALUES ('$messageId', '$userId', CURDATE(), CURTIME(), '$messageText', '$ReplyMessageID', '$photoSRC')");
        if ($mysql->error_list[0]["errno"] == null){
            $dataChat['result'] = 'sendOK';
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s'), json_encode($errorLog));

        }
        }
        break;

    case "getChat":
       $chat = $mysql->query("SELECT `messageID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` FROM `chat` LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID` ORDER BY `date`, `time`");
        if ($mysql->error_list[0]["errno"] == null){
            while ($row = $chat->fetch_assoc()) {
                array_push($message, $row);
            }
            $dataChat["message"] = $message;
            $dataChat['result'] = "getOk";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s'), json_encode($errorLog));
        };
        break;
    case "getNewMessage":
        $date = $data->chat->lastMessage->date;
        $time = $data->chat->lastMessage->time;
        $ID = $data->chat->lastMessage->ID;
        $messageID = $data->chat->messageID;
        $newMessage = $mysql->query("SELECT `messageID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` FROM `chat` LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID` WHERE  (`date` >= '$date' and `time` >= '$time') ORDER BY `date`, `time`");
        if ($mysql->error_list[0]["errno"] == null){
            while ($row = $newMessage->fetch_assoc()) {
                $messageSend = false;
                foreach ($messageID as $value) {
                    if ($value === $row["messageID"]) {
                        $messageSend = true;
                        break; // Прерываем цикл, если значение найдено
                    }
                }
                if (!$messageSend){
                    array_push($message, $row);
                }
            }
            $dataChat["message"] = $message;
            $dataChat['result'] = "getOk";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s'), json_encode($errorLog));
        };
        break;

    case "regUser":
        $username = $data->chat->name;
        $id = id(40817);
        $mysql->query("INSERT INTO `user` (`userID`, `name`) VALUES ('$id', '$username')");
        if ($mysql->error_list[0]["errno"] == null){
            $_SESSION['userID'] = $id;
            $dataChat['result'] = "regOK";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s'), json_encode($errorLog));
        };
        break;
    default:
        $dataChat['result'] = "unknown";
        $dataChat["comand"] = $data->chat->comand;
        $errorLog["dataChat"] = $dataChat;
        file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s'), json_encode($errorLog));
        break;
}