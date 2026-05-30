<?php

/*
 * API: Cadastro em Quero_Ler_Logo
 *
 * DDL da tabela:
 * CREATE TABLE [Biblioteca].[dbo].[Quero_Ler_Logo] (
 *     id          INT IDENTITY(1,1) PRIMARY KEY,
 *     origem      NVARCHAR(100) NULL,
 *     titulo      NVARCHAR(500) NOT NULL,
 *     autor       NVARCHAR(300) NULL,
 *     paginas     INT NULL,
 *     tema        NVARCHAR(100) NULL,
 *     natureza    NVARCHAR(100) NULL,
 *     prioridade  NVARCHAR(10)  NULL,  -- Alta, Média, Baixa
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

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $titulo    = trim($_POST['titulo']    ?? '');
    $origem    = trim($_POST['origem']    ?? '');
    $autor     = trim($_POST['autor']     ?? '');
    $paginasRaw = trim($_POST['paginas']  ?? '');
    $tema      = trim($_POST['tema']      ?? '');
    $natureza  = trim($_POST['natureza']  ?? '');
    $prioridade = trim($_POST['prioridade'] ?? '');

    if (empty($titulo)) {
        $result_error = 'O título é obrigatório.';
        return;
    }

    $paginas = ($paginasRaw !== '' && is_numeric($paginasRaw)) ? (int)$paginasRaw : null;

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[Quero_Ler_Logo]
            (origem, titulo, autor, paginas, tema, natureza, prioridade)
        VALUES
            (:origem, :titulo, :autor, :paginas, :tema, :natureza, :prioridade)
    ";

    $params = [
        ':origem'     => $origem    !== '' ? $origem    : null,
        ':titulo'     => $titulo,
        ':autor'      => $autor     !== '' ? $autor     : null,
        ':paginas'    => $paginas,
        ':tema'       => $tema      !== '' ? $tema      : null,
        ':natureza'   => $natureza  !== '' ? $natureza  : null,
        ':prioridade' => $prioridade !== '' ? $prioridade : null,
    ];

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, $params);

        $result_status = true;
        $result_data   = ['message' => 'Livro adicionado à lista Quero Ler Logo com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao cadastrar: ' . $e->getMessage();
    }
}
