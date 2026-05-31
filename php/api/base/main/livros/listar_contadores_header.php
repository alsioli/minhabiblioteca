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

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $anoAtual = (int)date('Y');
    $meses_pt = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    // Período: últimos 12 meses excluindo o mês atual
    // Ex: maio/2026 → mai/2025 até abr/2026
    $tsStart  = strtotime('first day of this month -12 months');
    $tsEnd    = strtotime('last day of last month');

    $startDate  = date('Y-m-d', $tsStart);
    $endDate    = date('Y-m-d', $tsEnd);
    $periodoFmt = $meses_pt[(int)date('n', $tsStart)] . '/' . date('y', $tsStart) .
                  ' – ' .
                  $meses_pt[(int)date('n', $tsEnd)]   . '/' . date('y', $tsEnd);

    try {
        $db = new DataBase();

        // ── Card 1: Leituras concluídas por ano ───────────────────
        // Baseado em data_fim — apenas tabela Leituras
        $a0 = $anoAtual;
        $a1 = $anoAtual - 1;
        $a2 = $anoAtual - 2;

        $sqlAnos = "
            SELECT
                SUM(CASE WHEN YEAR(data_fim) = :a0 THEN 1 ELSE 0 END) AS y0,
                SUM(CASE WHEN YEAR(data_fim) = :a1 THEN 1 ELSE 0 END) AS y1,
                SUM(CASE WHEN YEAR(data_fim) = :a2 THEN 1 ELSE 0 END) AS y2
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
        ";
        $rowAnos = $db->GetOne($sqlAnos, [':a0' => $a0, ':a1' => $a1, ':a2' => $a2]);

        $anos = [
            $a0 => (int)($rowAnos['y0'] ?? 0),
            $a1 => (int)($rowAnos['y1'] ?? 0),
            $a2 => (int)($rowAnos['y2'] ?? 0),
        ];

        // ── Card 2: Média mensal — últimos 12 meses ────────────────
        $sqlMedia = "
            SELECT COUNT(*) AS total
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
              AND data_fim >= :startDate
              AND data_fim <= :endDate
        ";
        $rowMedia     = $db->GetOne($sqlMedia, [':startDate' => $startDate, ':endDate' => $endDate]);
        $totalMedia   = (int)($rowMedia['total'] ?? 0);
        $mediaDecimal = round($totalMedia / 12.0, 1);

        // ── Card 3: Top 3 países — baseado em Leituras concluídas ─
        $sqlPaises = "
            SELECT TOP 3
                TRIM(pais) AS pais,
                COUNT(*)   AS total
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
              AND pais IS NOT NULL
              AND TRIM(pais) <> ''
            GROUP BY TRIM(pais)
            ORDER BY total DESC
        ";
        $topPaises = $db->GetMany($sqlPaises);

        $result_status = true;
        $result_data   = [
            'anos'              => $anos,
            'media_mensal'      => $mediaDecimal,
            'periodo_media_fmt' => $periodoFmt,
            'top_paises'        => $topPaises,
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar contadores: ' . $e->getMessage();
    }
}
