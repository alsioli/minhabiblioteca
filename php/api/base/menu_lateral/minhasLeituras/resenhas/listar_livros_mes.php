<?php

include_once __DIR__ . "/../../../../../utils/function/database.php";

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
]);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $mes = trim($_GET['mes'] ?? '');

    if (empty($mes)) {
        $result_error = 'Mês não informado.';
        return;
    }

    $sql = "
        SELECT id, titulo, autor, mes, avaliacao
        FROM Leituras
        WHERE mes = :mes
          AND data_fim IS NOT NULL
          AND bAtivo = 1
        ORDER BY titulo
    ";

    try {
        $db   = new DataBase();
        $rows = $db->GetMany($sql, [':mes' => $mes]);

        $result_status = true;
        $result_data   = $rows;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar livros: ' . $e->getMessage();
    }
}
