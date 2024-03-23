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

        $accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMjI2NiIsImp0aSI6IjUxY2MxOTA0NDAwNTQ5MjY3N2ZjMDZiMzU2YWExMDk4ZWU1MzAxYmQ4MTdiZmNkYmU1NTRlZTU5OWRkMmE4ZDFjYmQ1MzhhNGI4NjA2NDYwIiwiaWF0IjoxNzA2NzU3MDA5LjY4MDEsIm5iZiI6MTcwNjc1NzAwOS42ODAxLCJleHAiOjE3MzgzNzk0MDkuNjYxOCwic3ViIjoiMTA4Mzc0MjMiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiXX0.Lw2XXSE4SsIasizoaQNmUBXkNREqPqK4hcn4FrKHNdbJG4_10fUpx_RPq1omBl3AsStV7l3hsDQIv0zqZncYS-t9iW6MNc3YHy5q6tYErKI1W60l2zksDhE6TQFdjSyYiUDgDdesFHh67d5cXTaROtKo4g8eB3UYIWfdbuDWa93JBsHsvzol6ryyCXXDKBj-PYz1mq_1X8GLbcFCa5Dkoh85k6W3ao4uI7UWR_iLB2SoCbceOVsUhDuz_vYMPV0apKQ_ow8l3ghkfNTJI2iJEoXAug1ueWcKWYyN2HshSWg2C9NdFZTTl_wQ5QjRVlrz6981F_niAfapgtvG_G_eU6VSN9HYcfJU2gpsFsThUEW2-04Jx0Ubl1vUPfVTs0dmq0AaWagCgSHAVMo9O24CxJPRA73r3PS51cYhSK4wlKRP9AnyOAflYj-MfSIspVK9vVHTfB3Euhz_cClh4LbYoTybmhQYtAHyAROcnipguQRF345SYi4tRL1I6QOVpyV1Fp0LHKeYgRco_8cZuE1DPdfrOouVDuDAYuaqtns4RYNNKuBYQjQsMHbXdAouF7Um4pKHlbRAXztur6p6LEOnM58EH-KIp1_z7QMVZSBpUYDxXnFJjqGLyfHrWdbQ883u0n5ahfxMhqSx8u_SJn3twRQjRAvNfxCH1z7txypbBF8"; // Замените на ваш собственный Access Token

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
