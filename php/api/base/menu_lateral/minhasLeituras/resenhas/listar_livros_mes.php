<?php

include_once __DIR__ . "/../../../../../utils/function/database.php";

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

    $mes = trim($_GET['mes'] ?? '');

    if (empty($mes) || !preg_match('/^\d{2}\/\d{4}$/', $mes)) {
        $result_error = 'Mês não informado ou inválido (formato esperado: MM/yyyy).';
        return;
    }

    [$mm, $yyyy] = explode('/', $mes);
    $mes_num = (int)$mm;
    $ano     = (int)$yyyy;


    var_dump($ano . ' - ' . $mes_num);
    die();

    
    $sql = "
        SELECT id, titulo, autor, avaliacao
        FROM Leituras
        WHERE data_fim IS NOT NULL
          AND YEAR(data_fim)  = $ano  
          AND MONTH(data_fim) = $mes_num
          AND NOT EXISTS (
              SELECT 1 FROM Resenhas r WHERE r.id_leitura = Leituras.id
          )
        ORDER BY titulo
    ";

    try {
        $db   = new DataBase();
        $rows = $db->GetMany($sql);

        $result_status = true;
        $result_data   = $rows;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar livros: ' . $e->getMessage();
    }
}
