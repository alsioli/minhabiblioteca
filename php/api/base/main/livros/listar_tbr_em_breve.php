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
            titulo, autor, origem, mes_referencia, previsao_leitura
        FROM [Biblioteca].[dbo].[TBR_Mensal]
        WHERE mes_referencia = FORMAT(GETDATE(), 'MM/yyyy')
        ORDER BY
            CASE previsao_leitura
                WHEN 'Começo do mês'    THEN 1
                WHEN 'Depois do dia 10' THEN 2
                WHEN 'Antes do dia 20'  THEN 3
                ELSE 4
            END
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar TBR em breve: ' . $e->getMessage();
    }
}
