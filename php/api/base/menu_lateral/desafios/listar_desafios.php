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

    $apenasAtivos = isset($_GET['ativos']) ? (int)$_GET['ativos'] : 0;

    $sql = "
        SELECT
            d.id,
            d.tematica,
            d.descricao,
            d.ano,
            d.meta_livros,
            d.situacao,
            d.data_inicio,
            d.data_fim,
            d.criado_em,
            d.bAtivo,
            -- Conta lidos via Desafio50Antes50 (pelo Leituras)
            COALESCE((
                SELECT COUNT(DISTINCT d50.titulo)
                FROM [Biblioteca].[dbo].[Desafio50Antes50] d50
                WHERE d50.tematica = d.tematica
                  AND EXISTS (
                      SELECT 1 FROM [Biblioteca].[dbo].[Leituras] lx
                      WHERE lx.titulo = d50.titulo
                        AND lx.data_fim IS NOT NULL
                        AND (d.ano IS NULL OR YEAR(lx.data_fim) = d.ano)
                  )
            ), 0)
            +
            -- Conta lidos via DesafioPrompts (pelo Leituras ou pelo status da tabela)
            COALESCE((
                SELECT COUNT(DISTINCT dp.titulo)
                FROM [Biblioteca].[dbo].[DesafioPrompts] dp
                WHERE dp.tematica = d.tematica
                  AND (
                      EXISTS (
                          SELECT 1 FROM [Biblioteca].[dbo].[Leituras] lx
                          WHERE lx.titulo = dp.titulo
                            AND lx.data_fim IS NOT NULL
                      )
                      OR dp.status = 'Lido'
                  )
            ), 0)
            AS livros_lidos
        FROM [Biblioteca].[dbo].[ListaDesafios] d
        WHERE (:filtroAtivo = 0 OR d.bAtivo = 1)
        ORDER BY
            CASE d.situacao
                WHEN 'Em andamento' THEN 1
                WHEN 'Pausado'      THEN 2
                ELSE 3
            END,
            d.ano DESC,
            d.tematica ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, [':filtroAtivo' => $apenasAtivos]);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar desafios: ' . $e->getMessage();
    }
}
