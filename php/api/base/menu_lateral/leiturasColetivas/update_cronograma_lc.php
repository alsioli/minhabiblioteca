<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
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

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $data = $_POST;

    foreach (['id', 'titulo', 'data_final'] as $campo) {
        if (empty($data[$campo])) {
            $result_error = "O campo $campo é obrigatório.";
            return;
        }
    }

    $sql = "
        UPDATE [Biblioteca].[dbo].[CronogramaLCs]
        SET titulo = :titulo, data_final = :data_final
        WHERE id = :id
    ";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, [
            ':titulo'     => trim($data['titulo']),
            ':data_final' => $data['data_final'],
            ':id'         => (int) $data['id'],
        ]);

        $result_status = true;
        $result_data   = ['message' => 'Registro atualizado com sucesso'];
    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar: ' . $e->getMessage();
    }
}
