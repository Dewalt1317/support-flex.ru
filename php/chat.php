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
        };
            $mysql->close();
        }
        break;

    case "getChat":
       $chat = $mysql->query("SELECT `messageID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` FROM `chat` LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID`");
        if ($mysql->error_list[0]["errno"] == null){
            while ($row = $chat->fetch_assoc()) {
                array_push($message, $row);
            }
            $dataChat["message"] = $message;
            $dataChat['result'] = "getOk";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat[' '] = 'error';
            $dataChat["comand"] = $data->chat->comand;
        };
        $mysql->close();
        break;
    case "getNewMessage":
        $date = $data->chat->date;
        $newMessage = $mysql->query("SELECT `messageID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` FROM `chat` LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID` WHERE  `date` < $date");
        if ($mysql->error_list[0]["errno"] == null){
            while ($row = $newMessage->fetch_assoc()) {
                array_push($message, $row);
            }
            $dataChat["message"] = $message;
            $dataChat['result'] = "getOk";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
        };
        $mysql->close();
        break;

    case "regUser":
                $username = $data->chat->username;
        $id = id(40817);
        $mysql->query("INSERT INTO `user` (`userID`, `name`) VALUES ('$id', '$username')");
        if ($mysql->error_list[0]["errno"] == null){
            $_SESSION['userID'] = $id;
            $dataChat['result'] = "regOK";
            $dataChat["comand"] = $data->chat->comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $data->chat->comand;
        };
        $mysql->close();
        break;
    default:
        $dataChat['result'] = "unknown";
        $dataChat["comand"] = $data->chat->comand;
        break;
}