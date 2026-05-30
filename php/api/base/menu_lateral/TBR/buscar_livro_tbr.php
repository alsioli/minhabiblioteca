<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

// Whitelist de tabelas — chave = vTabelaVinculada do banco, valor = nome SQL completo
$TABELAS_PERMITIDAS = [
    'dbo.Livros'                => '[Biblioteca].[dbo].[Livros]',
    'dbo.LeiturasSKEELO'        => '[Biblioteca].[dbo].[LeiturasSKEELO]',
    'dbo.LivrosBiblion'         => '[Biblioteca].[dbo].[LivrosBiblion]',
    'dbo.LivrosMEC'             => '[Biblioteca].[dbo].[LivrosMEC]',
    'dbo.LivrosAudible'         => '[Biblioteca].[dbo].[LivrosAudible]',
    'dbo.LivrosKindleUnlimited' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
];

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
    $releitura = trim($_POST['releitura'] ?? 'nao'); // 'sim' ou 'nao'

    if (empty($tabela) || empty($titulo)) {
        $result_error = 'Tabela e título são obrigatórios.';
        return;
    }

    if (!isset($tabelasPermitidas[$tabela])) {
        $result_error = 'Tabela não permitida.';
        return;
    }

    $tabelaSQL = $tabelasPermitidas[$tabela];

    // Tabela Livros: retorna campos completos; demais: campos básicos com NULL nos extras
    if ($tabela === 'dbo.Livros') {
        $campos = "id, titulo, autor, paginas, sexo_autor, pais, natureza, tema, tipo_edicao, status";
    } else {
        $campos = "id, titulo, autor, paginas,
                   NULL AS sexo_autor, NULL AS pais, NULL AS natureza,
                   NULL AS tema,       NULL AS tipo_edicao, status";
    }

    // Filtro por status conforme releitura
    if ($releitura === 'sim') {
        // Releitura: somente livros já lidos, abandonados ou interrompidos
        $where = "titulo LIKE :titulo
                  AND status IN ('Lido', 'Abandonado', 'Interrompido')";
    } else {
        // Sem releitura: exclui livros com status Lido
        $where = "titulo LIKE :titulo
                  AND (status IS NULL OR status NOT IN ('Lido'))";
    }

    $sql = "SELECT {$campos}
            FROM   {$tabelaSQL}
            WHERE  {$where}
            ORDER BY titulo ASC";

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
