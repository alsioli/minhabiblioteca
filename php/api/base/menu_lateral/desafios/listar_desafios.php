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
        SELECT
            d.id,
            d.tematica,
            d.descricao,
            d.ano,
            d.meta_livros,
            d.situacao,
            d.data_inicio,
            d.data_fim,
            d.dt_cadastro,
            COUNT(l.id) AS livros_lidos
        FROM [Biblioteca].[dbo].[Desafios] d
        LEFT JOIN [Biblioteca].[dbo].[Leituras] l
            ON l.natureza = d.tematica
            AND l.data_fim IS NOT NULL
        GROUP BY
            d.id, d.tematica, d.descricao, d.ano,
            d.meta_livros, d.situacao, d.data_inicio,
            d.data_fim, d.dt_cadastro
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
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar desafios: ' . $e->getMessage();
    }
}
