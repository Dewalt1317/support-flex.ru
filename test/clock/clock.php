<?php
function generateClock($name, $date, $time, $duration, $tracks, $stopCategories, $nonRepetitionRules, $previousTracks, $nextTracks) {
    // Преобразование времени в секунды
    function timeToSeconds($time) {
        list($h, $m, $s) = explode(':', $time);
        return $h * 3600 + $m * 60 + $s;
    }

    // Преобразование секунд в формат времени
    function secondsToTime($seconds) {
        $h = floor($seconds / 3600);
        $m = floor(($seconds % 3600) / 60);
        $s = $seconds % 60;
        return sprintf('%02d:%02d:%02d', $h, $m, $s);
    }

    // Проверка правил не повторения
    function checkNonRepetition($track, $previousTracks, $nextTracks, $nonRepetitionRules) {
        $currentTime = time();
        foreach (array_merge($previousTracks, $nextTracks) as $prevTrack) {
            if ($track['treckID'] == $prevTrack['treckID'] && ($currentTime - strtotime($prevTrack['date'] . ' ' . $prevTrack['time'])) < $nonRepetitionRules['track'] * 60) {
                return false;
            }
            foreach ($track['artistLinkIDs'] as $artistID) {
                if (in_array($artistID, $prevTrack['artistLinkIDs']) && ($currentTime - strtotime($prevTrack['date'] . ' ' . $prevTrack['time'])) < $nonRepetitionRules['artist'] * 60) {
                    return false;
                }
            }
        }
        return true;
    }

    // Фильтрация треков по категориям
    $filteredTracks = [];
    foreach ($tracks as $category) {
        if (!in_array($category['categoryID'], $stopCategories)) {
            foreach ($category['tracks'] as $track) {
                if (checkNonRepetition($track, $previousTracks, $nextTracks, $nonRepetitionRules)) {
                    $filteredTracks[] = $track;
                }
            }
        }
    }

    // Генерация клока
    $clockDuration = 0;
    $clockTracks = [];
    foreach ($filteredTracks as $track) {
        $trackDuration = timeToSeconds($track['duration']);
        if ($clockDuration + $trackDuration >= timeToSeconds($duration) - 10 && $clockDuration + $trackDuration <= timeToSeconds($duration) + 30) {
            $clockTracks[] = $track;
            $clockDuration += $trackDuration;
        }
    }

    // Запись в БД
    $clockID = uniqid();
    $db = new PDO('mysql:host=localhost;dbname=radio', 'username', 'password');
    $stmt = $db->prepare("INSERT INTO cloks (name, id, date, time, duration) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $clockID, $date, $time, secondsToTime($clockDuration)]);

    foreach ($clockTracks as $track) {
        $stmt = $db->prepare("INSERT INTO cloks_tracks (clock_id, track_id, date, time) VALUES (?, ?, ?, ?)");
        $stmt->execute([$clockID, $track['treckID'], $date, $time]);
    }

    return $clockID;
}
?>
