<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[Resenhas] (
 *     id          INT IDENTITY(1,1) PRIMARY KEY,
 *     id_leitura  INT NOT NULL,
 *     nome_livro  NVARCHAR(255),
 *     autor       NVARCHAR(255),
 *     mes_leitura NVARCHAR(20),
 *     avaliacao   DECIMAL(3,1),
 *     resenha     VARCHAR(MAX),
 *     created_at  DATETIME DEFAULT GETDATE()
 * );
 */

include_once __DIR__ . "/../../../../../utils/function/database.php";

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

    $id_leitura  = trim($_POST['id_leitura']  ?? '');
    $nome_livro  = trim($_POST['nome_livro']  ?? '');
    $autor       = trim($_POST['autor']       ?? '');
    $mes_leitura = trim($_POST['mes_leitura'] ?? '');
    $avaliacao   = trim($_POST['avaliacao']   ?? '');
    $resenha     = trim($_POST['resenha']     ?? '');

    if (empty($id_leitura)) {
        $result_error = 'Selecione uma leitura.';
        return;
    }
    if (empty($resenha)) {
        $result_error = 'A resenha não pode estar em branco.';
        return;
    }

    try {
        $db = new DataBase();

        $existe = $db->GetOne(
            "SELECT TOP 1 id_leitura FROM Resenhas WHERE id_leitura = :id",
            [':id' => (int)$id_leitura]
        );

        if ($existe) {
            $db->ExecuteNonQuery(
                "UPDATE Resenhas SET resenhas = :resenha, avaliacao = :avaliacao WHERE id_leitura = :id",
                [
                    ':resenha'   => $resenha,
                    ':avaliacao' => $avaliacao !== '' ? (float)$avaliacao : null,
                    ':id'        => (int)$id_leitura,
                ]
            );
            $result_data = ['message' => 'Resenha atualizada com sucesso.'];
        } else {
            $db->ExecuteNonQuery(
                "INSERT INTO Resenhas (id_leitura, nome_livro, autor, mes_leitura, avaliacao, resenhas, created_at)
                 VALUES (:id, :nome, :autor, :mes, :avaliacao, :resenha, GETDATE())",
                [
                    ':id'       => (int)$id_leitura,
                    ':nome'     => $nome_livro  ?: null,
                    ':autor'    => $autor        ?: null,
                    ':mes'      => $mes_leitura  ?: null,
                    ':avaliacao'=> $avaliacao !== '' ? (float)$avaliacao : null,
                    ':resenha'  => $resenha,
                ]
            );
            $result_data = ['message' => 'Resenha salva com sucesso.'];
        }

        try {
            $db->ExecuteNonQuery(
                "UPDATE Leituras SET resenhas = 'sim' WHERE id = :id",
                [':id' => (int)$id_leitura]
            );
        } catch (Exception $ignored) {
            // Coluna resenhas pode não existir — não bloqueia o salvamento
        }

        $result_status = true;

    } catch (Exception $e) {
        $result_error = 'Erro ao salvar resenha: ' . $e->getMessage();
    }
}
