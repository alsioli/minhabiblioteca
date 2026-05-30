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

    // Espera "YYYY-MM" vindo do input[type=month] do JS
    $mes = trim($_GET['mes'] ?? '');

    if (empty($mes) || !preg_match('/^\d{4}-\d{2}$/', $mes)) {
        $result_error = 'Parâmetro "mes" inválido (formato esperado: YYYY-MM).';
        return;
    }

    [$ano, $mes_num] = explode('-', $mes);

    $sql = "
        SELECT
            id,
            titulo,
            autor,
            natureza,
            tipo_midia,
            paginas,
            avaliacao,
            data_inicio,
            data_fim,
            DATEDIFF(day, data_inicio, data_fim) AS tempo_dias
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE data_fim IS NOT NULL
          AND YEAR(data_fim)  = :ano
          AND MONTH(data_fim) = :mes_num
        ORDER BY data_fim ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, [':ano' => (int)$ano, ':mes_num' => (int)$mes_num]);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar leituras do mês: ' . $e->getMessage();
    }
}
