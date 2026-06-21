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

    // Constrói MM/YYYY sem depender da cultura do servidor (FORMAT pode trocar '/' por '.' em pt-BR)
    $mesAtual = date('m') . '/' . date('Y');

    $sql = "
        SELECT
            t.titulo,
            ISNULL(NULLIF(t.autor,  ''), l.autor)   AS autor,
            t.origem,
            t.previsao_leitura,
            ISNULL(l.tipo_edicao, '')                AS tipo_edicao,
            ISNULL(l.paginas,     0)                 AS paginas,
            ISNULL(l.status,      '')                AS status
        FROM [Biblioteca].[dbo].[TBR_Mensal] t
        OUTER APPLY (
            SELECT TOP 1 autor, tipo_edicao, paginas, status
            FROM [Biblioteca].[dbo].[Livros]
            WHERE LOWER(LTRIM(RTRIM(titulo))) = LOWER(LTRIM(RTRIM(t.titulo)))
        ) l
        WHERE t.mes_referencia = :mes
        ORDER BY
            CASE t.previsao_leitura
                WHEN 'Começo do mês'    THEN 1
                WHEN 'Depois do dia 10' THEN 2
                WHEN 'Antes do dia 20'  THEN 3
                ELSE 4
            END
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, [':mes' => $mesAtual]);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar TBR em breve: ' . $e->getMessage();
    }
}
