<?php
$fileTempDonat = "../temp/donatRequestTime.json";
$TempDonat = json_decode(file_get_contents($fileTempDonat));
$originalTime =
$targedTime = "18-50-15";
if ($originalTime<$targedTime) {
    print_r(date('d.m.Y ')  - "00.00.0000 00-05-00");
} else {
    print_r("false");
}
print_r($TempDonat->timeRequest);
$date = date_create(date('d.m.Y H:i:s'));
date_modify($date, '+5 min');

$TempDonat->timeRequest = date_format($date, "H:i:s");
file_put_contents($fileTempDonat, json_encode($TempDonat));
