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

    // Livros mais novos da tabela Livros (por id DESC).
    // Exclui: epub/ebook (tipo_edicao), presente (natureza), tag (natureza).
    $sql = "SELECT TOP 7
            id, titulo, autor, natureza, tipo_edicao, data_compra
        FROM [Biblioteca].[dbo].[Livros]
        WHERE ISNULL(natureza, '') NOT IN ('Presente', 'Epub')
        ORDER BY id DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar adquiridos recentes: ' . $e->getMessage();
    }
}
