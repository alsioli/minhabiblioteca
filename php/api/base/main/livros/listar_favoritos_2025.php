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

    // Livros com avaliação 5 (ou '5F') lidos em 2025.
    // Compatível com avaliacao armazenada como numérico (5) ou texto ('5', '5F').
    $sql = "
        SELECT
            titulo, autor, avaliacao, mes
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE CAST(avaliacao AS VARCHAR(10)) LIKE '5.%'
          AND mes like '%2025-%'
        ORDER BY mes DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar favoritos de 2025: ' . $e->getMessage();
    }
}
