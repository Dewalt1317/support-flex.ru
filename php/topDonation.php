<?php

function getExchangeRates(): array
{
    $filePath = '../temp/exchangeRate.json'; // Путь к файлу
    $requiredCurrencies = ['BRL', 'BYN', 'EUR', 'KZT', 'PLN', 'RUB', 'TRY', 'UAH', 'USD'];
    $apiKey = 'a6bee550b64fc422ea656686f9d78a6d';
    $apiUrl = "https://open.er-api.com/v6/latest/USD?apikey={$apiKey}"; // API URL (пример с Exchange Rates API)
    $cacheDuration = 12 * 60 * 60; // 12 часов в секундах

    // Проверяем, существует ли файл
    if (file_exists($filePath)) {
        $data = json_decode(file_get_contents($filePath), true);

        // Проверяем валидность данных и срок действия кэша
        if (isset($data['last_update'], $data['rates']) && (time() - $data['last_update']) < $cacheDuration) {
            return array_intersect_key($data['rates'], array_flip($requiredCurrencies));
        }
    }

    // Если данные устарели или отсутствуют, получаем их из API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo "Ошибка CURL: " . curl_error($ch) . "\n";
        curl_close($ch);
        return [];
    }

    curl_close($ch);

    $apiData = json_decode($response, true);

    if (!isset($apiData['rates']) || !is_array($apiData['rates'])) {
        echo "Ошибка получения курсов валют.\n";
        return [];
    }

    // Фильтруем только нужные курсы валют
    $filteredRates = array_intersect_key($apiData['rates'], array_flip($requiredCurrencies));

    // Сохраняем данные в файл
    $dataToSave = [
        'last_update' => time(),
        'rates' => $filteredRates,
    ];

    file_put_contents($filePath, json_encode($dataToSave));
    echo "Курсы валют обнавлены.\n";

    return $filteredRates;
}

function getTop3IdsWithLargestSums(array $data, array $exchangeRates, string $baseCurrency = 'USD'): array
{
    $convertedData = [];

    // Преобразуем суммы в базовую валюту
    foreach ($data as $item) {
        if (isset($item['id'], $item['amount'], $item['currency'])) {
            $currency = $item['currency'];
            if (!isset($exchangeRates[$currency])) {
                // Если курс для валюты не указан, пропускаем эту запись
                continue;
            }
            $convertedAmount = $item['amount'] / $exchangeRates[$currency];
            $convertedData[] = [
                'id' => $item['id'],
                'amount' => $convertedAmount,
                'original_amount' => $item['amount'],
                'original_currency' => $currency
            ];
        }
    }

    // Сортируем массив по убыванию суммы
    usort($convertedData, function ($a, $b) {
        return $b['amount'] <=> $a['amount'];
    });

    // Извлекаем только первые 3 ID
    return array_column(array_slice($convertedData, 0, 3), 'id');
}

function getDonation()
{
    $donation = []; // Массив для хранения сообщений
    include "DB-Config.php";    // Подключение к БД
    $stmt = $mysql->prepare("SELECT `id`, `amount`, `currency`
    FROM `donation`");
    $stmt->execute();
    $result = $stmt->get_result();

    if ($stmt->error) {
        echo "Ошибка получения донатов.\n";
    } else {
        while ($row = $result->fetch_assoc()) {

            array_push($donation, $row);
        }
    }
    $mysql->close();
    return $donation;
}

// Пример данных
$data = getDonation();


$exchangeRates = getExchangeRates();

// Вызов функции
$result = getTop3IdsWithLargestSums($data, $exchangeRates);

print_r($result);
