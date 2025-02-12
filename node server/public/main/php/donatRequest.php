<?php
function donateRequest()
{
    global $clients;
    $fileTempDonat = "temp/donatRequestTime.json";

    // Проверка временного файла
    if (!file_exists($fileTempDonat)) {
        echo "Создаю файл времени запросов донатов...\n";
        file_put_contents($fileTempDonat, json_encode(["timeRequest" => date("d.m.Y H:i:s")], JSON_UNESCAPED_UNICODE));
    }
    $TempDonat = json_decode(file_get_contents($fileTempDonat));

    if (date("d.m.Y H:i:s") >= $TempDonat->timeRequest) {
        include "WSDB-Config.php";    // Подключение к БД
        echo "Запрос к Donation Alerts...\n";
        $accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMjI2NiIsImp0aSI6ImY1ZTRjZDY2Zjk3YzRjNWY1YWZjN2RhOTBhOWRkMWRjODY3YjYwYWI3NTAwMzFiYTNjYWVkNTA5Y2UzZDJkZWEwMGYwZWQ0NjlhNDkwMTQwIiwiaWF0IjoxNzIxMjA3NTM3LjY3OTMsIm5iZiI6MTcyMTIwNzUzNy42NzkzLCJleHAiOjE3NTI3NDM1MzcuNjY4MSwic3ViIjoiMTA4Mzc0MjMiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiXX0.XJvOQ4XJ48B2Le5h27P7msd0MaszyF6aUh97kau4L1exRHX7jYY4dTfX1s0uA78EIOHJOpPZ_knEjqVTf3PyCSL3xTB9Oo2JA-TA6kjwS_VH4bwETatmEiGnazZAHTmlm1JeyZ7M8JNcv1uMknGs-rKsMA-BoES8SH0TZSMKVvY7rpHzIzVZ-jkx9DEGdbhZ6dHRas_9HpZdxO6Zt2cdQu8Jd6WfJmNLv3mbEG_7qXUosBvh923XiDINHh9YZSkLUuHJ0Pe-iz1K2g8v4heu9WZQdw3OT7bnzhygKwBWEzUYniPw9QZKkbGsCplNzZEFdc8A-wOldrKDKS9mtmvxB9_tsExn0Ym6rIh1n2UfQcRBBdBfmBb1ohOSlxpCZYw054pAH4pQSyXeJFuX17AG7ZvZq9wGXrFfwW88J5lOJ2lj3a5SyjFeEs9lgCY1wbu56VUzB--jE_4wThoxuFxPKyt2VtqWUleDBBAbwX8pvTJfT5OLdPyw6HO9qBU1s42Oy-lh-jSxaWKUeJ1n2u46n2nTwUpaOB9FCFrpZbwyeOXLYbN0VpbXMGRXv4hy74t1JFMTXbs4U9BUIaaOo3NoLjXV9TlFTv1CtxsomOn4H71X_EjJbVLL2RrvN2jYT5TpRyU3GA7L0UcqlePC_DRvAaN7VawzZRfRUGf4gIztlbk";
        $url = "https://www.donationalerts.com/api/v1/alerts/donations";
        $headers = ["Authorization: Bearer $accessToken", "Accept: application/json"];

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if ($httpCode == 200 && $response) {
            $data = json_decode($response, true);
            if (isset($data['data']) && count($data['data']) > 0) {
                foreach ($data['data'] as $donation) {
                    $donationID = $donation['id'];

                    // Проверяем, существует ли данный донат в БД
                    $checkQuery = $mysql->prepare("SELECT COUNT(*) FROM donation WHERE id = ?");
                    $checkQuery->bind_param("s", $donationID);
                    $checkQuery->execute();
                    $checkQuery->bind_result($exists);
                    $checkQuery->fetch();
                    $checkQuery->close();

                    if ($exists > 0) {
                        continue; // Переходим к следующему элементу
                    }

                    $donationID = $donation['id'];
                    $donorName = htmlspecialchars($donation['username'], ENT_QUOTES, 'UTF-8') ?: "Аноним";
                    $amount = $donation['amount'];
                    $donatioMessage = htmlspecialchars($donation['message'], ENT_QUOTES, 'UTF-8') ?: "";
                    $currency = $donation['currency'];

                    $donatioMessageText = json_encode([
                        "botStart" => $donorName . ($donatioMessage ? " пожертвовал(а) " : " молча пожертвовал(а) "),
                        "amount" => $amount,
                        "Message" => $donatioMessage,
                        "botEnd" => $currency . ($donatioMessage ? " и сказал(а):" : "")
                    ], JSON_UNESCAPED_UNICODE);

                    $donatioMessageId = id(11032022);
                    $userId = "40817BOTdonationalerts";
                    $userCode = "ZXXdpboPdNvk8*!kfgwev54te";
                    $messageSend = ["userID" => $userId, "userCode" => $userCode, "messageType" => "donation", "messageText" => $donatioMessageText];
                    $chatResult = chat("send", (object)$messageSend);
                    if ($chatResult["result"] == "sendOK") {
                        $dataSend = [
                            "type" => "chat",
                            "data" => [
                                "result" => "getOk",
                                "message" => [
                                    [
                                        "messageID" => $chatResult["messageID"],
                                        "date" => date("Y-m-d"),
                                        "time" => date("H:i:s"),
                                        "ReplyMessageID" => "",
                                        "textMessage" => $donatioMessageText,
                                        "photoSRC" => "",
                                        "userID" => $userId,
                                        "name" => $chatResult["name"]
                                    ]
                                ]
                            ]
                        ];

                        send(mask(json_encode($dataSend)), $clients);

                        $insertQuery = $mysql->prepare(
                            "INSERT INTO donation (id, messageID, username, message, amount, currency, date) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)"
                        );

                        // Создаём объект DateTime с указанием часового пояса UTC
                        $donateDateTime = new DateTime($donation['created_at'], new DateTimeZone('UTC'));

                        // Преобразуем время в московский часовой пояс
                        $donateDateTime->setTimezone(new DateTimeZone('Europe/Moscow'));

                        $insertQuery->bind_param(
                            "sssssss",
                            $donationID,
                            $donatioMessageId,
                            $donorName,
                            $donatioMessage,
                            $amount,
                            $currency,
                            $donateDateTime->format('Y-m-d H:i:s')
                        );
                        if (!$insertQuery->execute()) {
                            errorHandler(1, "Ошибка добавления в таблицу donation: " . $insertQuery->error, __FILE__, __LINE__);
                            $mysql->close();
                            return;
                        }
                    } else {
                        echo "Ошибка сохранения сообщения в БД...\n";
                        print_r($chatResult);
                        $mysql->close();
                        return;
                    }
                }
            } else {
                echo "Donation Alerts не вернул данные...\n";
                $mysql->close();
                return;
            }
        } else {
            echo "Ошибка запроса...\n";
            $mysql->close();
            return;
        }
        $TempDonat->timeRequest = date("d.m.Y H:i:s", strtotime("+2 minutes"));
        file_put_contents($fileTempDonat, json_encode($TempDonat, JSON_UNESCAPED_UNICODE));
    } else {
        return;
    }
}
