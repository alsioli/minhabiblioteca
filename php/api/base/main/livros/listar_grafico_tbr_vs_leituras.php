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

    try {
        $db = new DataBase();

        // Livros planejados no TBR por mês (TBR_Mensal.mes_referencia)
        $sqlTBR = "
            SELECT
                mes_referencia          AS mes,
                COUNT(*)                AS total
            FROM [Biblioteca].[dbo].[TBR_Mensal]
            WHERE mes_referencia IS NOT NULL
              AND mes_referencia <> ''
            GROUP BY mes_referencia
        ";

        // Leituras concluídas por mês (Leituras.data_fim)
        $sqlLidas = "
            SELECT
                FORMAT(data_fim, 'MM/yyyy') AS mes,
                YEAR(data_fim)              AS ano,
                MONTH(data_fim)             AS mes_num,
                COUNT(*)                    AS total
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
            GROUP BY FORMAT(data_fim, 'MM/yyyy'), YEAR(data_fim), MONTH(data_fim)
            ORDER BY YEAR(data_fim) ASC, MONTH(data_fim) ASC
        ";

        $result_status = true;
        $result_data   = [
            'tbr_por_mes'   => $db->GetMany($sqlTBR),
            'lidas_por_mes' => $db->GetMany($sqlLidas),
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar comparativo TBR vs Leituras: ' . $e->getMessage();
    }
}
