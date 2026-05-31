<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

// Whitelist expandida — cobre múltiplos formatos possíveis de vTabelaVinculada
$TABELAS_PERMITIDAS = [
    // ── Livros ────────────────────────────────────────────────────
    'dbo.Livros'                    => '[Biblioteca].[dbo].[Livros]',
    'Livros'                        => '[Biblioteca].[dbo].[Livros]',
    '[Biblioteca].[dbo].[Livros]'   => '[Biblioteca].[dbo].[Livros]',

    // ── Skeelo ────────────────────────────────────────────────────
    'dbo.LeiturasSKEELO'                    => '[Biblioteca].[dbo].[LeiturasSKEELO]',
    'LeiturasSKEELO'                        => '[Biblioteca].[dbo].[LeiturasSKEELO]',
    '[Biblioteca].[dbo].[LeiturasSKEELO]'   => '[Biblioteca].[dbo].[LeiturasSKEELO]',

    // ── Biblion ───────────────────────────────────────────────────
    'dbo.LivrosBiblion'                     => '[Biblioteca].[dbo].[LivrosBiblion]',
    'LivrosBiblion'                         => '[Biblioteca].[dbo].[LivrosBiblion]',
    '[Biblioteca].[dbo].[LivrosBiblion]'    => '[Biblioteca].[dbo].[LivrosBiblion]',

    // ── MEC ───────────────────────────────────────────────────────
    'dbo.LivrosMEC'                         => '[Biblioteca].[dbo].[LivrosMEC]',
    'LivrosMEC'                             => '[Biblioteca].[dbo].[LivrosMEC]',
    '[Biblioteca].[dbo].[LivrosMEC]'        => '[Biblioteca].[dbo].[LivrosMEC]',

    // ── Audible ───────────────────────────────────────────────────
    'dbo.LivrosAudible'                     => '[Biblioteca].[dbo].[LivrosAudible]',
    'LivrosAudible'                         => '[Biblioteca].[dbo].[LivrosAudible]',
    '[Biblioteca].[dbo].[LivrosAudible]'    => '[Biblioteca].[dbo].[LivrosAudible]',

    // ── Kindle Unlimited ─────────────────────────────────────────
    'dbo.LivrosKindleUnlimited'                     => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    'LivrosKindleUnlimited'                         => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    '[Biblioteca].[dbo].[LivrosKindleUnlimited]'    => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
];

// Tabela Livros: tem tipo_edicao e status; demais podem não ter essas colunas
const TABELA_SQL_LIVROS = '[Biblioteca].[dbo].[Livros]';

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
], JSON_UNESCAPED_UNICODE);

function PostMethod(array $tabelasPermitidas) {
    global $result_status, $result_error, $result_data;

    $tabela = trim($_POST['tabela'] ?? '');
    $titulo = trim($_POST['titulo'] ?? '');

    if (empty($tabela) || empty($titulo)) {
        $result_error = 'Tabela e título são obrigatórios.';
        return;
    }

    if (!isset($tabelasPermitidas[$tabela])) {
        $result_error = 'Origem não reconhecida: ' . $tabela;
        return;
    }

    $tabelaSQL  = $tabelasPermitidas[$tabela];
    $ehLivros   = ($tabelaSQL === TABELA_SQL_LIVROS);

    // Livros tem tipo_edicao e status; outras tabelas retornam NULL nesses campos
    if ($ehLivros) {
        $campos = "id, titulo, autor, paginas, tipo_edicao";
        $where  = "titulo LIKE :titulo AND (status IS NULL OR status <> 'Lido')";
    } else {
        $campos = "id, titulo, autor, paginas, NULL AS tipo_edicao";
        $where  = "titulo LIKE :titulo";
    }

    $sql = "SELECT {$campos} FROM {$tabelaSQL} WHERE {$where} ORDER BY titulo ASC";

    try {
        $db        = new DataBase();
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
