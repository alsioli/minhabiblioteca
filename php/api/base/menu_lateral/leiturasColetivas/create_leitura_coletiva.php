<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error = null;
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // GetMethod();
        // break;
    case 'POST':
        PostMethod();
        break;
    case 'PUT':
        http_response_code(501);
        $result_error = 'PUT is not implemented';
        break;
    case 'DELETE':
        http_response_code(501);
        $result_error = 'DELETE is not implemented';
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
echo json_encode($response);

function PostMethod() {
    
    global $result_status, $result_error, $result_data;

    $data = $_POST;

    $required = ['nome_lc', 'participando'];
    foreach ($required as $campo) {
        if (!isset($data[$campo]) || trim($data[$campo]) === '') {
            $result_error = "O campo $campo é obrigatório.";
            return;
        }
    }

    $map = [
        'nome_lc'     => 'nome_lc',
        'participando'=> 'participando',
        'natureza'    => 'natureza',
        'genero'      => 'genero',
        'grupo'       => 'grupo'
    ];

    $cols = [];
    $vals = [];
    $params = [];

    foreach ($map as $form => $col) {
        if (isset($data[$form])) {
            $cols[] = "[$col]";
            $vals[] = ":$col";
            $params[":$col"] = $data[$form];
        }
    }

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[CadastroLeiturasColetivas]
        (" . implode(',', $cols) . ", created_at)
        VALUES (" . implode(',', $vals) . ", GETDATE())
    ";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, $params);

        $result_status = true;
        $result_data = ['message' => 'Leitura coletiva cadastrada com sucesso'];

    } catch (Exception $e) {
        $result_error = 'Erro ao cadastrar: ' . $e->getMessage();
    }
}
