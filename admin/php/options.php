<?php
include "../../php/DB-Config.php";
include "../../php/response.php";
include "../../php/idGenerator.php";
$data = json_decode(file_get_contents("php://input"));
$dataSend = [];
$dataresult = [];

switch ($data->comand) {
    case "get":
        switch ($data->option) {
            case "artists":
                $sql = $mysql->query("SELECT `artistLinkID`, `artistLink` FROM `artistLink`;");
                if ($mysql->error_list[0]["errno"] == null) {
                    while ($row = $sql->fetch_assoc()) {
                        array_push($dataresult, $row);
                    }
                    $dataSend["options"] = $dataresult;
                    $dataSend['result'] = "getOk";
                    $dataSend["comand"] = $data->comand;
                } else {
                    $dataSend['result'] = 'error';
                    $dataSend["comand"] = $data->comand;
                }
                $mysql->close();
                break;

            case "categorys":
                $sql = $mysql->query("SELECT `categoryID`, `category` FROM `category`;");
                if ($mysql->error_list[0]["errno"] == null) {
                    while ($row = $sql->fetch_assoc()) {
                        array_push($dataresult, $row);
                    }
                    $dataSend["options"] = $dataresult;
                    $dataSend['result'] = "getOk";
                    $dataSend["comand"] = $data->comand;
                } else {
                    $dataSend['result'] = 'error';
                    $dataSend["comand"] = $data->comand;
                }
                $mysql->close();
                break;

            case "moods":
                $sql = $mysql->query("SELECT `moodID`, `mood` FROM `mood`;");
                if ($mysql->error_list[0]["errno"] == null) {
                    while ($row = $sql->fetch_assoc()) {
                        array_push($dataresult, $row);
                    }
                    $dataSend["options"] = $dataresult;
                    $dataSend['result'] = "getOk";
                    $dataSend["comand"] = $data->comand;
                } else {
                    $dataSend['result'] = 'error';
                    $dataSend["comand"] = $data->comand;
                }
                $mysql->close();
                break;
            default:
                $dataSend['result'] = 'error';
                $dataSend["comand"] = $data->comand;
                break;
        }
        break;
        case"create":
            switch ($data->option) {
                case "artist":
                    $value = $data->value;
                    $id = id(2408);
                    $sql = $mysql->query("INSERT INTO `artistLink` (`artistLinkID`, `artistLink`) values('$id', '$value');");
                    if ($mysql->error_list[0]["errno"] == null) {
                        $dataSend["id"] = $id;
                        $dataSend['result'] = "createOk";
                        $dataSend["comand"] = $data->comand;
                    } else {
                        $dataSend['result'] = 'error';
                        $dataSend["comand"] = $data->comand;
                    }
                    $mysql->close();
                    break;
    
                case "category":
                    $value = $data->value;
                    $id = id(0307);
                    $sql = $mysql->query("INSERT INTO `category` (`categoryID`, `category`) values('$id', '$value');");
                    if ($mysql->error_list[0]["errno"] == null) {
                        $dataSend["id"] = $id;
                        $dataSend['result'] = "createOk";
                        $dataSend["comand"] = $data->comand;
                    } else {
                        $dataSend['result'] = 'error';
                        $dataSend["comand"] = $data->comand;
                    }
                    $mysql->close();
                    break;
    
                case "mood":
                    $value = $data->value;
                    $id = id(3009);
                    $sql = $mysql->query("INSERT INTO `mood` (`moodID`, `mood`) values('$id', '$value');");
                    if ($mysql->error_list[0]["errno"] == null) {
                        $dataSend["id"] = $id;
                        $dataSend['result'] = "createOk";
                        $dataSend["comand"] = $data->comand;
                    } else {
                        $dataSend['result'] = 'error';
                        $dataSend["comand"] = $data->comand;
                    }
                    $mysql->close();
                    break;
                default:
                    $dataSend['result'] = 'error';
                    $dataSend["comand"] = $data->comand;
                    break;
            }
            break;
}

systemResponse($dataSend);


