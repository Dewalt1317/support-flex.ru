<?php
// Параметры авторизации
$client_id = '12266';
$client_secret = 'mkjgsiqlFQCb3fVVcPtogMx1PycOujrKK27rHtuf';
$code = 'def5020083b46c9d60faa459f4e3cbfd1c526d0f0262bc36ec111158c5ab5c0c280a2b0819644ff398b0961f05469fb8d5a2bf453e2f2502005c54c563b9cefc01076390b71c18f452eae5ee42bf803202e5b7f5f55cf387f96106d8ca8013b8c66074c919824bd3b0384a2b8e6e7ba1c00d986bc67a9d12a3572216475f6df5e21ba6dc6f3d46996e12f2fad7575e209423c944140b3af87ea41a80d825502847949e371780f11c8698c622f4d08ae036f5d5daedc148071d7566e09ac9824c4dc7ad7fafd666c2480e85905e85989bb4f4ee4b602c119d6ed52c77ec39a8c09a5e20a2ab9017696415932aa277794a00f6ea04a71d4c8c1997b2dbf7f0ef2dc2e43d25df0c8736da1753d5b94ecd8f82b582acae237d662bd74759b2af805da9835d35efa98ded4c01d1e9b1429d8a6e5354a80f6c15dfc9df4b13016679131efb910e77502c7cdba44ffac8d9918d37e0ac92076f678b15cd8d1c869d5ad610b2ab5b727ea25643bd31342d2cae8c6684b85e8724fc';
$redirect_uri = 'https://support-flex.ru';

// Формирование данных для POST-запроса
$data = array(
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $redirect_uri
);

// Отправка POST-запроса
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://www.donationalerts.com/oauth/token');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

// Обработка ответа
if ($response !== false) {
    $token_data = json_decode($response, true);

    if (isset($token_data['access_token'])) {
        $access_token = $token_data['access_token'];
        // Токен доступа получен успешно, можно использовать для выполнения запросов к API
        echo 'Access Token: ' . $access_token;
    } else {
        // Ошибка получения токена доступа
        echo 'Error: Unable to obtain access token.';
        print_r($token_data);
    }
} else {
    // Ошибка выполнения запроса
    echo 'Error: Request failed.';
}

