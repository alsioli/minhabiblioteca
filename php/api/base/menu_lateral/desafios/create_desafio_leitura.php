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

    $id_leitura       = trim($_POST['id_leitura']       ?? '');
    $local_leitura    = trim($_POST['local_leitura']    ?? '');
    $nome_desafio     = trim($_POST['nome_desafio']     ?? '');
    $sequencia        = trim($_POST['sequencia']        ?? '');
    $natureza_desafio = trim($_POST['natureza_desafio'] ?? '');

    if (empty($id_leitura) || !is_numeric($id_leitura)) {
        $result_error = 'Selecione um livro válido.';
        return;
    }
    if (empty($nome_desafio)) {
        $result_error = 'Selecione o nome do desafio.';
        return;
    }
    if (empty($sequencia) || !is_numeric($sequencia) || (int)$sequencia < 1 || (int)$sequencia > 60) {
        $result_error = 'Sequência deve ser um número entre 1 e 60.';
        return;
    }

    try {
        $db = new DataBase();

        // Verifica duplicata: mesmo livro no mesmo desafio
        $jaExiste = $db->GetOne(
            "SELECT TOP 1 Id FROM [Biblioteca].[dbo].[DesafiosLeitura]
             WHERE IdLeitura = :id AND NomeDesafio = :desafio",
            [':id' => (int)$id_leitura, ':desafio' => $nome_desafio]
        );
        if ($jaExiste) {
            $result_error = 'Este livro já está cadastrado neste desafio.';
            return;
        }

        $db->ExecuteNonQuery(
            "INSERT INTO [Biblioteca].[dbo].[DesafiosLeitura]
                 (IdLeitura, LocalLeitura, NomeDesafio, Sequencia, NaturezaDesafio, DataCadastro)
             VALUES (:p0, :p1, :p2, :p3, :p4, GETDATE())",
            [
                ':p0' => (int)$id_leitura,
                ':p1' => $local_leitura !== '' ? $local_leitura : null,
                ':p2' => $nome_desafio,
                ':p3' => (int)$sequencia,
                ':p4' => $natureza_desafio !== '' ? $natureza_desafio : null,
            ]
        );

        $result_status = true;
        $result_data   = ['message' => 'Livro incluído no desafio com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao incluir livro no desafio: ' . $e->getMessage();
    }
}
