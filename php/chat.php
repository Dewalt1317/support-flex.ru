<?php
function chat ($comand, $data){
$dataChat = [];
$userId = $data->userID;
$userCode = $data->userCode;
    $message = [];
switch ($comand){
    case "send":
        if ($userId == ""){
            $dataChat["result"] = "regUser";
            $dataChat["comand"] = $comand;
        } else {
            include "WSDB-Config.php";
            $user = $mysql->query("SELECT `name` FROM `user` WHERE `userID` = '$userId' and `code` = '$userCode'");
            $userResult = $user->fetch_assoc()["name"];
            $mysql->close();
            if ($userResult) {
                $messageText = $data->messageText;
                $ReplyMessageID = $data->ReplyMessageID;
                $photoSRC = $data->photoSRC;
                $messageId = id(11032022);
                include "WSDB-Config.php";
                $mysql->query("INSERT INTO `chat` (`messageID`, `userID`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC`) VALUES ('$messageId', '$userId', CURDATE(), CURTIME(), '$messageText', '$ReplyMessageID', '$photoSRC')");
                if ($mysql->error_list[0]["errno"] == null){
                    $dataChat['result'] = 'sendOK';
                    $dataChat["comand"] = $comand;
                    $dataChat["messageID"] = $messageId;
                    $dataChat["name"] = $userResult;
                } else {
                    $dataChat['result'] = 'error';
                    $dataChat["comand"] = $comand;
                    $errorLog["dataChat"] = $dataChat;
                    $errorLog["mysql"]  = $mysql;
                    file_put_contents("log/Error chat request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));

                }
                $mysql->close();
            } else {
                $dataChat['result'] = 'regUser';
                $dataChat["comand"] = $comand;
            }
        }
        break;

    case "getChat":
        include "WSDB-Config.php";
       $chat = $mysql->query("SELECT `messageID`, `chat`.`userID`, `name`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC` FROM `chat` LEFT JOIN `user` ON `chat`.`userID` = `user`.`userID` ORDER BY `date`, `time`");
        if ($mysql->error_list[0]["errno"] == null){
            while ($row = $chat->fetch_assoc()) {
                array_push($message, $row);
            }
            $dataChat["userID"] = $userId;
            $dataChat["message"] = $message;
            $dataChat['result'] = "getOk";
            $dataChat["comand"] = $comand;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("log/Error chat request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
        }
        $mysql->close();
        break;


    case "regUser":
        $username = $data->name;
        $id = id(40817);
        $salt = id(substr($id, -5));
        $code = id(substr($salt, -5));
        include "WSDB-Config.php";
        $mysql->query("INSERT INTO user (`userID`, `code`, `name`) VALUES ('$id', '$code', '$username')");
        if ($mysql->error_list[0]["errno"] == null){
            $_SESSION['userID'] = $id;
            $dataChat['result'] = "regOK";
            $dataChat["comand"] = $comand;
            $dataChat["userID"] = $id;
            $dataChat["code"] = $code;
        } else {
            $dataChat['result'] = 'error';
            $dataChat["comand"] = $comand;
            $errorLog["dataChat"] = $dataChat;
            $errorLog["mysql"]  = $mysql;
            file_put_contents("log/Error chat request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
        }
        $mysql->close();
        break;
    default:
        $dataChat['result'] = "unknown";
        $dataChat["comand"] = $comand;
        $errorLog["dataChat"] = $dataChat;
        file_put_contents("log/Error chat request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
        break;
}
    return $dataChat;
}