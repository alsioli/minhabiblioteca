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

    $titulo      = trim($_GET['titulo']      ?? '');
    $autor       = trim($_GET['autor']       ?? '');
    $tipo_edicao = trim($_GET['tipo_edicao'] ?? '');
    $lido        = trim($_GET['lido']        ?? ''); // 'sim'|'nao'|'lendo'|'abandonado'|'interrompido'
    $paginas     = trim($_GET['paginas']     ?? ''); // 'ate100'|'101_200'|'201_300'|'301_400'|'mais400'
    $natureza    = trim($_GET['natureza']    ?? '');
    $sexo        = trim($_GET['sexo']        ?? ''); // 'F'|'M'
    $raca        = trim($_GET['raca']        ?? '');
    $pais        = trim($_GET['pais']        ?? '');
    $mes         = trim($_GET['mes']         ?? ''); // 'YYYY-MM'

    $params = [];
    $where  = [];

    if ($titulo !== '') {
        $where[]           = "l.titulo LIKE :titulo";
        $params[':titulo'] = '%' . $titulo . '%';
    }

    if ($autor !== '') {
        $where[]          = "l.autor LIKE :autor";
        $params[':autor'] = '%' . $autor . '%';
    }

    if ($tipo_edicao !== '') {
        $where[]                = "l.tipo_edicao = :tipo_edicao";
        $params[':tipo_edicao'] = $tipo_edicao;
    }

    $statusMap = [
        'sim'         => "l.status = 'Lido'",
        'nao'         => "l.status <> 'Lido'",
        'lendo'       => "l.status = 'Lendo'",
        'abandonado'  => "l.status = 'Abandonado'",
        'interrompido'=> "l.status = 'Interrompido'",
    ];
    if (isset($statusMap[$lido])) {
        $where[] = $statusMap[$lido];
    }

    $paginasMap = [
        'ate100'  => "l.paginas <= 100",
        '101_200' => "l.paginas BETWEEN 101 AND 200",
        '201_300' => "l.paginas BETWEEN 201 AND 300",
        '301_400' => "l.paginas BETWEEN 301 AND 400",
        'mais400' => "l.paginas > 400",
    ];
    if (isset($paginasMap[$paginas])) {
        $where[] = $paginasMap[$paginas];
    }

    if ($natureza !== '') {
        $where[]             = "l.natureza = :natureza";
        $params[':natureza'] = $natureza;
    }

    if ($sexo !== '') {
        $where[]        = "l.sexo_autor = :sexo";
        $params[':sexo'] = $sexo;
    }

    if ($raca !== '') {
        $where[]        = "l.[raça] = :raca";
        $params[':raca'] = $raca;
    }

    if ($pais !== '') {
        $where[]        = "l.nacionalidade = :pais";
        $params[':pais'] = $pais;
    }

    // JOIN com Leituras para mês de leitura
    if ($mes !== '' && preg_match('/^\d{4}-\d{2}$/', $mes)) {
        [$ano, $mes_num] = explode('-', $mes);

        // INNER JOIN: só livros lidos neste mês aparecem
        $joinLeituras = "
            INNER JOIN (
                SELECT titulo, MAX(data_fim) AS data_fim
                FROM [Biblioteca].[dbo].[Leituras]
                WHERE data_fim IS NOT NULL
                  AND YEAR(data_fim)  = :ano
                  AND MONTH(data_fim) = :mes_num
                GROUP BY titulo
            ) lt ON lt.titulo = l.titulo
        ";
        $params[':ano']     = (int)$ano;
        $params[':mes_num'] = (int)$mes_num;
    } else {
        // LEFT JOIN: mostra data da leitura mais recente (pode ser NULL)
        $joinLeituras = "
            LEFT JOIN (
                SELECT titulo, MAX(data_fim) AS data_fim
                FROM [Biblioteca].[dbo].[Leituras]
                WHERE data_fim IS NOT NULL
                GROUP BY titulo
            ) lt ON lt.titulo = l.titulo
        ";
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "
        SELECT
            l.id,
            l.titulo,
            l.autor,
            ISNULL(l.tipo_edicao, '')  AS tipo_edicao,
            ISNULL(l.status, '')       AS status,
            ISNULL(l.paginas, 0)       AS paginas,
            ISNULL(l.tema, '')         AS tema,
            ISNULL(l.nacionalidade, '')AS nacionalidade,
            ISNULL(l.natureza, '')     AS natureza,
            ISNULL(CAST(l.avaliacao AS NVARCHAR(10)), '') AS avaliacao,
            CONVERT(VARCHAR(7), lt.data_fim, 126) AS mes_leitura
        FROM [Biblioteca].[dbo].[Livros] l
        {$joinLeituras}
        {$whereClause}
        ORDER BY l.titulo ASC
    ";

    try {
        $db            = new DataBase();
        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao consultar livros: ' . $e->getMessage();
    }
}
