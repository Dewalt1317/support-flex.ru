<?php
//include "idGenerator.php";
//include "getTitle.php";
//include "chat.php";
//include "donatRequest.php";
//include "presenter.php";
//$host = '0.0.0.0'; // хост
//$port = '9000'; // порт
//$null = null;
//
//// Создаем контекст потока для SSL
//$context = stream_context_create();
//stream_context_set_option($context, 'ssl', 'local_cert', '../../../Certbot/live/support-flex.ru/cert.pem');
//stream_context_set_option($context, 'ssl', 'local_pk', '../../../Certbot/live/support-flex.ru/privkey.pem');
//stream_context_set_option($context, 'ssl', 'allow_self_signed', false);
//stream_context_set_option($context, 'ssl', 'verify_peer', true);
//
//// Создаем сокет TCP/IP потока с SSL
//$socket = stream_socket_server("tls://{$host}:{$port}", $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context);
//
//// Создаем и добавляем слушающий сокет в список
//$clients = array($socket);
//
//echo "Сервер слушает адрес $host и порт $port\n";
//echo "Чтобы остановить сервер, нажмите Ctrl+C\n";
//
//// Устанавливаем обработчик ошибок
//set_error_handler("errorHandler");
//
//// Начинаем бесконечный цикл, чтобы наш скрипт не остановился
//while (true) {
//try {
//// Управляем несколькими соединениями
//$changed = $clients;
//// Возвращает ресурсы сокета в массив $changed
//stream_select($changed, $null, $null, 0, 10);
//
//// Проверяем на новый сокет
//if (in_array($socket, $changed)) {
//    $socket_new = stream_socket_accept($socket); // принимаем новый сокет
//    $clients[] = $socket_new; // добавляем сокет в массив клиентов
//
//    $header = fread($socket_new, 1024); // читаем данные, отправленные сокетом
//    perform_handshaking($header, $socket_new, $host, $port); // выполняем рукопожатие websocket
//    $dataSend = ["type" => "title", "data" => getTitle()];
//    send_to_specific_client(mask(json_encode($dataSend)), $socket_new);
//    // Освобождаем место для нового сокета
//    $found_socket = array_search($socket, $changed);
//    unset($changed[$found_socket]);
//}
//
//// Проходим по всем подключенным сокетам
//foreach ($changed as $changed_socket) {
//
//// Проверяем на входящие данные
//while (($buf = fread($changed_socket, 1024)) !== '') {
//    $received_text = unmask($buf); // демаскируем данные
//    $dataClient = json_decode($received_text); // декодируем json
//    switch ($dataClient->type) {
//        case "sendMessage":
//            $chatResult = chat("send", $dataClient->data);
//            if ($chatResult["result"] == "sendOK") {
//                $dataSend = ["type" => "chat", "data" => ["result" => "sendOK"]];
//                send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
//                if (!$dataClient->data->ReplyMessageID) $dataClient->data->ReplyMessageID = "";
//                if (!$dataClient->data->photoSRC) $dataClient->data->photoSRC = "";
//                // Подготавливаем данные для отправки клиентам
//                $dataSend = [
//                    "type" => "chat", "data" => [
//                        "result" => "getOk", "message" => [
//                            [
//                                "messageID" => $chatResult["messageID"],
//                                "date" => date("Y-m-d"),
//                                "time" => date("H:i:s"),
//                                "ReplyMessageID" => $dataClient->data->ReplyMessageID,
//                                "textMessage" => $dataClient->data->messageText,
//                                "photoSRC" => $dataClient->data->photoSRC,
//                                "userID" => $dataClient->data->userID,
//                                "userName" => $chatResult["name"]]]]];
//                // Отправляем данные клиентам
//                send(mask(json_encode($dataSend)),
//        }
//    } catch (Exception $e) {
//        echo 'Произошла ошибка: ',  $e->getMessage(), "\n";
//    }
//}
        $dataTitle = ["title" => "test", "listeners" => "test", "cover" => "test", "link" => "test", "status" => "response"];
        $data = json_encode($dataTitle, JSON_UNESCAPED_UNICODE);
        file_put_contents("test.test", $data);
?>
