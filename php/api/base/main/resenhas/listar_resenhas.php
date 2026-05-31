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

    $acao  = trim($_GET['acao']  ?? '');
    $mes   = trim($_GET['mes']   ?? '');
    $busca = trim($_GET['busca'] ?? '');

    $db = new DataBase();

    try {
        if ($acao === 'meses') {
            $sql = "
                SELECT DISTINCT mes_leitura
                FROM [Biblioteca].[dbo].[Resenhas]
                WHERE mes_leitura IS NOT NULL AND mes_leitura <> ''
                ORDER BY mes_leitura DESC
            ";
            $result_data   = $db->GetMany($sql);
            $result_status = true;
            return;
        }

        $params = [];
        $where  = [];

        if ($mes !== '') {
            $where[]       = "mes_leitura = :mes";
            $params[':mes'] = $mes;
        }

        if ($busca !== '') {
            $where[]          = "(nome_livro LIKE :busca OR autor LIKE :busca)";
            $params[':busca'] = '%' . $busca . '%';
        }

        $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "
            SELECT
                nome_livro,
                autor,
                mes_leitura,
                avaliacao,
                resenhas
            FROM [Biblioteca].[dbo].[Resenhas]
            $whereClause
            ORDER BY mes_leitura DESC, nome_livro
        ";

        $result_data   = $db->GetMany($sql, $params);
        $result_status = true;

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar resenhas: ' . $e->getMessage();
    }
}
