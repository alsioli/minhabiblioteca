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
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $id          = trim($_POST['id']          ?? '');
    $tematica    = trim($_POST['tematica']    ?? '');
    $descricao   = trim($_POST['descricao']   ?? '');
    $ano         = trim($_POST['ano']         ?? '');
    $meta_livros = trim($_POST['meta_livros'] ?? '');
    $situacao    = trim($_POST['situacao']    ?? '');
    $data_inicio = trim($_POST['data_inicio'] ?? '');
    $data_fim    = trim($_POST['data_fim']    ?? '');

    if (empty($id) || !is_numeric($id)) {
        $result_error = 'ID inválido.';
        return;
    }

    if (empty($tematica)) {
        $result_error = 'A temática do desafio é obrigatória.';
        return;
    }

    $situacoesValidas = ['Em andamento', 'Concluído', 'Pausado'];
    if (!in_array($situacao, $situacoesValidas)) {
        $situacao = 'Em andamento';
    }

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery("
            UPDATE [Biblioteca].[dbo].[Desafios]
            SET tematica    = :p0,
                descricao   = :p1,
                ano         = :p2,
                meta_livros = :p3,
                situacao    = :p4,
                data_inicio = :p5,
                data_fim    = :p6
            WHERE id = :p7
        ", [
            ':p0' => $tematica,
            ':p1' => $descricao   !== '' ? $descricao   : null,
            ':p2' => $ano         !== '' ? (int)$ano    : null,
            ':p3' => $meta_livros !== '' ? (int)$meta_livros : null,
            ':p4' => $situacao,
            ':p5' => $data_inicio !== '' ? $data_inicio : null,
            ':p6' => $data_fim    !== '' ? $data_fim    : null,
            ':p7' => (int)$id,
        ]);

        $result_status = true;
        $result_data   = ['message' => 'Desafio atualizado com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar desafio: ' . $e->getMessage();
    }
}
