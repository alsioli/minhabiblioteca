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
]);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    // Unifica desafios da tabela legada Desafio50Antes50 e da nova tabela Desafios
    $sql = "
        SELECT DISTINCT tematica FROM (
            SELECT tematica FROM [Biblioteca].[dbo].[Desafio50Antes50]
            WHERE tematica IS NOT NULL AND tematica <> ''
            UNION
            SELECT tematica FROM [Biblioteca].[dbo].[Desafios]
            WHERE tematica IS NOT NULL AND tematica <> ''
        ) AS t
        ORDER BY tematica ASC
    ";

    try {
        $db = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar desafios: ' . $e->getMessage();
    }
}
