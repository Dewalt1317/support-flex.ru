<?php
// Параметры авторизации
$client_id = '12266';
$client_secret = 'mkjgsiqlFQCb3fVVcPtogMx1PycOujrKK27rHtuf';
$code = 'def502002ddd8c2c87cf5de95c5c2a4f800f6676abc166b29f40416e1673da5b73ed8dd27f581b3c4b3ce8bcad478c7384cadd0c596aca8ddd5f1dfc585134dad7f91856e310e29d9e691ed38025befce76a0151a0b4128d9f77f8cae262bd93d3b303b0792da856c89d7a22f18ffaf67e6c873713e3e7ed96cc15d2f461c7d4b46f6fb5adf0aab156103394cef8ae5733fb4e07fbcb438362c3ec234ea59e40e9770f79b3c64884d639488f441b168f8321ab8ccbe0d6c57b0ef125a13143094f0c061139fd41695ca607e56abbfa0c52ebd8ad15232702c5021722e4e214ac232f223ba8438b86a3c163116294623dad5ebf93e3d44602884876f3d3c4e32b2b4b1f482bd52d8cd18f9cb6e23c468c7101678728ef7ac891af476ac5e9e3a6f2d767f6ff6ee420f3b657c796b1c22d9be48c61639cec8467af30920f42528782722be0335d0e3ea901fd1ffc988d1cc252d89b1249090184b842470981fc7e917617494f3b975480018c0dbfad8eb9f9c062f4af3e19';
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

