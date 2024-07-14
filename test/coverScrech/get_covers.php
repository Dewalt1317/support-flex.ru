<?php
set_time_limit(0);
function systemResponse($data)
{
  if (!$data) { //Проверяем не пустые ли данные
    echo json_encode(["error" => "Пустой ответ от сервера"]);
    exit();
  }
  // Если все в порядке и есть что отправлять, отправляем ответ на фронт 
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
function getCoverArt($mbids) {
    $covers = [];
    foreach ($mbids as $mbid) {
        $url = "https://coverartarchive.org/release/$mbid";
        
        // Создаем контекст потока с игнорированием ошибок
        $opts = [
            "http" => [
                "method" => "GET",
                "header" => "Accept: application/json\r\n",
                "ignore_errors" => true // Игнорируем ошибки
            ]
        ];
        $context = stream_context_create($opts);
        
        // Получаем ответ от сервера
        $response = file_get_contents($url, false, $context);
        
        // Проверяем, что ответ получен и не содержит ошибку 404
        if ($response && !strpos($http_response_header[0], '404 Not Found')) {
            $data = json_decode($response, true);
            if (isset($data['images'][0]['image'])) {
                $covers[] = $data['images'][0]['image'];
            }
        }
    }
    return $covers;
}

function searchMBIDByTrackTitle($trackTitle) {
  $searchUrl = "http://musicbrainz.org/ws/2/recording/";
  $params = [
      'query' => 'title:"' . $trackTitle . '"',
      'fmt' => 'json',
      'inc' => 'releases', // Добавляем включение информации о релизах
  ];
  $opts = [
      "http" => [
          "method" => "GET",
          "header" => "User-Agent: Support-flex.ru/1.0 (rsidorenko@ozonzob.com)\r\n"
      ]
  ];

  $context = stream_context_create($opts);
  $searchResponse = file_get_contents($searchUrl . '?' . http_build_query($params), false, $context);
  $releaseMbids = [];
  if ($searchResponse) {
      $searchData = json_decode($searchResponse, true);
      if (!empty($searchData['recordings'])) {
          foreach ($searchData['recordings'] as $recording) {
              if (!empty($recording['releases'])) {
                  foreach ($recording['releases'] as $release) {
                      $releaseMbids[] = $release['id'];
                  }
              }
          }
      }
  }
  return $releaseMbids;
}

// Пример использования
$trackTitle = 'MONATIK - Vitamin D'; // Замените на реальное название трека
$mbids = searchMBIDByTrackTitle($trackTitle);
$covers = getCoverArt($mbids);
systemResponse($covers);
?>
