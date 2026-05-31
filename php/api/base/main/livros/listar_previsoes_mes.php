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

    $dia         = (int)date('j');
    $mesAtual    = date('m/Y');                         // "MM/YYYY"
    $mesProximo  = date('m/Y', strtotime('+1 month'));  // próximo mês

    // Categorias do mês atual que estão dentro da janela "hoje + 10 dias"
    $prevAtual = [];
    if ($dia <= 10)  $prevAtual[] = 'Começo do mês';
    if ($dia <= 20)  $prevAtual[] = 'Depois do dia 10';
    if ($dia <= 20)  $prevAtual[] = 'Antes do dia 20';
    if ($dia + 10 >= 20) $prevAtual[] = 'Final do mês';

    // Se estamos nos últimos 10 dias do mês, incluir "Começo do mês" do próximo mês
    $diasNoMes   = (int)date('t');   // total de dias do mês atual
    $incluirProx = ($dia + 10 > $diasNoMes);

    $prevAtual = array_values(array_unique($prevAtual));

    $params = [];
    $condicoes = [];

    // Condição do mês atual
    if (!empty($prevAtual)) {
        $placeholders = implode(', ', array_map(fn($i) => ":pa{$i}", array_keys($prevAtual)));
        $condicoes[] = "(mes_referencia = :mesAtual AND previsao_leitura IN ({$placeholders}))";
        $params[':mesAtual'] = $mesAtual;
        foreach ($prevAtual as $i => $val) {
            $params[":pa{$i}"] = $val;
        }
    }

    // Condição do próximo mês (apenas "Começo do mês")
    if ($incluirProx) {
        $condicoes[] = "(mes_referencia = :mesProximo AND previsao_leitura = 'Começo do mês')";
        $params[':mesProximo'] = $mesProximo;
    }

    if (empty($condicoes)) {
        $result_status = true;
        $result_data   = [];
        return;
    }

    $where = implode(' OR ', $condicoes);

    $sql = "
        SELECT
            titulo, autor, origem, mes_referencia, previsao_leitura
        FROM [Biblioteca].[dbo].[TBR_Mensal]
        WHERE {$where}
        ORDER BY
            mes_referencia ASC,
            CASE previsao_leitura
                WHEN 'Começo do mês'    THEN 1
                WHEN 'Depois do dia 10' THEN 2
                WHEN 'Antes do dia 20'  THEN 3
                ELSE 4
            END
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar previsões do mês: ' . $e->getMessage();
    }
}
