<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        GetMethod();
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $sql = "
        SELECT
            titulo, autor, avaliacao, mes_leitura
        FROM [Biblioteca].[dbo].[Livros]
        WHERE avaliacao = 5
          AND mes_leitura LIKE '%/2025'
        ORDER BY mes_leitura DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar favoritos de 2025: ' . $e->getMessage();
    }
}
