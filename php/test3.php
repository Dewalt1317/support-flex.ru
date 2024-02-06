<?php

$accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMjI2NiIsImp0aSI6IjUxY2MxOTA0NDAwNTQ5MjY3N2ZjMDZiMzU2YWExMDk4ZWU1MzAxYmQ4MTdiZmNkYmU1NTRlZTU5OWRkMmE4ZDFjYmQ1MzhhNGI4NjA2NDYwIiwiaWF0IjoxNzA2NzU3MDA5LjY4MDEsIm5iZiI6MTcwNjc1NzAwOS42ODAxLCJleHAiOjE3MzgzNzk0MDkuNjYxOCwic3ViIjoiMTA4Mzc0MjMiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiXX0.Lw2XXSE4SsIasizoaQNmUBXkNREqPqK4hcn4FrKHNdbJG4_10fUpx_RPq1omBl3AsStV7l3hsDQIv0zqZncYS-t9iW6MNc3YHy5q6tYErKI1W60l2zksDhE6TQFdjSyYiUDgDdesFHh67d5cXTaROtKo4g8eB3UYIWfdbuDWa93JBsHsvzol6ryyCXXDKBj-PYz1mq_1X8GLbcFCa5Dkoh85k6W3ao4uI7UWR_iLB2SoCbceOVsUhDuz_vYMPV0apKQ_ow8l3ghkfNTJI2iJEoXAug1ueWcKWYyN2HshSWg2C9NdFZTTl_wQ5QjRVlrz6981F_niAfapgtvG_G_eU6VSN9HYcfJU2gpsFsThUEW2-04Jx0Ubl1vUPfVTs0dmq0AaWagCgSHAVMo9O24CxJPRA73r3PS51cYhSK4wlKRP9AnyOAflYj-MfSIspVK9vVHTfB3Euhz_cClh4LbYoTybmhQYtAHyAROcnipguQRF345SYi4tRL1I6QOVpyV1Fp0LHKeYgRco_8cZuE1DPdfrOouVDuDAYuaqtns4RYNNKuBYQjQsMHbXdAouF7Um4pKHlbRAXztur6p6LEOnM58EH-KIp1_z7QMVZSBpUYDxXnFJjqGLyfHrWdbQ883u0n5ahfxMhqSx8u_SJn3twRQjRAvNfxCH1z7txypbBF8"; // Замените на ваш собственный Access Token

// Определение эндпоинта для получения новых данных от Donation Alert
$endpoint = 'https://api.donationalerts.com/api/v1/alerts/donations';

// Формирование заголовков запроса
$headers = array(
    "Authorization: Bearer $accessToken",
    "Accept: application/json"
);

// Выполнение запроса
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Обработка ответа
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['data'])) {
        // Обработка полученных данных
        foreach ($data['data'] as $donation) {
            $donorName = $donation['username'];
            $amount = $donation['amount'];
            $message = $donation['message'];

            // Дальнейшая обработка данных (например, сохранение в базу данных, вывод на экран и т.д.)
            echo "Пожертвование от $donorName: $amount. Сообщение: $message\n";
        }
    } else {
        echo "Ошибка получения данных от Donation Alert API.";
    }
} else {
    echo "Ошибка выполнения запроса к Donation Alert API.";
}

