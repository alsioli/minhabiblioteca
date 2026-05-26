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

function normalizeCodigoPesquisa($codigo) {
    $codigo = trim((string)$codigo);
    if ($codigo === '') {
        return '';
    }

    // ISBN may be entered with hyphens or spaces; search normalized form
    return strtoupper(preg_replace('/[^0-9XxA-Za-z]/', '', $codigo));
}

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $codigo = $_POST['codigo'] ?? null;    
    $titulo = $_POST['titulo'] ?? null;
    $id = $_POST['id'] ?? null;
    
    $sql = "";
    $params = [];

    // Montar WHERE com prepared statements
    if ($codigo) {
        $codigoPesquisa = normalizeCodigoPesquisa($codigo);
        $sql = "SELECT * FROM [Biblioteca].[dbo].[Livros] WHERE nASIN = :codigo OR REPLACE(REPLACE(nISBN_10, '-', ''), ' ', '') = :codigoPesquisa OR REPLACE(REPLACE(nISBN_13, '-', ''), ' ', '') = :codigoPesquisa";
        $params[':codigo'] = $codigo;
        $params[':codigoPesquisa'] = $codigoPesquisa;
    } 
    elseif ($titulo) {
        $sql = "SELECT * FROM [Biblioteca].[dbo].[Livros] WHERE titulo LIKE :titulo";
        $params[':titulo'] = "%$titulo%";
    } 
    elseif ($id) {
        $sql = "SELECT * FROM [Biblioteca].[dbo].[Livros] WHERE id = :id";
        $params[':id'] = $id;
    } 
    else {
        $result_error = "Nenhum parâmetro informado (codigo, titulo ou id).";
        return;
    }

    try {
        $db = new DataBase();
        $result = $db->GetMany($sql, $params);

        if (!$result || count($result) === 0) {
            $result_error = "Nenhum livro encontrado.";
            return;
        }

        $result_status = true;
        
        // Se for busca por título, retorna array; senão, retorna primeiro resultado
        if ($titulo) {
            $result_data = array_map('mapLivroCodigoTipo', $result);
        } else {
            $result_data = mapLivroCodigoTipo($result[0]);
        }

    } catch (Exception $e) {
        $result_status = false;
        $result_error = "Erro ao buscar livro: " . $e->getMessage();
    }
}
