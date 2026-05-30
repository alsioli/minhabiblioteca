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

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    // Contagem total por status (geral)
    $sqlGeral = "
        SELECT
            ISNULL(NULLIF(TRIM([status]), ''), 'Não informado') AS status,
            COUNT(*) AS total
        FROM [Biblioteca].[dbo].[Livros]
        GROUP BY ISNULL(NULLIF(TRIM([status]), ''), 'Não informado')
    ";

    // Contagem por tipo_edicao × status
    $sqlTipos = "
        SELECT
            ISNULL(NULLIF(TRIM(tipo_edicao), ''), 'Não informado') AS tipo_edicao,
            ISNULL(NULLIF(TRIM([status]),    ''), 'Não informado') AS status,
            COUNT(*) AS total
        FROM [Biblioteca].[dbo].[Livros]
        GROUP BY
            ISNULL(NULLIF(TRIM(tipo_edicao), ''), 'Não informado'),
            ISNULL(NULLIF(TRIM([status]),    ''), 'Não informado')
        ORDER BY tipo_edicao ASC, [status] ASC
    ";

    try {
        $db         = new DataBase();
        $geral      = $db->GetMany($sqlGeral);
        $porTipo    = $db->GetMany($sqlTipos);

        $totalGeral = array_sum(array_column($geral, 'total'));

        $result_status = true;
        $result_data   = [
            'total_geral' => $totalGeral,
            'geral'       => $geral,
            'por_tipo'    => $porTipo,
        ];
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar estatísticas: ' . $e->getMessage();
    }
}
