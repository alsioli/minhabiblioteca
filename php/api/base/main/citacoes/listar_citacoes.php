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

    $busca   = trim($_GET['busca']   ?? '');
    $citacao = trim($_GET['citacao'] ?? '');

    $params = [];
    $where  = [];

    if ($busca !== '') {
        $where[]          = "(titulo LIKE :busca OR autor LIKE :busca)";
        $params[':busca'] = '%' . $busca . '%';
    }

    if ($citacao !== '') {
        $where[]            = "frases LIKE :citacao";
        $params[':citacao'] = '%' . $citacao . '%';
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "
        SELECT
            id,
            titulo,
            autor,
            frases,
            capitulo,
            [pagina ou percentual]  AS pagina_percentual,
            avaliacao_frase,
            tema,
            mes
        FROM [Biblioteca].[dbo].[FrasesFavoritas]
        $whereClause
        ORDER BY titulo, id DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar citações: ' . $e->getMessage();
    }
}
