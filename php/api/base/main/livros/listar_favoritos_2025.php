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

    // Livros com avaliação 5 lidos em 2026, ordenados por data_fim desc.
    $sql = "
        SELECT
            titulo,
            autor,
            avaliacao,
            mes                                         AS mes_leitura,
            CONVERT(VARCHAR(7), data_fim, 126)          AS data_fim_fmt
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE FLOOR(ISNULL(avaliacao, 0)) = 5
          AND data_fim IS NOT NULL
          AND YEAR(data_fim) = 2026
        ORDER BY data_fim DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar favoritos de 2026: ' . $e->getMessage();
    }
}
