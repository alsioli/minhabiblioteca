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

$titulo = trim($_GET['titulo'] ?? '');
if (empty($titulo)) {
    echo json_encode(['status' => false, 'error' => 'Titulo e obrigatorio.', 'data' => null]);
    exit;
}

// Tabelas em ordem de prioridade (Livros tem o schema mais completo)
$tabelas = [
    ['sql' => '[Biblioteca].[dbo].[Livros]',                'local' => 'Biblioteca',       'completa' => true],
    ['sql' => '[Biblioteca].[dbo].[LeiturasSKEELO]',        'local' => 'Skeelo',           'completa' => false],
    ['sql' => '[Biblioteca].[dbo].[LivrosBiblion]',         'local' => 'Biblion',          'completa' => false],
    ['sql' => '[Biblioteca].[dbo].[LivrosMEC]',             'local' => 'MEC_Livros',       'completa' => false],
    ['sql' => '[Biblioteca].[dbo].[LivrosAudible]',         'local' => 'Audible',          'completa' => false],
    ['sql' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]', 'local' => 'Kindle_Unlimited', 'completa' => false],
];

try {
    $db = new DataBase();
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => 'Erro de conexao: ' . $e->getMessage(), 'data' => null]);
    exit;
}

foreach ($tabelas as $t) {
    try {
        if ($t['completa']) {
            $sql = "SELECT TOP 1
                        ISNULL(titulo,      '') AS titulo,
                        ISNULL(autor,       '') AS autor,
                        ISNULL(CAST(paginas AS NVARCHAR), '') AS paginas,
                        ISNULL(sexo_autor,  '') AS sexo_autor,
                        ISNULL(pais,        '') AS pais,
                        ISNULL(natureza,    '') AS natureza,
                        ISNULL(tema,        '') AS tema,
                        ISNULL(tipo_edicao, '') AS tipo_edicao
                    FROM {$t['sql']}
                    WHERE titulo = :titulo";
        } else {
            $sql = "SELECT TOP 1
                        ISNULL(titulo,  '') AS titulo,
                        ISNULL(autor,   '') AS autor,
                        ISNULL(CAST(paginas AS NVARCHAR), '') AS paginas,
                        ''                  AS sexo_autor,
                        ISNULL(pais,    '') AS pais,
                        ''                  AS natureza,
                        ISNULL(tema,    '') AS tema,
                        ''                  AS tipo_edicao
                    FROM {$t['sql']}
                    WHERE titulo = :titulo";
        }

        $row = $db->GetOne($sql, [':titulo' => $titulo]);

        if ($row && !empty($row['titulo'])) {
            $row['local_leitura'] = $t['local'];
            echo json_encode(['status' => true, 'error' => null, 'data' => $row], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Exception $e) {
        // Coluna pode nao existir nesta tabela — tenta a proxima
        continue;
    }
}

echo json_encode(['status' => false, 'error' => 'Livro nao encontrado nas tabelas de acervo.', 'data' => null], JSON_UNESCAPED_UNICODE);
