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

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $local = trim($_GET['local_leitura'] ?? '');

    if (empty($local)) {
        $result_error = 'Local de leitura é obrigatório.';
        return;
    }

    try {
        $db = new DataBase();

        $result_data = $db->GetMany(
            "SELECT id, titulo, autor, sexo_autor, pais AS nacionalidade, paginas, tema, mes
             FROM [Biblioteca].[dbo].[Leituras]
             WHERE ISNULL(local_leitura, 'Biblioteca') = :local
             ORDER BY titulo",
            [':local' => $local]
        );

        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao buscar leituras: ' . $e->getMessage();
    }
}
