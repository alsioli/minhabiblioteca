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

    $sql = "
        SELECT DISTINCT mes
        FROM Leituras
        WHERE data_fim IS NOT NULL
          AND bAtivo = 1
        ORDER BY
            TRY_CAST(SUBSTRING(mes, 4, 4) AS INT) DESC,
            TRY_CAST(SUBSTRING(mes, 1, 2) AS INT) DESC
    ";

    try {
        $db   = new DataBase();
        $rows = $db->GetMany($sql, []);

        $result_status = true;
        $result_data   = array_column($rows, 'mes');
    } catch (Exception $e) {
        $result_error = 'Erro ao listar meses: ' . $e->getMessage();
    }
}
