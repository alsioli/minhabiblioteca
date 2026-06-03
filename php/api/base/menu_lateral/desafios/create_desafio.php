<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[Desafios] (
 *     id          INT IDENTITY(1,1) PRIMARY KEY,
 *     tematica    NVARCHAR(200) NOT NULL,
 *     descricao   NVARCHAR(MAX) NULL,
 *     ano         INT           NULL,
 *     meta_livros INT           NULL,
 *     situacao    NVARCHAR(50)  NULL DEFAULT 'Em andamento',
 *     data_inicio DATE          NULL,
 *     data_fim    DATE          NULL,
 *     dt_cadastro DATETIME      DEFAULT GETDATE()
 * );
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

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $tematica    = trim($_POST['tematica']    ?? '');
    $descricao   = trim($_POST['descricao']   ?? '');
    $ano         = trim($_POST['ano']         ?? '');
    $meta_livros = trim($_POST['meta_livros'] ?? '');
    $situacao    = trim($_POST['situacao']    ?? 'Em andamento');
    $data_inicio = trim($_POST['data_inicio'] ?? '');
    $data_fim    = trim($_POST['data_fim']    ?? '');

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
            INSERT INTO [Biblioteca].[dbo].[ListaDesafios]
                (tematica, descricao, ano, meta_livros, situacao, data_inicio, data_fim, bAtivo)
            VALUES
                (:p0, :p1, :p2, :p3, :p4, :p5, :p6, 1)
        ", [
            ':p0' => $tematica,
            ':p1' => $descricao  !== '' ? $descricao  : null,
            ':p2' => $ano        !== '' ? (int)$ano   : null,
            ':p3' => $meta_livros !== '' ? (int)$meta_livros : null,
            ':p4' => $situacao,
            ':p5' => $data_inicio !== '' ? $data_inicio : null,
            ':p6' => $data_fim    !== '' ? $data_fim    : null,
        ]);

        $result_status = true;
        $result_data   = ['message' => 'Desafio cadastrado com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao cadastrar desafio: ' . $e->getMessage();
    }
}
