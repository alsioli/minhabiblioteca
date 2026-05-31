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

    // Livros não lidos mais antigos da tabela Livros.
    // Exclui: Lido, Lendo, Não quero ler.
    // Mostra os 5 com menor id (mais antigos).
    $sql = "
        SELECT TOP 5
            id, titulo, autor, paginas, status
        FROM [Biblioteca].[dbo].[Livros]
        WHERE status NOT IN ('Lido', 'Lendo', 'Não quero ler')
        ORDER BY id ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar livros não lidos antigos: ' . $e->getMessage();
    }
}
