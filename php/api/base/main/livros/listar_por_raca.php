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
            ISNULL(NULLIF(TRIM([raça]), ''), 'Não informado') AS raca,
            COUNT(*)                                           AS total,
            SUM(CASE WHEN status = 'Lido'  THEN 1 ELSE 0 END) AS lidos,
            SUM(CASE WHEN status = 'Lendo' THEN 1 ELSE 0 END) AS lendo,
            SUM(CASE WHEN status NOT IN ('Lido','Lendo') OR status IS NULL THEN 1 ELSE 0 END) AS nao_lidos
        FROM [Biblioteca].[dbo].[Livros]
        GROUP BY ISNULL(NULLIF(TRIM([raça]), ''), 'Não informado')
        ORDER BY total DESC
    ";

    try {
        $db         = new DataBase();
        $rows       = $db->GetMany($sql);
        $totalGeral = array_sum(array_column($rows, 'total'));

        $result_status = true;
        $result_data   = [
            'total_geral' => $totalGeral,
            'linhas'      => $rows,
        ];
    } catch (Exception $e) {
        $result_error = 'Erro ao listar por raça: ' . $e->getMessage();
    }
}
