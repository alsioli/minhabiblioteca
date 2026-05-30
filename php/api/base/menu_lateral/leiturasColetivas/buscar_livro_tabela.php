<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

// Whitelist de tabelas permitidas — impede SQL injection via nome de tabela
$TABELAS_PERMITIDAS = [
    'dbo.LeiturasSKEELO'        => '[Biblioteca].[dbo].[LeiturasSKEELO]',
    'dbo.LivrosBiblion'         => '[Biblioteca].[dbo].[LivrosBiblion]',
    'dbo.LivrosMEC'             => '[Biblioteca].[dbo].[LivrosMEC]',
    'dbo.LivrosAudible'         => '[Biblioteca].[dbo].[LivrosAudible]',
    'dbo.LivrosKindleUnlimited' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    'dbo.Livros'                => '[Biblioteca].[dbo].[Livros]',
];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod($TABELAS_PERMITIDAS);
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

function PostMethod(array $tabelasPermitidas) {
    global $result_status, $result_error, $result_data;

    $tabela = trim($_POST['tabela'] ?? '');
    $titulo = trim($_POST['titulo'] ?? '');

    if (empty($tabela) || empty($titulo)) {
        $result_error = 'Tabela e título são obrigatórios.';
        return;
    }

    if (!isset($tabelasPermitidas[$tabela])) {
        $result_error = 'Tabela não permitida.';
        return;
    }

    $tabelaSQL = $tabelasPermitidas[$tabela];

    $sql = "SELECT id, titulo, autor, paginas FROM {$tabelaSQL} WHERE titulo LIKE :titulo AND (status IS NULL OR status <> 'Lido') ORDER BY titulo ASC";

    try {
        $db = new DataBase();
        $resultado = $db->GetMany($sql, [':titulo' => '%' . $titulo . '%']);

        if (empty($resultado)) {
            $result_error = 'Nenhum livro encontrado.';
            return;
        }

        $result_status = true;
        $result_data   = $resultado;
    } catch (Exception $e) {
        $result_error = 'Erro ao buscar livro: ' . $e->getMessage();
    }
}
