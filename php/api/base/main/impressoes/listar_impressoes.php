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

    $busca     = trim($_GET['busca']     ?? '');
    $impressao = trim($_GET['impressao'] ?? '');

    $params = [];
    $where  = [];

    if ($busca !== '') {
        $where[]          = "(titulo LIKE :busca OR autor LIKE :busca)";
        $params[':busca'] = '%' . $busca . '%';
    }

    if ($impressao !== '') {
        $where[]              = "observacoes LIKE :impressao";
        $params[':impressao'] = '%' . $impressao . '%';
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "
        SELECT
            id,
            id_leitura,
            titulo,
            autor,
            CONVERT(VARCHAR(10), data_inclusao, 103) AS data_inclusao,
            [capítulo]                AS capitulo,
            [página ou  percentual]   AS pagina_percentual,
            observacoes
        FROM [Biblioteca].[dbo].[ImpressoesLeituras]
        $whereClause
        ORDER BY titulo, data_inclusao DESC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar impressões: ' . $e->getMessage();
    }
}
