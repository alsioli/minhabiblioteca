<?php

require_once __DIR__ . '/../../../../utils/function/database.php';

function normalizeTipoCodigo($tipo_codigo) {
    $tipo_codigo = trim((string)$tipo_codigo);
    $tipo_codigo = strtoupper($tipo_codigo);
    $tipo_codigo = str_replace(['ISBN_10', 'ISBN10'], 'ISBN-10', $tipo_codigo);
    $tipo_codigo = str_replace(['ISBN_13', 'ISBN13'], 'ISBN-13', $tipo_codigo);

    if ($tipo_codigo === '10') {
        return 'ISBN-10';
    }
    if ($tipo_codigo === '13' || $tipo_codigo === '14') {
        return 'ISBN-13';
    }
    if ($tipo_codigo === 'ASIN') {
        return 'ASIN';
    }

    return $tipo_codigo;
}

function getCodigoColumn($tipo_codigo) {
    $codigoColumnMap = [
        'ASIN' => 'nASIN',
        'ISBN-10' => 'nISBN_10',
        'ISBN-13' => 'nISBN_13',
    ];

    $tipo_codigo = normalizeTipoCodigo($tipo_codigo);
    return $codigoColumnMap[$tipo_codigo] ?? null;
}

function normalizeCodigoForStorage($tipo_codigo, $codigo) {
    $tipo_codigo = normalizeTipoCodigo($tipo_codigo);
    $codigo = trim((string)$codigo);

    if ($tipo_codigo === 'ISBN-10' || $tipo_codigo === 'ISBN-13') {
        // Remove hyphens, spaces and other separators before storing
        $codigo = preg_replace('/[^0-9Xx]/', '', $codigo);
        $codigo = strtoupper($codigo);
    }

    return $codigo;
}

// Inicializar variáveis de resposta
$result_status = false;
$result_error = '';
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
        break;
    case 'PUT':
        PutMethod();
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
echo json_encode($response);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $data = $_POST;

    if (empty($data['id_livro'])) {
        $result_error = 'ID do livro não fornecido.';
        return;
    }

    $id    = $data['id_livro'];
    $local = trim($data['local_leitura'] ?? 'Biblioteca');

    // Whitelist de tabelas
    $tabelaMap = [
        'Biblioteca'       => '[Biblioteca].[dbo].[Livros]',
        'Skeelo'           => '[Biblioteca].[dbo].[LeiturasSKEELO]',
        'Biblion'          => '[Biblioteca].[dbo].[LivrosBiblion]',
        'MEC_Livros'       => '[Biblioteca].[dbo].[LivrosMEC]',
        'Audible'          => '[Biblioteca].[dbo].[LivrosAudible]',
        'Kindle_Unlimited' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    ];
    $tabelaDestino = $tabelaMap[$local] ?? '[Biblioteca].[dbo].[Livros]';

    // Campos que podem ser atualizados (comuns + específicos por tabela)
    $map = [
        'titulo'        => 'titulo',
        'autor'         => 'autor',
        'serie'         => 'serie',
        'volume'        => 'volume',
        'genero'        => 'genero',
        'tema'          => 'tema',
        'editora'       => 'editora',
        'paginas'       => 'paginas',
        'status'        => 'status',
        'avaliacao'     => 'avaliacao',
        'emprestimo'    => 'emprestimo',
        'ku_tipo'       => 'ku_tipo',
        'skeelo_tipo'   => 'skeelo_tipo',
        'pais'          => 'pais',
        'tipo_midia'    => 'tipo_midia',
        'favorito'      => 'favorito',
        'biblion_tipo'  => 'biblion_tipo',
        // Exclusivos Biblioteca
        'sexo_autor'    => 'sexo_autor',
        'nacionalidade' => 'nacionalidade',
        'raca'          => 'raça',
        'tipo_edicao'   => 'tipo_edicao',
        'natureza'      => 'natureza',
        'data_compra'   => 'data_compra',
        'valor_compra'  => 'valor_compra',
        'local_compra'  => 'local_compra',
        'observacoes'   => 'observacoes',
    ];

    $dadosCorrigidos = [];
    foreach ($map as $formField => $dbField) {
        if (isset($data[$formField]) && trim($data[$formField]) !== '') {
            $dadosCorrigidos[$dbField] = $data[$formField];
        }
    }

    // Processa codigo/tipo_codigo somente para Biblioteca
    if ($local === 'Biblioteca' && !empty($data['codigo'])) {
        $codigoColumn = getCodigoColumn($data['tipo_codigo'] ?? '');
        if (!$codigoColumn) {
            $result_error = 'Tipo de código inválido.';
            return;
        }
        $dadosCorrigidos[$codigoColumn] = normalizeCodigoForStorage($data['tipo_codigo'] ?? '', $data['codigo']);
    }

    if (empty($dadosCorrigidos)) {
        $result_error = 'Nenhum campo para atualizar.';
        return;
    }

    // Usa índices numéricos para evitar problemas com caracteres especiais (ex: "raça")
    $setClauses = [];
    $params     = [];
    $idx        = 0;

    foreach ($dadosCorrigidos as $col => $val) {
        $paramKey      = ':p' . $idx++;
        $setClauses[]  = "[{$col}] = {$paramKey}";
        $params[$paramKey] = $val;
    }

    $params[':id'] = $id;
    $sqlQuery = "UPDATE {$tabelaDestino} SET " . implode(', ', $setClauses) . " WHERE id = :id";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sqlQuery, $params);
        $result_status = true;
        $result_data   = ['id' => $id, 'message' => 'Livro atualizado com sucesso'];
    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar: ' . $e->getMessage();
    }
}

function PutMethod() {
    global $result_status, $result_error, $result_data;

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validar se o JSON é válido
    if (json_last_error() !== JSON_ERROR_NONE) {
        $result_status = false;
        $result_error = 'JSON inválido: ' . json_last_error_msg();
        return;
    }

    if (!isset($data['id'])) {
        $result_status = false;
        $result_error = 'ID não fornecido.';
        return;
    }
    
    $id = $data['id'];

    $map = [
        'titulo'        => 'titulo',
        'autor'         => 'autor',
        'sexo_autor'    => 'sexo_autor',
        'nacionalidade' => 'nacionalidade',
        'raca'          => 'raca',
        'volume'        => 'volume',
        'serie'         => 'serie',
        'genero'        => 'genero',
        'tema'          => 'tema',
        'editora'       => 'editora',
        'tipo_edicao'   => 'tipo_edicao',
        'paginas'       => 'paginas',
        'natureza'      => 'natureza',
        'status'        => 'status',
        'emprestimo'    => 'emprestimo',
        'data_compra'   => 'data_compra',
        'valor_compra'  => 'valor_compra',
        'local_compra'  => 'local_compra',
        'observacoes'   => 'observacoes'
    ];

    $dadosCorrigidos = [];

    foreach ($map as $formField => $dbField) {
        if (isset($data[$formField])) {
            $dadosCorrigidos[$dbField] = $data[$formField];
        }
    }

    if (isset($data['codigo'])) {
        $codigoColumn = getCodigoColumn($data['tipo_codigo'] ?? '');
        if (!$codigoColumn) {
            $result_status = false;
            $result_error = 'Tipo de código inválido. Use ASIN, ISBN-10 ou ISBN-13.';
            return;
        }
        $dadosCorrigidos[$codigoColumn] = normalizeCodigoForStorage($data['tipo_codigo'] ?? '', $data['codigo']);
    }

    // Verifica se existem campos para atualizar
    if (empty($dadosCorrigidos)) {
        $result_status = false;
        $result_error = 'Nenhum campo para atualizar.';
        return;
    }
    
    $campos = [];
    $params = [];
    
    foreach ($dadosCorrigidos as $campo => $valor) {
        $campos[] = "[$campo] = :$campo";
        $params[":$campo"] = $valor;
    }

    $sqlQuery = "UPDATE [Biblioteca].[dbo].[Livros]
        SET " . implode(', ', $campos) . "
        WHERE id = :id";
    
    $params[':id'] = $id;

    try {
        $db = new DataBase(); 
        $db->ExecuteNonQuery($sqlQuery, $params);
        $result_status = true;
        $result_data = ['id' => $id, 'message' => 'Livro atualizado com sucesso'];
    } catch (Exception $e) {
        $result_status = false;
        $result_error = 'Erro ao atualizar: ' . $e->getMessage();
    }
}
