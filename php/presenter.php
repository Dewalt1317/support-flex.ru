<?php
function presenter (){
    $fileTemp = "temp/presenter.json";
    $temp = json_decode(file_get_contents($fileTemp));
    return $temp->presenter;
}