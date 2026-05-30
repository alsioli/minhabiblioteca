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

    $anoAtual    = (int)date('Y');
    $mesAtual    = (int)date('n');
    $anoAnterior = $anoAtual - 1;

    try {
        $db = new DataBase();

        // ── Contagem a partir da tabela Leituras (data_fim) ────────
        $sqlLeituras = "
            SELECT
                SUM(CASE WHEN YEAR(data_fim) = :anoAtual    THEN 1 ELSE 0 END) AS lidos_ano_atual,
                SUM(CASE WHEN YEAR(data_fim) = :anoAnterior THEN 1 ELSE 0 END) AS lidos_ano_anterior,
                SUM(CASE WHEN YEAR(data_fim) = :anoAnterior2
                          AND MONTH(data_fim) <= :mesAtual   THEN 1 ELSE 0 END) AS lidos_ano_ant_ate_mes
            FROM [Biblioteca].[dbo].[Leituras]
            WHERE data_fim IS NOT NULL
        ";

        $row = $db->GetOne($sqlLeituras, [
            ':anoAtual'    => $anoAtual,
            ':anoAnterior' => $anoAnterior,
            ':anoAnterior2'=> $anoAnterior,
            ':mesAtual'    => $mesAtual,
        ]);

        // ── Fallback: tabela Livros (mes_leitura) ──────────────────
        $padAnoAtual    = '%/' . $anoAtual;
        $padAnoAnterior = '%/' . $anoAnterior;

        $sqlLivros = "
            SELECT
                SUM(CASE WHEN mes_leitura LIKE :pAnoAtual    THEN 1 ELSE 0 END) AS lidos_ano_atual,
                SUM(CASE WHEN mes_leitura LIKE :pAnoAnterior THEN 1 ELSE 0 END) AS lidos_ano_anterior
            FROM [Biblioteca].[dbo].[Livros]
            WHERE status = 'Lido'
              AND mes_leitura IS NOT NULL
        ";

        $rowLivros = $db->GetOne($sqlLivros, [
            ':pAnoAtual'    => $padAnoAtual,
            ':pAnoAnterior' => $padAnoAnterior,
        ]);

        // Prefere Leituras; usa Livros como complemento se Leituras retornar 0
        $lidosAnoAtual   = max((int)($row['lidos_ano_atual']         ?? 0),
                               (int)($rowLivros['lidos_ano_atual']   ?? 0));
        $lidosAnoAnt     = max((int)($row['lidos_ano_anterior']      ?? 0),
                               (int)($rowLivros['lidos_ano_anterior'] ?? 0));
        $lidosAnoAntMes  = (int)($row['lidos_ano_ant_ate_mes'] ?? 0);

        $mesFmt = str_pad($mesAtual, 2, '0', STR_PAD_LEFT) . '/' . $anoAnterior;

        $result_status = true;
        $result_data   = [
            'ano_atual'          => $anoAtual,
            'ano_anterior'       => $anoAnterior,
            'mes_atual_fmt'      => date('m/Y'),
            'mes_ref_fmt'        => $mesFmt,
            'lidos_ano_atual'    => $lidosAnoAtual,
            'lidos_ano_anterior' => $lidosAnoAnt,
            'lidos_ano_ant_mes'  => $lidosAnoAntMes,
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar contadores: ' . $e->getMessage();
    }
}
