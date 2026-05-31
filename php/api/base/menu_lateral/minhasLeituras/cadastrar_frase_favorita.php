<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[FrasesFavoritas] (
 *     id          INT IDENTITY(1,1) PRIMARY KEY,
 *     id_leitura  INT,
 *     titulo      NVARCHAR(500),
 *     autor       NVARCHAR(300),
 *     frase       NVARCHAR(MAX) NOT NULL,
 *     dt_cadastro DATETIME DEFAULT GETDATE()
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

header('Content-Type: application/json; charset=utf-8');
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
    $tema             = trim($_POST['tema']              ?? '');
    $mes              = trim($_POST['mes']               ?? '');
    $capitulo         = trim($_POST['capitulo']          ?? '');
    $pagina_percentual = trim($_POST['pagina_percentual'] ?? '');
    $avaliacao_frase  = trim($_POST['avaliacao_frase']   ?? '');
    $frases           = trim($_POST['frases']            ?? '');

    if (empty($frases)) {
        $result_error = 'A frase não pode estar em branco.';
        return;
    }

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[FrasesFavoritas]
            (id_leitura, titulo, autor, tema, mes, capitulo, [pagina ou percentual], frases)
        VALUES
            (:id_leitura, :titulo, :autor, :tema, :mes, :capitulo, :pagina_percentual, :frases)
    ";

    $params = [
        ':id_leitura'        => $id_leitura !== '' ? (int)$id_leitura : null,
        ':titulo'            => $titulo           ?: null,
        ':autor'             => $autor            ?: null,
        ':tema'              => $tema             ?: null,
        ':mes'               => $mes              ?: null,
        ':capitulo'          => $capitulo         ?: null,
        ':pagina_percentual' => $pagina_percentual ?: null,
        ':frases'            => $frases,
    ];

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, $params);
        $result_status = true;
        $result_data   = ['message' => 'Frase cadastrada com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao salvar frase: ' . $e->getMessage();
    }
}
