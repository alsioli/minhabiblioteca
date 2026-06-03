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
        SELECT mes
        FROM (
            SELECT DISTINCT
                FORMAT(data_fim, 'MM/yyyy') AS mes,
                YEAR(data_fim)              AS ano,
                MONTH(data_fim)             AS mes_num
            FROM Leituras
            WHERE data_fim IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM Resenhas r WHERE r.id_leitura = Leituras.id
              )
        ) AS t
        ORDER BY ano DESC, mes_num DESC
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
