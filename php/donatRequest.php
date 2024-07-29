<?php
function messageSend($donorName, $botStart, $amount, $donatioMessage, $botEnd, $idExists, $donationID, $mysql)
{
    $return = ["result" => "noMessage"];;
    $userId = "40817BOTdonationalerts";
    $donatioMessageText = json_encode(["botStart" => $donorName . $botStart, "amount" => $amount, "Message" => $donatioMessage, "botEnd" => $botEnd], JSON_UNESCAPED_UNICODE);
    $donatioMessageId = id(11032022);
    include "WSDB-Config.php";
    $mysql->query("INSERT INTO `chat` (`messageID`, `userID`, `date`, `time`, `textMessage`, `ReplyMessageID`, `photoSRC`) VALUES ('$donatioMessageId', '$userId', CURDATE(), CURTIME(), '$donatioMessageText', '', '')");
    if ($mysql->error_list[0]["errno"] == null) {
        if ($idExists) {
            $mysql->query("UPDATE `donation` SET `messageID` = '$donatioMessageId'WHERE `id` = '$donationID'");
            if ($mysql->error_list[0]["errno"] != null) {
                // Обработка ошибки записи в базу данных
                file_put_contents("../log/Error Database Update " . date('d.m.Y H-i-s') . ".log", json_encode($mysql, JSON_UNESCAPED_UNICODE));
            } else {
                $donatMessage = [
                    "type" => "chat", "data" => [
                        "result" => "getOk", "message" => [
                            [
                                "messageID" => $donatioMessageId,
                                "date" => date("Y-m-d"),
                                "time" => date("H:i:s"),
                                "ReplyMessageID" => "",
                                "textMessage" => $donatioMessageText,
                                "photoSRC" => "",
                                "userID" => $userId,
                                "userName" => $userId]]]];
                $return = ["result" => "message", "message" => $donatMessage];
            }
        }
    } else {
        $dataChat['result'] = 'error';
        $dataChat["comand"] = "donatMessageSend";
        $errorLog["dataChat"] = $dataChat;
        $errorLog["mysql"] = $mysql;
        file_put_contents("../log/Error chat request " . date('d.m.Y H-i-s') . ".log", json_encode($errorLog, JSON_UNESCAPED_UNICODE));
    }
    $mysql->close();
    return $return;
}
function donateRequest()
{
    $return = ["result" => "noMessage"];
    $fileTempDonat = "temp/donatRequestTime.json";

    $TempDonat = json_decode(file_get_contents($fileTempDonat));
    if (date("d.m.Y H:i:s") >= $TempDonat->timeRequest) {
        $dataBD = [];

        $accessToken = " eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMjI2NiIsImp0aSI6ImY1ZTRjZDY2Zjk3YzRjNWY1YWZjN2RhOTBhOWRkMWRjODY3YjYwYWI3NTAwMzFiYTNjYWVkNTA5Y2UzZDJkZWEwMGYwZWQ0NjlhNDkwMTQwIiwiaWF0IjoxNzIxMjA3NTM3LjY3OTMsIm5iZiI6MTcyMTIwNzUzNy42NzkzLCJleHAiOjE3NTI3NDM1MzcuNjY4MSwic3ViIjoiMTA4Mzc0MjMiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiXX0.XJvOQ4XJ48B2Le5h27P7msd0MaszyF6aUh97kau4L1exRHX7jYY4dTfX1s0uA78EIOHJOpPZ_knEjqVTf3PyCSL3xTB9Oo2JA-TA6kjwS_VH4bwETatmEiGnazZAHTmlm1JeyZ7M8JNcv1uMknGs-rKsMA-BoES8SH0TZSMKVvY7rpHzIzVZ-jkx9DEGdbhZ6dHRas_9HpZdxO6Zt2cdQu8Jd6WfJmNLv3mbEG_7qXUosBvh923XiDINHh9YZSkLUuHJ0Pe-iz1K2g8v4heu9WZQdw3OT7bnzhygKwBWEzUYniPw9QZKkbGsCplNzZEFdc8A-wOldrKDKS9mtmvxB9_tsExn0Ym6rIh1n2UfQcRBBdBfmBb1ohOSlxpCZYw054pAH4pQSyXeJFuX17AG7ZvZq9wGXrFfwW88J5lOJ2lj3a5SyjFeEs9lgCY1wbu56VUzB--jE_4wThoxuFxPKyt2VtqWUleDBBAbwX8pvTJfT5OLdPyw6HO9qBU1s42Oy-lh-jSxaWKUeJ1n2u46n2nTwUpaOB9FCFrpZbwyeOXLYbN0VpbXMGRXv4hy74t1JFMTXbs4U9BUIaaOo3NoLjXV9TlFTv1CtxsomOn4H71X_EjJbVLL2RrvN2jYT5TpRyU3GA7L0UcqlePC_DRvAaN7VawzZRfRUGf4gIztlbk"; // Замените на ваш собственный Access Token

        $url = "https://www.donationalerts.com/api/v1/alerts/donations"; // URL эндпоинта для получения данных о пожертвованиях

        $headers = array(
            "Authorization: Bearer $accessToken",
            "Accept: application/json"
        );
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['data'])) {
                include "WSDB-Config.php";
                $donationBDID = $mysql->query("SELECT `id`, `messageID` FROM `donation`");
                if ($mysql->error_list[0]["errno"] == null) {
                    while ($row = $donationBDID->fetch_assoc()) {
                        array_push($dataBD, $row);
                    }
                }
                $mysql->close();
                foreach ($data['data'] as $donation) {
                    $donationID = $donation['id'];
                    $donationDate = $donation['created_at'];
                    $donorName = $donation['username'];
                    $amount = $donation['amount'];
                    $donatioMessage = $donation['message'];
                    $currency = $donation['currency'];
                    if ($donorName == "") {
                        $donorName = "Аноним";
                    }

                    if ($donatioMessage == "") {
                        $donatioMessage = "";
                        $botStart = " молча пожертвовал(а) ";
                        $botEnd = $currency;
                    } else {
                        $botStart = " пожертвовал(а) ";
                        $botEnd = $currency . " и сказал(а):";
                    }

                    // Проверяем, есть ли такой id в базе данных
                    $idExists = false;
                    $donatioMessageSend = true;
                    foreach ($dataBD as $row) {
                        if ($row['id'] == $donationID) {
                            $idExists = true;
                            // Если поле `messageID` пустое, устанавливаем $donatioMessageSend в false
                            if (empty($row['messageID'])) {
                                $donatioMessageSend = false;
                            }
                            break;
                        }
                    }

                    if (!$donatioMessageSend) {
                        $return = messageSend($donorName, $botStart, $amount, $donatioMessage, $botEnd, $idExists, $donationID, $mysql);
                    }
                    // Если id не существует, выполняем запись в базу данных
                    if (!$idExists) {
                        $return = messageSend($donorName, $botStart, $amount, $donatioMessage, $botEnd, $idExists, $donationID, $mysql);
                        $messageID = $return['message']['data']['result'] == "message" ? $return['message']['data']['message'][0]['messageID'] : "";
                        include "WSDB-Config.php";
                        $insertQuery = "INSERT INTO `donation` (`id`, `messageID`, `username`, message, amount, currency, `date`) VALUES ('$donationID', '$messageID', '$donorName', '$donatioMessage', '$amount', '$currency', '$donationDate')";
                        $mysql->query($insertQuery);
                        if ($mysql->error_list[0]["errno"] != null) {
                            // Обработка ошибки записи в базу данных
                            file_put_contents("../log/Error Database Insert " . date('d.m.Y H-i-s') . ".log", json_encode($mysql, JSON_UNESCAPED_UNICODE));
                        }
                        $mysql->close();
                    }
                }
            } else {
                file_put_contents("../log/Error Donat request " . date('d.m.Y H-i-s') . ".log", json_encode($response, JSON_UNESCAPED_UNICODE));
            }
        } else {
            file_put_contents("../log/Error Donat request " . date('d.m.Y H-i-s') . ".log", json_encode(curl_getinfo($curl)), JSON_UNESCAPED_UNICODE);
        }

        $date = date_create(date('d.m.Y H:i:s'));
        date_modify($date, '+2 min');

        $TempDonat->timeRequest = date_format($date, "d.m.Y H:i:s");
        file_put_contents($fileTempDonat, json_encode($TempDonat, JSON_UNESCAPED_UNICODE));
        curl_close($curl);
    }
    return $return;
}
