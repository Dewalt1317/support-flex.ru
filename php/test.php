<?php
// Параметры запроса
$client_id = '12266';
$redirect_uri = 'https://support-flex.ru';
$response_type = 'code';
$scope = 'oauth-donation-index';

// URL для авторизации
$auth_url = "https://www.donationalerts.com/oauth/authorize?client_id=$client_id&redirect_uri=$redirect_uri&response_type=$response_type&scope=$scope";

// Редирект на страницу авторизации
header("Location: $auth_url");
exit;

// После редиректа, захватим `code` из URL
if (isset($_GET['code'])) {
    $code = $_GET['code'];
    echo "Authorization code: " . htmlspecialchars($code);
} else {
    echo "Authorization code not found.";
}
?>
