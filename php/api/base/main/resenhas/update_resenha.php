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

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $id_leitura = trim($_POST['id_leitura'] ?? '');
    $resenha    = trim($_POST['resenha']    ?? '');

    if ($id_leitura === '' || !ctype_digit($id_leitura)) {
        $result_error = 'Leitura inválida.';
        return;
    }
    if ($resenha === '') {
        $result_error = 'A resenha não pode estar em branco.';
        return;
    }

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery(
            "UPDATE [Biblioteca].[dbo].[Resenhas] SET resenhas = :resenha WHERE id_leitura = :id",
            [
                ':resenha' => $resenha,
                ':id'      => (int)$id_leitura,
            ]
        );
        $result_data   = ['message' => 'Resenha atualizada com sucesso.'];
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar resenha: ' . $e->getMessage();
    }
}
