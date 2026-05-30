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

    $sqlFiltrado = "
        SELECT TOP 10
            id, titulo, autor, natureza, data_compra
        FROM [Biblioteca].[dbo].[Livros]
        WHERE natureza IN ('Estante', '1a. prateleira', 'Compra Kindle', 'Tag')
        ORDER BY id DESC
    ";

    $sqlFallback = "
        SELECT TOP 10
            id, titulo, autor, natureza, data_compra
        FROM [Biblioteca].[dbo].[Livros]
        ORDER BY id DESC
    ";

    try {
        $db   = new DataBase();
        $rows = $db->GetMany($sqlFiltrado);

        if (empty($rows)) {
            $rows = $db->GetMany($sqlFallback);
        }

        $result_data   = $rows;
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar adquiridos recentes: ' . $e->getMessage();
    }
}
