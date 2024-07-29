<?php
    $validTimeIteration = 0;
    $validTime = 0;
function manipulateDateTime($time1, $date1, $time2, $day, $operation) {
    global $validTime;
    $timeFormat = 'H:i:s';
    $dateFormat = 'Y-m-d';
    $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $time1");
    $datetime2 = DateTime::createFromFormat($timeFormat, $time2);
    
    if (!$datetime1 || !$datetime2) {
        return "Invalid time or date format.";
    }

    switch ($operation) {
        case 'subtract':
            $interval = new DateInterval("P{$day}D");
            $datetime1->sub($interval);
            $interval = $datetime2->diff(new DateTime('00:00:00'));
            $datetime1->add($interval);
            $result = 'subtract';
            break;
        case 'add':
            $interval = new DateInterval("P{$day}D");
            $datetime1->add($interval);
            $interval = $datetime2->diff(new DateTime('00:00:00'));
            $datetime1->sub($interval);
            $result = 'add';
            break;
        case 'compare':
          $timeCompare2 = DateTime::createFromFormat("$dateFormat $timeFormat", "$day $time2");
            if ($datetime1 > $timeCompare2) {
                $result = 'greater';
            } elseif ($datetime1 < $timeCompare2) {
                $result = 'less';
            } else {
                $result = 'equal';
            }
            break;
        case 'clockAdd':
          $time1 = explode(":",$time1);
          $time2 = explode(":",$time2);
          $s = abs(validTimeAdd($time1[2] + $time2[2]));
          $m = abs(validTimeAdd($time1[1] + $time2[1] + $validTime));
          $h = abs($time1[0] + $time2[0] + $validTime);
          if($h < 10){
            $h = 0 . $h;
          }
          if($m < 10){
            $m = 0 . $m;
          }
          if($s < 10){
            $s = 0 . $s;
          }
          $HSM = $h . ":" . $m . ":" . $s;
          $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $HSM");
            $result = 'add';
            break;
        case 'clockSubtract':
            $time1 = explode(":",$time1);
            $time2 = explode(":",$time2);
            $s = abs(validTimeSubtract($time1[2] - $time2[2]));
            $m = abs(validTimeSubtract($time1[1] - $time2[1] - $validTime));
            $h = abs($time1[0] - $time2[0] - $validTime);
            if($h < 10){
                $h = 0 . $h;
              }
              if($m < 10){
                $m = 0 . $m;
              }
              if($s < 10){
                $s = 0 . $s;
              }
            $HSM = $h . ":" . $m . ":" . $s;
             $datetime1 = DateTime::createFromFormat("$dateFormat $timeFormat", "$date1 $HSM");
            $result = 'subtract';
            break;
        case 'clockCompare':
            $time1 = explode(":",$time1);
            $time2 = explode(":",$time2);
            if ($time1[0] > $time2[0]) {
                $result = 'greater';
            } elseif ($time1[0] < $time2[0]) {
                $result = 'less';
            } else {
                if ($time1[1] > $time2[1]) {
                    $result = 'greater';
                } elseif ($time1[1] < $time2[1]) {
                    $result = 'less';
                } else {
                    if ($time1[2] > $time2[2]) {
                        $result = 'greater';
                    } elseif ($time1[2] < $time2[2]) {
                        $result = 'less';
                    } else {
                        $result = 'equal';
                    }
                }
            }   
            break;
        default:
            return "Invalid operation.";
    }

    return [
        "date" => $datetime1->format($dateFormat),
        "time" => $datetime1->format($timeFormat),
        "result" => $result
    ];
}
function validTimeAdd ($time) {
    global $validTimeIteration;
    global $validTime;
    if($time > 60) {
        $time = $time - 60;
        $validTimeIteration = $validTimeIteration + 1;
        return validTimeAdd($time);
    } else {
        $validTime = $validTimeIteration;
        $validTimeIteration = 0;
        return $time;
    }
}

function validTimeSubtract ($time) {
    global $validTimeIteration;
    global $validTime;
    if($time < 0) {
        $time = $time + 60;
        $validTimeIteration = $validTimeIteration + 1;
        return validTimeSubtract($time);
    } else {
        $validTime = $validTimeIteration;
        $validTimeIteration = 0;
        return $time;
    }
}

function checkArtistStopAndTrackID($TrackAnalysis, $tracksArr1, $tracksArr2, $trackAnalysisTimeDate, $nonRepetitionRules) {
    foreach($tracksArr1 as $track){
      $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["track"], "0", 'subtract');
      if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
        if($TrackAnalysis["treckID"] !== $track["treckID"]){
          $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["artist"], "0", 'subtract');
          if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "less"){
            foreach($TrackAnalysis["artistLinkIDs"] as $artist){
              foreach($track["artistLinkIDs"] as $artistArr){
                if($artist === $artistArr){
                  return false;
                }
              }
              unset($artistArr);
            }
            unset($artist);
          }
        } else {
          return false;
        }
      }
    }
    unset($track);
    foreach($tracksArr2 as $track){
      $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["track"], "0", 'add');
      if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "greater"){
        if($TrackAnalysis["treckID"] !== $track["treckID"]){
          $trackTimeDate = manipulateDateTime($trackAnalysisTimeDate["time"], $trackAnalysisTimeDate["date"], $nonRepetitionRules["artist"], "0", 'add');
          if(manipulateDateTime($trackTimeDate["time"], $trackTimeDate["date"], $track["time"], $track["date"], 'compare')["result"] === "greater"){
          foreach($TrackAnalysis["artistLinkIDs"] as $artist){
            foreach($track["artistLinkIDs"] as $artistArr){
              if($artist === $artistArr){
                return false;
              }
            }
            unset($artistArr);
          }
          unset($artist);
        }
        } else {
          return false;
        }
      }
    }
    unset($track);
    return true;
  }

  $trackClock = [
    "treckID" => "8000668479c88e6a89.58684309",
    "duration" => "00:04:33",
    "artistLinkIDs" => ["240866941eaa4a6250.90347644", "240866941eaa4a62d5.18418642", "240866941eaa4a62f7.50236478"],
    "categories" => ["1996572cd54d8b1b0.14506097"]
  ];
  
  $previousTracks = [
    [
        "treckID" => "9000779580d9he5b90.69795410",
        "time" => "22:55:00",
        "date" => "2024-07-26",
        "artistLinkIDs" => ["240866941eaa4a6250.90347644", "350977052fbb5b73e6.29529753", "350977052fbb5b7408.61347589"]
    ]
];

$nextTracks = [
    [
        "treckID" => "8000668479c88e6a89.58e84309",
        "time" => "03:30:12",
        "date" => "2024-07-27",
        "artistLinkIDs" => ["240866941eaa4a6250.90347644", "140755831d9983a529.07307419", "140755831d9983a541.39125255"]
    ]
];

$nonRepetitionRules = ["artist" => "02:00:00", "track" => "06:00:00"];

$time = "01:00:00";

$date = "2024-07-27";

$dur = "00:00:00";

$trackTimeDate = manipulateDateTime($time, $date, manipulateDateTime($dur, $date, $trackClock["duration"], "0", 'clockAdd')["time"], "0", 'add');

print_r(checkArtistStopAndTrackID($trackClock, $previousTracks, $nextTracks, $trackTimeDate, $nonRepetitionRules));
