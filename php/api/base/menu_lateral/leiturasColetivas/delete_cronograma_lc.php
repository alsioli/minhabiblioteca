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

    $id = trim($_POST['id'] ?? '');

    if (empty($id) || !is_numeric($id)) {
        $result_error = 'ID inválido.';
        return;
    }

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery(
            "DELETE FROM [Biblioteca].[dbo].[CronogramaLCs] WHERE id = :id",
            [':id' => (int) $id]
        );
        $result_status = true;
        $result_data   = ['message' => 'Registro excluído com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao excluir: ' . $e->getMessage();
    }
}
