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

    $dia    = (int)date('j');
    $mesRef = date('m/Y');

    $previsoes = [];
    if ($dia <= 10)        $previsoes[] = 'Começo do mês';
    if ($dia <= 20)        $previsoes[] = 'Depois do dia 10';
    if ($dia <= 20)        $previsoes[] = 'Antes do dia 20';
    if ($dia + 10 >= 20)   $previsoes[] = 'Final do mês';

    // Remove duplicatas preservando ordem
    $previsoes = array_values(array_unique($previsoes));

    if (empty($previsoes)) {
        $result_status = true;
        $result_data   = [];
        return;
    }

    // Monta placeholders para IN (:p0, :p1, ...)
    $placeholders = implode(', ', array_map(fn($i) => ":p{$i}", array_keys($previsoes)));

    $sql = "
        SELECT
            titulo, autor, origem, previsao_leitura
        FROM [Biblioteca].[dbo].[TBR_Mensal]
        WHERE mes_referencia = :mes
          AND previsao_leitura IN ({$placeholders})
        ORDER BY previsao_leitura
    ";

    $params = [':mes' => $mesRef];
    foreach ($previsoes as $i => $val) {
        $params[":p{$i}"] = $val;
    }

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar previsões do mês: ' . $e->getMessage();
    }
}
