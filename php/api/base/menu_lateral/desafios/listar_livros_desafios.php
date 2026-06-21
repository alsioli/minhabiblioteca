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
        WITH base AS (
            SELECT
                d50.tematica,
                d50.titulo,
                MAX(l.autor) AS autor,
                'Lido'       AS status_leitura,
                MIN(l.data_fim) AS data_ordem
            FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
            INNER JOIN [Biblioteca].[dbo].[Leituras] l
                ON  l.titulo   = d50.titulo
                AND l.data_fim IS NOT NULL
            GROUP BY d50.tematica, d50.titulo

            UNION ALL

            SELECT
                d50.tematica,
                d50.titulo,
                MAX(l.autor)      AS autor,
                'Lendo'           AS status_leitura,
                MIN(l.data_inicio) AS data_ordem
            FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
            INNER JOIN [Biblioteca].[dbo].[Leituras] l
                ON  l.titulo   = d50.titulo
                AND l.data_fim IS NULL
            INNER JOIN [Biblioteca].[dbo].[LeiturasEmAndamento] lea
                ON  lea.id_leitura = l.id
            WHERE NOT EXISTS (
                SELECT 1 FROM [Biblioteca].[dbo].[Leituras] l2
                WHERE l2.titulo = d50.titulo AND l2.data_fim IS NOT NULL
            )
            GROUP BY d50.tematica, d50.titulo
        ),
        numerado AS (
            SELECT
                tematica,
                ROW_NUMBER() OVER (
                    PARTITION BY tematica
                    ORDER BY data_ordem ASC, titulo ASC
                ) AS sequencia,
                titulo,
                autor,
                status_leitura,
                CONVERT(VARCHAR(10), data_ordem, 103) AS data_referencia
            FROM base
        )
        SELECT tematica, sequencia, titulo, autor, status_leitura, data_referencia
        FROM numerado
        ORDER BY tematica ASC, sequencia ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar livros dos desafios: ' . $e->getMessage();
    }
}
