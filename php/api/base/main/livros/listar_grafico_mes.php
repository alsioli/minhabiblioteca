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

        // ── Total de leituras concluídas por mês (via data_fim) ──────
        $sqlTotal = "
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

        // ── Leituras concluídas por mês (mês de data_fim) ─────────────
        $sqlConcluidas = "
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

        // ── Leituras ainda em andamento por mês de início ─────────────
        $sqlAndamento = "
            SELECT
                FORMAT(data_inicio, 'MM/yyyy') AS mes,
                YEAR(data_inicio)              AS ano,
                MONTH(data_inicio)             AS mes_num,
                COUNT(*)                       AS total
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NULL
              AND data_inicio IS NOT NULL
            GROUP BY FORMAT(data_inicio, 'MM/yyyy'), YEAR(data_inicio), MONTH(data_inicio)
            ORDER BY YEAR(data_inicio) ASC, MONTH(data_inicio) ASC
        ";

        $result_status = true;
        $result_data   = [
            'total_por_mes'     => $db->GetMany($sqlTotal),
            'concluidas_por_mes'=> $db->GetMany($sqlConcluidas),
            'andamento_por_mes' => $db->GetMany($sqlAndamento),
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar dados mensais: ' . $e->getMessage();
    }
}
