<?php
function getAlbumCoverByTrackTitle($trackTitle) {
    $searchUrl = "http://musicbrainz.org/ws/2/recording/";
    $params = [
        'query' => $trackTitle,
        'fmt' => 'json',
    ];

    // Поиск записи по названию трека
    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "User-Agent: Support-flex.ru/3.7 (roman.sidorenko2000@icloud.com)\r\n"
        ]
    ];
    
    $context = stream_context_create($opts);
    
    // Теперь используйте этот контекст при вызове file_get_contents
    $response = file_get_contents($searchUrl . '?' . http_build_query($params), false, $context);
    $recordings = json_decode($response, true);

    // Проверка наличия записей
    if (count($recordings['recordings']) > 0) {
        $releaseId = $recordings['recordings'][0]['releases'][0]['id'];

        // Получение обложки альбома
        $coverUrl = "http://coverartarchive.org/release/$releaseId";
        $coverResponse = file_get_contents($coverUrl);
        $coverData = json_decode($coverResponse, true);

        if (isset($coverData['images'][0]['image'])) {
            return $coverData['images'][0]['image'];
        }
    }
    return "Обложка не найдена";
}

// Пример использования функции
$trackTitle = 'Zivert - Рокки';
$coverUrl = getAlbumCoverByTrackTitle($trackTitle);
echo $coverUrl;
?>
