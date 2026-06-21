<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        GetMethod();
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    // Retorna origens distintas para popular o dropdown de filtro
    if (!empty($_GET['origens'])) {
        try {
            $db   = new DataBase();
            $rows = $db->GetMany(
                "SELECT DISTINCT origem FROM [Biblioteca].[dbo].[vw_LeiturasUnificadas] ORDER BY origem",
                []
            );
            $result_data   = array_column($rows, 'origem');
            $result_status = true;
        } catch (Exception $e) {
            $result_error = 'Erro ao carregar origens: ' . $e->getMessage();
        }
        return;
    }

    $titulo = trim($_GET['titulo'] ?? '');
    $autor  = trim($_GET['autor']  ?? '');
    $status = trim($_GET['status'] ?? '');
    $origem = trim($_GET['origem'] ?? '');
    $sexo   = trim($_GET['sexo']   ?? ''); // 'F'|'M'
    $raca   = trim($_GET['raca']   ?? '');
    $pais   = trim($_GET['pais']   ?? '');

    $params = [];
    $where  = [];

    if ($titulo !== '') {
        $where[]           = "v.titulo LIKE :titulo";
        $params[':titulo'] = '%' . $titulo . '%';
    }

    if ($autor !== '') {
        $where[]          = "v.autor LIKE :autor";
        $params[':autor'] = '%' . $autor . '%';
    }

    $statusMap = [
        'sim'          => "v.status = 'Lido'",
        'nao'          => "v.status NOT IN ('Lido', 'Lendo')",
        'lendo'        => "v.status = 'Lendo'",
        'abandonado'   => "v.status = 'Abandonado'",
        'interrompido' => "v.status = 'Interrompido'",
    ];
    if (isset($statusMap[$status])) {
        $where[] = $statusMap[$status];
    }

    if ($origem !== '') {
        $where[]           = "v.origem = :origem";
        $params[':origem'] = $origem;
    }

    if ($sexo !== '') {
        $where[]         = "a.sexo_autor = :sexo";
        $params[':sexo'] = $sexo;
    }

    if ($raca !== '') {
        $where[]         = "a.[raça] = :raca";
        $params[':raca'] = $raca;
    }

    if ($pais !== '') {
        $where[]         = "a.nacionalidade = :pais";
        $params[':pais'] = $pais;
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "
        SELECT v.titulo, v.autor, v.serie, v.volume, v.tema, v.status, v.avaliacao, v.origem
        FROM [Biblioteca].[dbo].[vw_LeiturasUnificadas] v
        LEFT JOIN [Biblioteca].[dbo].[Autor] a ON LOWER(a.nome_autor) = LOWER(v.autor)
        {$whereClause}
        ORDER BY v.titulo ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao consultar: ' . $e->getMessage();
    }
}
