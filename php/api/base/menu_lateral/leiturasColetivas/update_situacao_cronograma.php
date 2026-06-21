<?php
/**
 * POST: atualiza a coluna situacao no CronogramaLCs.
 * Aceita: id (preciso) OU titulo (atualiza todas as entradas com aquele titulo).
 * Body params: id | titulo, situacao
 */

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

    $id       = trim($_POST['id']       ?? '');
    $titulo   = trim($_POST['titulo']   ?? '');
    $situacao = trim($_POST['situacao'] ?? '');

    $validos = ['Lendo', 'Lido', 'A começar', 'Encerrado'];
    if (!in_array($situacao, $validos)) {
        $result_error = 'Situacao invalida: ' . $situacao;
        return;
    }

    if (empty($id) && empty($titulo)) {
        $result_error = 'Informe id ou titulo.';
        return;
    }

    try {
        $db = new DataBase();

        if (!empty($id)) {
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                SET situacao = :situacao
                WHERE id = :id
            ", [':situacao' => $situacao, ':id' => (int)$id]);
        } else {
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                SET situacao = :situacao
                WHERE titulo = :titulo
                  AND situacao <> :situacao
            ", [':situacao' => $situacao, ':titulo' => $titulo]);
        }

        $result_status = true;
        $result_data   = ['message' => 'Situacao atualizada para ' . $situacao];
    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar situacao: ' . $e->getMessage();
    }
}
