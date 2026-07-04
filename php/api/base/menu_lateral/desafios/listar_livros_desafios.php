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

            -- ── Desafio50Antes50: Lidos (confirmado em Leituras) ─────────
            SELECT
                d50.tematica,
                d50.titulo,
                MAX(l.autor)      AS autor,
                'Lido'            AS status_leitura,
                MIN(l.data_fim)   AS data_ordem,
                CAST(NULL AS INT) AS seq_origem,
                MAX(d50.categoria) AS categoria
            FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
            INNER JOIN [Biblioteca].[dbo].[Leituras] l
                ON  l.titulo   = d50.titulo
                AND l.data_fim IS NOT NULL
            GROUP BY d50.tematica, d50.titulo

            UNION ALL

            -- ── Desafio50Antes50: não iniciados (usa status da própria tabela)
            SELECT
                d50.tematica,
                d50.titulo,
                d50.autor                      AS autor,
                ISNULL(d50.status, 'Para Ler') AS status_leitura,
                NULL                           AS data_ordem,
                CAST(NULL AS INT)  AS seq_origem,
                d50.categoria     AS categoria
            FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
            WHERE NOT EXISTS (
                SELECT 1 FROM [Biblioteca].[dbo].[Leituras] l
                WHERE l.titulo = d50.titulo
            )

            UNION ALL

            -- ── DesafioPrompts: Lidos (confirmado em Leituras) ──────────
            SELECT
                dp.tematica,
                dp.titulo,
                MAX(l.autor)      AS autor,
                'Lido'            AS status_leitura,
                MIN(l.data_fim)   AS data_ordem,
                dp.id             AS seq_origem,
                MAX(dp.categoria) AS categoria
            FROM [Biblioteca].[dbo].[DesafioPrompts] dp
            INNER JOIN [Biblioteca].[dbo].[Leituras] l
                ON  l.titulo   = dp.titulo
                AND l.data_fim IS NOT NULL
            GROUP BY dp.tematica, dp.titulo, dp.id

            UNION ALL

            -- ── DesafioPrompts: não iniciados (usa status da própria tabela)
            SELECT
                dp.tematica,
                dp.titulo,
                dp.autor                       AS autor,
                ISNULL(dp.status, 'Para Ler')  AS status_leitura,
                NULL                           AS data_ordem,
                dp.id                          AS seq_origem,
                dp.categoria                   AS categoria
            FROM [Biblioteca].[dbo].[DesafioPrompts] dp
            WHERE NOT EXISTS (
                SELECT 1 FROM [Biblioteca].[dbo].[Leituras] l
                WHERE l.titulo = dp.titulo
            )

        ),
        numerado AS (
            SELECT
                tematica,
                ROW_NUMBER() OVER (
                    PARTITION BY tematica
                    ORDER BY
                        CASE WHEN data_ordem IS NULL THEN 1 ELSE 0 END,
                        data_ordem  ASC,
                        seq_origem  ASC,
                        titulo      ASC
                ) AS sequencia,
                titulo,
                autor,
                status_leitura,
                categoria,
                CASE WHEN data_ordem IS NOT NULL
                     THEN CONVERT(VARCHAR(10), data_ordem, 103)
                     ELSE NULL
                END AS data_referencia
            FROM base
        )
        SELECT tematica, sequencia, titulo, autor, status_leitura, categoria, data_referencia
        FROM numerado
        WHERE status_leitura = 'Lido'
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
