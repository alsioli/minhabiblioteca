<?php
/*
 * Card "Países mais lidos" do header.
 * GET ?ano=YYYY  → top 5 países das leituras concluídas (Leituras.data_fim) naquele ano.
 * Sem ano → usa o ano mais recente com leituras concluídas.
 * Retorna: { ano, anos: [2026, 2025, ...], top: [{pais, total}, ...] }
 */

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    GetMethod();
} else {
    http_response_code(405);
    $result_error = 'Method Not Allowed';
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    try {
        $db = new DataBase();

        // Anos com leituras concluídas (para o seletor do card)
        $rowsAnos = $db->GetMany("
            SELECT DISTINCT YEAR(data_fim) AS ano
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
            ORDER BY ano DESC
        ");
        $anos = array_map(fn($r) => (int)$r['ano'], $rowsAnos ?: []);

        $ano = (int)($_GET['ano'] ?? 0);
        if (!in_array($ano, $anos, true)) {
            $ano = $anos[0] ?? (int)date('Y');
        }

        $top = $db->GetMany("
            SELECT TOP 5
                TRIM(pais) AS pais,
                COUNT(*)   AS total
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
              AND YEAR(data_fim) = :ano
              AND pais IS NOT NULL
              AND TRIM(pais) <> ''
            GROUP BY TRIM(pais)
            ORDER BY total DESC, pais ASC
        ", [':ano' => $ano]);

        $result_status = true;
        $result_data   = ['ano' => $ano, 'anos' => $anos, 'top' => $top ?: []];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar países mais lidos: ' . $e->getMessage();
    }
}
