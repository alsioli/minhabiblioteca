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

function normalizeCodigoForStorage($tipo_codigo, $codigo) {
    $tipo_codigo = normalizeTipoCodigo($tipo_codigo);
    $codigo = trim((string)$codigo);

    if ($tipo_codigo === 'ISBN-10' || $tipo_codigo === 'ISBN-13') {
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

    $requiredFields = ['codigo', 'tipo_codigo', 'titulo', 'autor'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $result_status = false;
            $result_error = 'O campo ' . $field . ' é obrigatório.';
            return;
        }
    }

    $codigo = isset($data['codigo']) ? trim($data['codigo']) : '';
    $tipo_codigo = isset($data['tipo_codigo']) ? normalizeTipoCodigo($data['tipo_codigo']) : '';

    $codigoColumnMap = [
        'ASIN' => 'nASIN',
        'ISBN-10' => 'nISBN_10',
        'ISBN-13' => 'nISBN_13'
    ];

    if ($codigo === '' || $tipo_codigo === '' || !isset($codigoColumnMap[$tipo_codigo])) {
        $result_status = false;
        $result_error = 'Código e tipo de código são obrigatórios e devem ser válidos.';
        return;
    }

    $map = [
        'titulo'        => 'titulo',
        'autor'         => 'autor',
        'sexo_autor'    => 'sexo_autor',
        'nacionalidade' => 'nacionalidade',
        'raca'          => 'raça',
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
        if (isset($data[$formField]) && trim($data[$formField]) !== '') {
            $dadosCorrigidos[$dbField] = $data[$formField];
        }
    }

    $dadosCorrigidos[$codigoColumnMap[$tipo_codigo]] = normalizeCodigoForStorage($tipo_codigo, $codigo);

    if (empty($dadosCorrigidos)) {
        $result_status = false;
        $result_error = 'Nenhum dado enviado para cadastro.';
        return;
    }

    $columns = [];
    $placeholders = [];
    $params = [];

    foreach ($dadosCorrigidos as $field => $value) {
        $columns[] = "[{$field}]";
        $placeholders[] = ":{$field}";
        $params[":{$field}"] = $value;
    }

    $sqlQuery = "INSERT INTO [Biblioteca].[dbo].[Livros] (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sqlQuery, $params);
        $result_status = true;
        $result_data = ['message' => 'Livro cadastrado com sucesso'];
    } catch (Exception $e) {
        $result_status = false;
        $result_error = 'Erro ao cadastrar: ' . $e->getMessage();
    }
}
