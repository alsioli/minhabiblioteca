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
        WITH lt AS (

            -- ── Leituras agregadas por título ───────────────────────────
            SELECT
                l.titulo,
                MAX(l.autor)    AS autor,
                MIN(l.data_fim) AS data_fim   -- MIN ignora NULL: 1ª conclusão
            FROM [Biblioteca].[dbo].[Leituras] l
            GROUP BY l.titulo

        ),
        base AS (

            -- ── Desafio50Antes50: todos os livros da lista ──────────────
            SELECT
                'D50'                              AS origem,
                d50.tematica,
                d50.titulo,
                COALESCE(lt.autor, d50.autor)      AS autor,
                CASE
                    WHEN lt.data_fim IS NOT NULL THEN 'Lido'
                    WHEN lt.titulo   IS NOT NULL THEN 'Lendo'
                    ELSE ISNULL(d50.status, 'Não Lido')
                END                                AS status_leitura,
                lt.data_fim                        AS data_ordem,
                d50.id                             AS seq_origem,
                d50.categoria,
                d50.tema,
                d50.paginas
            FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
            LEFT JOIN lt ON lt.titulo = d50.titulo

            UNION ALL

            -- ── DesafioPrompts: todas as opções de cada prompt ──────────
            SELECT
                'PROMPT'                           AS origem,
                dp.tematica,
                dp.titulo,
                COALESCE(lt.autor, dp.autor)       AS autor,
                CASE
                    WHEN lt.data_fim IS NOT NULL THEN 'Lido'
                    WHEN lt.titulo   IS NOT NULL THEN 'Lendo'
                    ELSE ISNULL(dp.status, 'Não Lido')
                END                                AS status_leitura,
                lt.data_fim                        AS data_ordem,
                dp.id                              AS seq_origem,
                dp.categoria,
                dp.tema,
                dp.paginas
            FROM [Biblioteca].[dbo].[DesafioPrompts] dp
            LEFT JOIN lt ON lt.titulo = dp.titulo

        ),
        marcado AS (
            SELECT
                b.*,
                SUM(CASE WHEN b.status_leitura = 'Lido' THEN 1 ELSE 0 END)
                    OVER (PARTITION BY b.tematica, b.categoria) AS lidos_categoria
            FROM base b
        ),
        filtrado AS (
            -- Desafio50Antes50 mostra sempre a lista completa.
            -- DesafioPrompts: se o prompt (categoria) já tem um livro lido,
            -- esconde as demais opções daquele prompt.
            SELECT *
            FROM marcado
            WHERE origem = 'D50'
               OR lidos_categoria = 0
               OR status_leitura = 'Lido'
        )
        SELECT
            origem,
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
            tema,
            paginas,
            CASE WHEN data_ordem IS NOT NULL
                 THEN CONVERT(VARCHAR(10), data_ordem, 103)
                 ELSE NULL
            END AS data_referencia
        FROM filtrado
        ORDER BY tematica ASC, sequencia ASC;
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar livros dos desafios: ' . $e->getMessage();
    }
}
