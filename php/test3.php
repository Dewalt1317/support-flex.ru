<?php

$accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMjI2NiIsImp0aSI6ImY1ZTRjZDY2Zjk3YzRjNWY1YWZjN2RhOTBhOWRkMWRjODY3YjYwYWI3NTAwMzFiYTNjYWVkNTA5Y2UzZDJkZWEwMGYwZWQ0NjlhNDkwMTQwIiwiaWF0IjoxNzIxMjA3NTM3LjY3OTMsIm5iZiI6MTcyMTIwNzUzNy42NzkzLCJleHAiOjE3NTI3NDM1MzcuNjY4MSwic3ViIjoiMTA4Mzc0MjMiLCJzY29wZXMiOlsib2F1dGgtZG9uYXRpb24taW5kZXgiXX0.XJvOQ4XJ48B2Le5h27P7msd0MaszyF6aUh97kau4L1exRHX7jYY4dTfX1s0uA78EIOHJOpPZ_knEjqVTf3PyCSL3xTB9Oo2JA-TA6kjwS_VH4bwETatmEiGnazZAHTmlm1JeyZ7M8JNcv1uMknGs-rKsMA-BoES8SH0TZSMKVvY7rpHzIzVZ-jkx9DEGdbhZ6dHRas_9HpZdxO6Zt2cdQu8Jd6WfJmNLv3mbEG_7qXUosBvh923XiDINHh9YZSkLUuHJ0Pe-iz1K2g8v4heu9WZQdw3OT7bnzhygKwBWEzUYniPw9QZKkbGsCplNzZEFdc8A-wOldrKDKS9mtmvxB9_tsExn0Ym6rIh1n2UfQcRBBdBfmBb1ohOSlxpCZYw054pAH4pQSyXeJFuX17AG7ZvZq9wGXrFfwW88J5lOJ2lj3a5SyjFeEs9lgCY1wbu56VUzB--jE_4wThoxuFxPKyt2VtqWUleDBBAbwX8pvTJfT5OLdPyw6HO9qBU1s42Oy-lh-jSxaWKUeJ1n2u46n2nTwUpaOB9FCFrpZbwyeOXLYbN0VpbXMGRXv4hy74t1JFMTXbs4U9BUIaaOo3NoLjXV9TlFTv1CtxsomOn4H71X_EjJbVLL2RrvN2jYT5TpRyU3GA7L0UcqlePC_DRvAaN7VawzZRfRUGf4gIztlbk"; // Замените на ваш собственный Access Token

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

