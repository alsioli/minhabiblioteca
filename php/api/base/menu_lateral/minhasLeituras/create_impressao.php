<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[ImpressoesLeituras] (
 *     id            INT IDENTITY(1,1) PRIMARY KEY,
 *     id_leitura    INT NOT NULL,
 *     titulo        NVARCHAR(500),
 *     autor         NVARCHAR(300),
 *     data_inclusao DATETIME DEFAULT GETDATE(),
 *     observacoes   NVARCHAR(MAX)
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
]);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $id_leitura       = trim($_POST['id_leitura']        ?? '');
    $titulo           = trim($_POST['titulo']            ?? '');
    $autor            = trim($_POST['autor']             ?? '');
    $capitulo         = trim($_POST['capitulo']          ?? '');
    $pagina_percentual = trim($_POST['pagina_percentual'] ?? '');
    $observacoes      = trim($_POST['observacoes']       ?? '');

    if (empty($id_leitura)) {
        $result_error = 'Selecione uma leitura.';
        return;
    }

    if (empty($observacoes)) {
        $result_error = 'Observações não podem estar em branco.';
        return;
    }

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[ImpressoesLeituras]
            (id_leitura, titulo, autor, data_inclusao, [capítulo], [página ou  percentual], observacoes)
        VALUES
            (:p0, :p1, :p2, GETDATE(), :p3, :p4, :p5)
    ";

    $params = [
        ':p0' => (int)$id_leitura,
        ':p1' => $titulo            ?: null,
        ':p2' => $autor             ?: null,
        ':p3' => $capitulo          ?: null,
        ':p4' => $pagina_percentual ?: null,
        ':p5' => $observacoes,
    ];

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, $params);
        $result_status = true;
        $result_data   = ['message' => 'Impressão registrada com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao salvar impressão: ' . $e->getMessage();
    }
}
