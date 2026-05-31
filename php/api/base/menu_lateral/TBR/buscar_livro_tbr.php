<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

/*
 * Whitelist expandida — cobre os formatos mais comuns de vTabelaVinculada:
 *   'dbo.Livros'  |  'Livros'  |  '[Biblioteca].[dbo].[Livros]'
 * O valor sempre resolve para o nome SQL seguro com brackets.
 */
$TABELAS_PERMITIDAS = [
    // ── Livros (biblioteca principal) ─────────────────────────────
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

// Tabelas que têm colunas completas (sexo_autor, pais, natureza, tema, tipo_edicao, status)
$TABELAS_COMPLETAS = ['[Biblioteca].[dbo].[Livros]'];

$result_status = false;
$result_error  = null;
$result_data   = null;

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

    $tabela    = trim($_POST['tabela']    ?? '');
    $titulo    = trim($_POST['titulo']    ?? '');
    $releitura = trim($_POST['releitura'] ?? 'todos');

    if (empty($tabela) || empty($titulo)) {
        $result_error = 'Tabela e título são obrigatórios.';
        return;
    }

    if (!isset($tabelasPermitidas[$tabela])) {
        $result_error = 'Origem não reconhecida: ' . $tabela;
        return;
    }

    $tabelaSQL = $tabelasPermitidas[$tabela];
    $params    = [':titulo' => '%' . $titulo . '%'];

    // Filtros WHERE com status (para tabelas que têm a coluna)
    if ($releitura === 'sim') {
        $whereComStatus = "titulo LIKE :titulo
                           AND status IN ('Lido', 'Abandonado', 'Interrompido')";
    } elseif ($releitura === 'nao') {
        $whereComStatus = "titulo LIKE :titulo
                           AND (status IS NULL OR status NOT IN ('Lido'))";
    } else {
        $whereComStatus = "titulo LIKE :titulo";
    }
    $whereSemStatus = "titulo LIKE :titulo";

    $db = new DataBase();

    // ── Tentativa 1: colunas completas + filtro de status ──────────
    // (funciona se a tabela tiver sexo_autor, pais, natureza, tema, status)
    try {
        $resultado = $db->GetMany(
            "SELECT id, titulo, autor, paginas,
                    sexo_autor, pais, natureza, tema, tipo_edicao, status
             FROM   {$tabelaSQL}
             WHERE  {$whereComStatus}
             ORDER BY titulo ASC",
            $params
        );
        if (!empty($resultado)) { $result_status = true; $result_data = $resultado; return; }
        // Se vazio com status filter, tenta sem para confirmar que a tabela tem dados
    } catch (Exception $e) { /* colunas não existem, cai para tentativa 2 */ }

    // ── Tentativa 2: colunas mínimas confirmadas + filtro de status ─
    // (funciona se a tabela tiver tipo_edicao e status, mas não as extras)
    try {
        $resultado = $db->GetMany(
            "SELECT id, titulo, autor, paginas,
                    NULL AS sexo_autor, NULL AS pais, NULL AS natureza,
                    NULL AS tema, tipo_edicao, status
             FROM   {$tabelaSQL}
             WHERE  {$whereComStatus}
             ORDER BY titulo ASC",
            $params
        );
        if (!empty($resultado)) { $result_status = true; $result_data = $resultado; return; }
    } catch (Exception $e) { /* status não existe, cai para tentativa 3 */ }

    // ── Tentativa 3: mínimo absoluto sem filtro de status ──────────
    // (garante resultado mesmo sem colunas extras ou status)
    try {
        $resultado = $db->GetMany(
            "SELECT id, titulo, autor, paginas,
                    NULL AS sexo_autor, NULL AS pais, NULL AS natureza,
                    NULL AS tema, NULL AS tipo_edicao, NULL AS status
             FROM   {$tabelaSQL}
             WHERE  {$whereSemStatus}
             ORDER BY titulo ASC",
            $params
        );
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
