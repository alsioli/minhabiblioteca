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
]);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $sql = "
        SELECT DISTINCT CAST(tipo_midia AS NVARCHAR(100)) AS tipo_leitura
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE tipo_midia IS NOT NULL
          AND LTRIM(RTRIM(CAST(tipo_midia AS NVARCHAR(100)))) <> ''
        ORDER BY tipo_leitura ASC
    ";

    try {
        $db = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar tipos de leitura: ' . $e->getMessage();
    }
}
