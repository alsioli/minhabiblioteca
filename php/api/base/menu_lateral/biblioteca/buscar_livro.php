<?php

require_once __DIR__ . '/../../../../utils/function/database.php';

function mapLivroCodigoTipo(array $row): array {
    $row['codigo'] = '';
    $row['tipo_codigo'] = '';

    if (!empty($row['nASIN'])) {
        $row['codigo'] = $row['nASIN'];
        $row['tipo_codigo'] = 'ASIN';
    } elseif (!empty($row['nISBN_10'])) {
        $row['codigo'] = $row['nISBN_10'];
        $row['tipo_codigo'] = 'ISBN-10';
    } elseif (!empty($row['nISBN_13'])) {
        $row['codigo'] = $row['nISBN_13'];
        $row['tipo_codigo'] = 'ISBN-13';
    }

    return $row;
}

// Mapeamento local → tabela SQL completa
$TABELAS = [
    'Biblioteca'       => ['tabela' => '[Biblioteca].[dbo].[Livros]',                'local' => 'Biblioteca'],
    'Skeelo'           => ['tabela' => '[Biblioteca].[dbo].[LeiturasSKEELO]',         'local' => 'Skeelo'],
    'Biblion'          => ['tabela' => '[Biblioteca].[dbo].[LivrosBiblion]',          'local' => 'Biblion'],
    'MEC_Livros'       => ['tabela' => '[Biblioteca].[dbo].[LivrosMEC]',              'local' => 'MEC_Livros'],
    'Audible'          => ['tabela' => '[Biblioteca].[dbo].[LivrosAudible]',          'local' => 'Audible'],
    'Kindle_Unlimited' => ['tabela' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',  'local' => 'Kindle_Unlimited'],
];

// Inicializar variáveis de resposta
$result_status = false;
$result_error = '';
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
$json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
echo ($json !== false) ? $json : json_encode(['status' => false, 'error' => 'Erro ao serializar resposta: ' . json_last_error_msg(), 'data' => null]);

function normalizeCodigoPesquisa($codigo) {
    $codigo = trim((string)$codigo);
    if ($codigo === '') {
        return '';
    }

    // ISBN may be entered with hyphens or spaces; search normalized form
    return strtoupper(preg_replace('/[^0-9XxA-Za-z]/', '', $codigo));
}

function PostMethod() {
    global $result_status, $result_error, $result_data, $TABELAS;

    $codigo = trim($_POST['codigo'] ?? '');
    $titulo = trim($_POST['titulo'] ?? '');
    $autor  = trim($_POST['autor']  ?? '');
    $id     = trim($_POST['id']     ?? '');
    $local  = trim($_POST['local']  ?? '');  // usado na busca por id

    $db = new DataBase();

    try {
        // ── Busca por código (somente tabela Livros, que tem ISBN/ASIN) ──────
        if ($codigo !== '') {
            $codigoPesquisa = normalizeCodigoPesquisa($codigo);
            $sql = "SELECT * FROM [Biblioteca].[dbo].[Livros]
                    WHERE nASIN = :codigo
                       OR REPLACE(REPLACE(nISBN_10,'-',''),' ','') = :cp1
                       OR REPLACE(REPLACE(nISBN_13,'-',''),' ','') = :cp2";
            $result = $db->GetMany($sql, [':codigo' => $codigo, ':cp1' => $codigoPesquisa, ':cp2' => $codigoPesquisa]);

            if (!$result || count($result) === 0) {
                $result_error = 'Nenhum livro encontrado.';
                return;
            }
            $result_status = true;
            $result_data   = mapLivroCodigoTipo($result[0]);
            $result_data['local_leitura'] = 'Biblioteca';
            return;
        }

        // ── Busca por id em uma tabela específica (ao clicar na linha) ───────
        if ($id !== '' && $local !== '') {
            if (!isset($TABELAS[$local])) {
                $result_error = 'Local inválido.';
                return;
            }
            $tabelaSQL = $TABELAS[$local]['tabela'];
            $result = $db->GetMany("SELECT * FROM {$tabelaSQL} WHERE id = :id", [':id' => $id]);

            if (!$result || count($result) === 0) {
                $result_error = 'Livro não encontrado.';
                return;
            }
            $result_status = true;
            $livro = $local === 'Biblioteca' ? mapLivroCodigoTipo($result[0]) : $result[0];
            $livro['local_leitura'] = $local;
            $result_data = $livro;
            return;
        }

        // ── Busca por título e autor — UNION ALL em todas as tabelas ───────────
        if ($titulo !== '' || $autor !== '') {
            $params     = [];
            $queryParts = [];
            $index = 0;

            foreach ($TABELAS as $tabelaInfo) {
                $index++;
                $conditions = [];

                if ($titulo !== '') {
                    $paramTitulo = ':titulo_' . $index;
                    $conditions[] = "titulo LIKE {$paramTitulo}";
                    $params[$paramTitulo] = "%{$titulo}%";
                }

                if ($autor !== '') {
                    $paramAutor = ':autor_' . $index;
                    $conditions[] = "autor LIKE {$paramAutor}";
                    $params[$paramAutor] = "%{$autor}%";
                }

                $where = implode(' OR ', $conditions);
                $queryParts[] = "SELECT id, titulo, autor, editora, '{$tabelaInfo['local']}' AS local_leitura FROM {$tabelaInfo['tabela']} WHERE {$where}";
            }

            $union = implode("\nUNION ALL\n", $queryParts) . "\nORDER BY local_leitura, titulo";
            $result = $db->GetMany($union, $params);

            if (!$result || count($result) === 0) {
                $result_error = 'Nenhum livro encontrado.';
                return;
            }
            $result_status = true;
            $result_data   = $result;
            return;
        }

        $result_error = 'Nenhum parâmetro informado (codigo, titulo, autor ou id+local).';

    } catch (Exception $e) {
        $result_error = 'Erro ao buscar livro: ' . $e->getMessage();
    }
}
