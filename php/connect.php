<?php
session_start();
include "response.php";
$fileConf = "../config/connect.conf";
$frontFileConf = "../config/frontConfig.conf";
$frontConfig = json_decode(file_get_contents($frontFileConf));
$config = json_decode(file_get_contents($fileConf));
$data = json_decode(file_get_contents("php://input"));
if (!$data->codeword){
    if($_SESSION["connect"] == "OK"){
        $data = ["streamLink" => $frontConfig->streamLink, "phpGet"=> $frontConfig->phpGet, "result"=>"connectOK"];
    } else {
    $data = ["result"=>"connectFail"];
    }
    systemResponse($data);
    exit();
}
$data->codeword = filter_var(
    trim(strtoupper($data->codeword)),
    FILTER_SANITIZE_STRING
); if (date("H:i:s") >= $_SESSION["attemptsDate"] or !$_SESSION["attemptsDate"]) {
    if ($data->codeword == $config->codeword){
        $data = ["streamLink" => $frontConfig->streamLink, "phpGet"=> $frontConfig->phpGet, "result"=>"connectOK"];
        $_SESSION["attemptsDate"] = "";
        $_SESSION["attempts"] = "";
        $_SESSION["connect"] = "OK";
    } elseif (!$_SESSION["attempts"]) {
        $_SESSION["attempts"] = 1;
        $data = ["result"=>"connectFail", "attempts"=>$config->attempts - $_SESSION["attempts"]];
    } elseif ($_SESSION["attempts"] < $config->attempts) {
        $_SESSION["attempts"] = $_SESSION["attempts"] + 1;
        $data = ["result"=>"connectFail", "attempts"=>$config->attempts - $_SESSION["attempts"]];
    } elseif ($_SESSION["attempts"] >= $config->attempts) {
        if (date("H:i:s") >= $_SESSION["attemptsDate"]) {
            $_SESSION["attemptsDate"] = "";
            $_SESSION["attempts"] = 1;
            $data = ["result"=>"connectFail", "attempts"=>$config->attempts - $_SESSION["attempts"]];
        } else {
        $date = date_create(date('d.m.Y H:i:s'));
        date_modify($date, '+10 min');
        $_SESSION["attemptsDate"] = date_format($date, "H:i:s");
        $data = ["result"=>"connectFail", "attempts"=>0];
        }
    }
} else {
    $data = ["result"=>"connectFail", "attempts"=>0];
}
systemResponse($data);
