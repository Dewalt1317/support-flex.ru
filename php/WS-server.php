<?php
include "idGenerator.php";
include "getTitle.php";
include "chat.php";
include "donatRequest.php";
include "presenter.php";
include "latestTracks.php";
$host = '0.0.0.0'; // хост
$port = '9000'; // порт
$null = null;

// Создаем контекст потока для SSL
$context = stream_context_create();
stream_context_set_option($context, 'ssl', 'local_cert', '../../../Certbot/live/support-flex.ru/cert.pem');
stream_context_set_option($context, 'ssl', 'local_pk', '../../../Certbot/live/support-flex.ru/privkey.pem');
stream_context_set_option($context, 'ssl', 'allow_self_signed', true);
stream_context_set_option($context, 'ssl', 'verify_peer', false);

// Создаем сокет TCP/IP потока с SSL
$socket = stream_socket_server("tls://{$host}:{$port}", $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context);
if ($socket === false) {
    die("Не удалось создать сокет: $errstr ($errno)");
}

// Создаем и добавляем слушающий сокет в список
$clients = array($socket);

echo "Сервер слушает адрес $host и порт $port\n";
echo "Чтобы остановить сервер, нажмите Ctrl+C\n";

// Устанавливаем обработчик ошибок
set_error_handler("errorHandler");

// Начинаем бесконечный цикл, чтобы наш скрипт не остановился
while (true) {
    try {
    // Управляем несколькими соединениями
    $changed = $clients;
    // Возвращает ресурсы сокета в массив $changed
    stream_select($changed, $null, $null, 0, 10);

    // Проверяем на новый сокет
    if (in_array($socket, $changed)) {
        $socket_new = stream_socket_accept($socket); // принимаем новый сокет
        if ($socket_new === false) {
            echo "Не удалось принять новое соединение\n";
            continue;
        }
        $clients[] = $socket_new; // добавляем сокет в массив клиентов

        $header = fread($socket_new, 1024); // читаем данные, отправленные сокетом
        perform_handshaking($header, $socket_new, $host, $port); // выполняем рукопожатие websocket
        $dataSend = ["type" => "title", "data" => getTitle()];
        send_to_specific_client(mask(json_encode($dataSend)), $socket_new);
        $dataSend = ["type" => "presenter", "data" => presenter()];
        send_to_specific_client(mask(json_encode($dataSend)), $socket_new);
        // Освобождаем место для нового сокета
        $found_socket = array_search($socket, $changed);
        unset($changed[$found_socket]);
    }

    // Проходим по всем подключенным сокетам
    foreach ($changed as $changed_socket) {

        // Проверяем на входящие данные
        while (($buf = fread($changed_socket, 1024)) !== '') {
            $received_text = unmask($buf); // демаскируем данные
            $dataClient = json_decode($received_text); // декодируем json
            switch ($dataClient->type) {
                case "sendMessage":
                    $chatResult = chat("send", $dataClient->data);
                    if ($chatResult["result"] == "sendOK") {
                        $dataSend = ["type" => "chat", "data" => ["result" => "sendOK"]];
                        send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
                        if (!$dataClient->data->ReplyMessageID) $dataClient->data->ReplyMessageID = "";
                        if (!$dataClient->data->photoSRC) $dataClient->data->photoSRC = "";
                        // Подготавливаем данные для отправки клиентам
                        $dataSend = [
                            "type" => "chat", "data" => [
                                "result" => "getOk", "message" => [
                                    [
                                        "messageID" => $chatResult["messageID"],
                                        "date" => date("Y-m-d"),
                                        "time" => date("H:i:s"),
                                        "ReplyMessageID" => $dataClient->data->ReplyMessageID,
                                        "textMessage" => $dataClient->data->messageText,
                                        "photoSRC" => $dataClient->data->photoSRC,
                                        "userID" => $dataClient->data->userID,
                                        "name" => $chatResult["name"]]]]];
                        // Отправляем данные клиентам
                        send(mask(json_encode($dataSend)), $clients);
                    } else {
                        $dataSend = ["type" => "chat", "data" => $chatResult];
                        send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
                    }
                    break;
                case "chatReg":
                    $chatResult = chat("regUser", $dataClient->data);
                    $dataSend = ["type" => "chat", "data" => $chatResult];
                    send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
                    break;
                case "getChat":
                    $dataSend = ["type" => "chat", "data" => chat("getChat", null)];
                    send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
                    break;
                    case "getLatestTracks":
                        $dataSend = ["type" => "latestTracks", "data" => latestTracks()];
                        send_to_specific_client(mask(json_encode($dataSend)), $changed_socket);
                        break;
            }
            break 2; // выходим из этого цикла
        }

        $buf = @fread($changed_socket, 1024, PHP_NORMAL_READ);
        if ($buf === false) { // проверяем отключенного клиента
            // удаляем клиента из массива $clients
            $found_socket = array_search($changed_socket, $clients);
            unset($clients[$found_socket]);
        }
    }
    $donateDate = donateRequest();
    if ($donateDate["result"] == "message") {
        send(mask(json_encode($donateDate["message"])), $clients); // отправляем данные
    }
    $fileTempWS = "temp/WS.json";
    $TempWS = json_decode(file_get_contents($fileTempWS));
    if (date("d.m.Y H:i:s") >= $TempWS->timeRequestTitle) {
        $dataSend = ["type" => "title", "data" => getTitle()];
        send(mask(json_encode($dataSend)), $clients); // отправляем данные
        $dataSend = ["type" => "presenter", "data" => presenter()];
        send(mask(json_encode($dataSend)), $clients); // отправляем данные
        $date = date_create(date('d.m.Y H:i:s'));
        date_modify($date, '+5 sec');
        $TempWS->timeRequestTitle = date_format($date, "d.m.Y H:i:s");
        file_put_contents($fileTempWS, json_encode($TempWS, JSON_UNESCAPED_UNICODE));
    }

    } catch (Exception $e) {
        echo 'Произошла ошибка: ',  $e->getMessage(), "\n";
    }
}
// закрываем слушающий сокет
fclose($socket);


function send($message, $clients)
{
    foreach ($clients as $client) {
        fwrite($client, $message);
    }
}

function send_to_specific_client($msg, $client)
{
    @fwrite($client, $msg, strlen($msg));
}

// Демаскируем входящее сообщение
function unmask($text)
{
    $length = ord($text[1]) & 127;
    if ($length == 126) {
        $masks = substr($text, 4, 4);
        $data = substr($text, 8);
    } elseif ($length == 127) {
        $masks = substr($text, 10, 4);
        $data = substr($text, 14);
    } else {
        $masks = substr($text, 2, 4);
        $data = substr($text, 6);
    }
    $text = "";
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    return $text;
}

// Кодируем сообщение для передачи клиенту.
function mask($text)
{
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($text);

    if ($length <= 125)
        $header = pack('CC', $b1, $length);
    elseif ($length > 125 && $length < 65536)
        $header = pack('CCn', $b1, 126, $length);
    elseif ($length >= 65536)
        $header = pack('CCNN', $b1, 127, $length);
    return $header . $text;
}

// Рукопожатие с новым клиентом.
function perform_handshaking($receved_header, $client_conn, $host, $port)
{
    $headers = array();
    $lines = preg_split("/\r\n/", $receved_header);
    foreach ($lines as $line) {
        $line = chop($line);
        if (preg_match('/\A(\S+): (.*)\z/', $line, $matches)) {
            $headers[$matches[1]] = $matches[2];
        }
    }

    $secKey = $headers['Sec-WebSocket-Key'];
    $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
    // Заголовок рукопожатия
    $upgrade = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "WebSocket-Origin: $host\r\n" .
        "WebSocket-Location: ws://$host:$port/demo/shout.php\r\n" .
        "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
    fwrite($client_conn, $upgrade, strlen($upgrade));
}

// Обработчик ошибок
function errorHandler($errno, $errstr, $errfile, $errline)
{
    global $received_text, $response_text; // Добавляем глобальные переменные

    if (!(error_reporting() & $errno)) {
        return;
    }

    echo "\n***************************\n";
    echo "*Ошибка: Подробности ниже.*\n";
    echo "***************************\n\n";

    $logPath = "log/web_socket_server_error.log";
    $errorMessage = "Ошибка: [$errno] $errstr в файле $errfile на строке $errline\n";
    $errorMessage .= "Полученные данные: $received_text\n";
    $errorMessage .= "Отправленные данные: $response_text\n";
    file_put_contents($logPath, $errorMessage, FILE_APPEND);

    echo "$errorMessage\nЛог сохранён по пути: $logPath\n";
}
