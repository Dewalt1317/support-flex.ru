<?php
function findAlbumCover($artist, $track) {
    $result["result"] = "error";
    // Поиск в iTunes
    $itunesUrl = "https://itunes.apple.com/search?term=" . urlencode($artist . ' ' . $track) . "&entity=album";
    $itunesResponse = file_get_contents($itunesUrl);
    $itunesData = json_decode($itunesResponse);
    if ($itunesData->resultCount > 0) {
        $result["result"] = "getOk";
        $result["itunes"] = str_replace("100x100", "1000x1000", $itunesData->results[0]->artworkUrl100);
    }

    // Поиск в Cover Art Archive
    $mbid = getMusicBrainzID($artist, $track); // Функция для получения MBID
    $coverArtUrl = "http://coverartarchive.org/release/" . $mbid;
    $coverArtResponse = @file_get_contents($coverArtUrl);
    if ($coverArtResponse !== false) {
        $coverArtData = json_decode($coverArtResponse);
        $result["result"] = "getOk";
        $result["CoverArchive"] =  $coverArtData->images[0]->image;
    }

    // Поиск в Last.fm
    try {
      $lastFmUrl = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=" . urlencode('6a3aa76b078b6b0afb200029a8c085b5') . "&artist=" . urlencode($artist) . "&album=" . urlencode($track) . "&format=json";
      $lastFmResponse = @file_get_contents($lastFmUrl);

      if ($lastFmResponse === false) {
          throw new Exception("Ошибка при получении данных с Last.fm");
      }

      $lastFmData = json_decode($lastFmResponse);
      if (isset($lastFmData->album->image)) {
          foreach ($lastFmData->album->image as $image) {
              if ($image->size == 'mega') {
                if($image->{'#text'} !== ""){
                  $result["result"] = "getOk";
                  $result["Last.fm"] = str_replace("/i/u/300x300", "/i/u/1000x1000", $image->{'#text'});
                }
              }
          }
      }
  } catch (Exception $e) {}

    // Поиск в локальной папке
    chdir("/");
    $localPath = "../../src/image/cover/";
    $files = scandir($localPath);
    foreach ($files as $file) {
        if (stripos($file, $artist) !== false) {
          $result["result"] = "getOk";
          $result["localPath"] = realpath($localPath) . PHP_EOL . $file;
        }
    }
    return $result;
}

// Дополнительная функция для получения MBID (MusicBrainz ID)
function getMusicBrainzID($artist, $track) {
  $searchUrl = "http://musicbrainz.org/ws/2/recording/";
  $params = [
      'query' => $artist . " - " . $track,
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
      return $releaseId;
  }
}

print_r(findAlbumCover("Zivert", "неболей"));