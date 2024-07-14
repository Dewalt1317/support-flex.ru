<?php
include "../../php/response.php"; // Подключаем функции ответа
$request = json_decode(file_get_contents("php://input"));
// $request = $data->trackName;
$result = array();
require "../../php/DB-Config.php";
$screch = $mysql->query("SELECT 
t.treckID AS 'treckID',
t.name AS 'name',
COALESCE(CONCAT(t.artist, ' & ', GROUP_CONCAT(DISTINCT al.artistLink SEPARATOR ', ')), t.artist) AS 'artist',
t.SRC AS 'SRC',
GROUP_CONCAT(DISTINCT c.category SEPARATOR ', ') AS 'category',
t.duration AS 'duration',
m.mood AS 'mood'
FROM 
treck t
LEFT JOIN 
treckArtistLink tal ON t.treckID = tal.treckID
LEFT JOIN 
artistLink al ON tal.artistLinkID = al.artistLinkID
LEFT JOIN 
treckCategory tc ON t.treckID = tc.treckID
LEFT JOIN 
category c ON tc.categoryID = c.categoryID
LEFT JOIN 
mood m ON t.moodID = m.moodID
WHERE 
(t.name LIKE '%$request%' OR
t.artist LIKE '%$request%' OR
al.artistLink LIKE '%$request%' OR
m.mood LIKE '%$request%' OR
c.category LIKE '%$request%' OR
t.treckID LIKE '%$request%') AND
t.moodID IS NOT NULL
GROUP BY 
t.treckID");
if ($mysql->error_list[0]["errno"] == null){
    while ($row = $screch->fetch_assoc()) {
        array_push($result, $row);
    }
    $screchResult["data"] = $result;
    $screchResult['result'] = "getOk";
} else {
    $screchResult['result'] = 'error';
}
$mysql->close();
systemResponse($screchResult);