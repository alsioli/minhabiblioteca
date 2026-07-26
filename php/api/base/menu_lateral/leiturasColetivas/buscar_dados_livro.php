<?php
/**
 * GET ?titulo=...
 * Busca dados completos do livro nas tabelas de acervo.
 * Retorna o primeiro match com: titulo, autor, paginas, sexo_autor,
 * pais, natureza, tema, tipo_edicao e local_leitura (plataforma).
 */

include_once __DIR__ . "/../../../../utils/function/database.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed', 'data' => null]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$titulo        = trim($_GET['titulo'] ?? '');
$local_leitura = trim($_GET['local_leitura'] ?? '');

if (empty($titulo)) {
    echo json_encode(['status' => false, 'error' => 'Titulo e obrigatorio.', 'data' => null]);
    exit;
}

// Tabelas permitidas com ordem de prioridade (Livros tem o schema mais completo)
$TABELAS_PERMITIDAS = [
    'Biblioteca'         => ['sql' => '[Biblioteca].[dbo].[Livros]',                'completa' => true],
    'Skeelo'             => ['sql' => '[Biblioteca].[dbo].[LeiturasSKEELO]',        'completa' => false],
    'Biblion'            => ['sql' => '[Biblioteca].[dbo].[LivrosBiblion]',         'completa' => false],
    'MEC_Livros'         => ['sql' => '[Biblioteca].[dbo].[LivrosMEC]',             'completa' => false],
    'Audible'            => ['sql' => '[Biblioteca].[dbo].[LivrosAudible]',         'completa' => false],
    'Kindle_Unlimited'   => ['sql' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]', 'completa' => false],
];

// Ordem de prioridade de busca
$ordem_prioridade = ['Biblioteca', 'Skeelo', 'Biblion', 'MEC_Livros', 'Audible', 'Kindle_Unlimited'];

try {
    $db = new DataBase();
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => 'Erro de conexao: ' . $e->getMessage(), 'data' => null]);
    exit;
}

// Se local_leitura foi passado, busca apenas naquela tabela
if (!empty($local_leitura)) {
    if (!isset($TABELAS_PERMITIDAS[$local_leitura])) {
        echo json_encode(['status' => false, 'error' => 'Local de leitura inválido.', 'data' => null]);
        exit;
    }
    
    $ordem_busca = [$local_leitura];
} else {
    // Caso contrário, usa a ordem de prioridade padrão
    $ordem_busca = $ordem_prioridade;
}

foreach ($ordem_busca as $local) {
    $t = $TABELAS_PERMITIDAS[$local];
    try {
        if ($t['completa']) {
            $sql = "SELECT TOP 1
                        id,
                        ISNULL(titulo,      '') AS titulo,
                        ISNULL(autor,       '') AS autor,
                        ISNULL(CAST(paginas AS NVARCHAR), '') AS paginas,
                        ISNULL(sexo_autor,  '') AS sexo_autor,
                        ISNULL(pais,        '') AS pais,
                        ISNULL(natureza,    '') AS natureza,
                        ISNULL(tema,        '') AS tema,
                        ISNULL(tipo_edicao, '') AS tipo_edicao
                    FROM {$t['sql']}
                    WHERE titulo LIKE :titulo";
        } else {
            $sql = "SELECT TOP 1
                        id,
                        ISNULL(titulo,  '') AS titulo,
                        ISNULL(autor,   '') AS autor,
                        ISNULL(CAST(paginas AS NVARCHAR), '') AS paginas,
                        ''                  AS sexo_autor,
                        ISNULL(pais,    '') AS pais,
                        ISNULL(natureza, '') AS natureza,
                        ISNULL(tema,    '') AS tema,
                        ''                  AS tipo_edicao
                    FROM {$t['sql']}
                    WHERE titulo LIKE :titulo";
        }

        $row = $db->GetOne($sql, [':titulo' => '%' . $titulo . '%']);

        if ($row) {
            $row['local_leitura'] = $local;
            echo json_encode(['status' => true, 'error' => null, 'data' => $row], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Exception $e) {
        // Coluna pode nao existir nesta tabela — tenta a proxima
        continue;
    }
}

echo json_encode(['status' => false, 'error' => 'Livro nao encontrado nas tabelas de acervo.', 'data' => null], JSON_UNESCAPED_UNICODE);
