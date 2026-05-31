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
]);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $db = new DataBase();

    // Busca diretamente da tabela LeiturasEmAndamento,
    // pegando o registro mais recente por id_leitura.
    $sql = "
        WITH ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY id_leitura ORDER BY dt_alteracao DESC) AS rn
            FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
        )
        SELECT
            id_leitura          AS id,
            titulo,
            autor,
            paginas,
            tipo_midia,
            data_inicio,
            percentual,
            pagina_atual,
            dt_alteracao        AS ultima_atualizacao,
            DATEDIFF(day, data_inicio, GETDATE()) AS dias_lendo
        FROM ranked
        WHERE rn = 1
        ORDER BY dt_alteracao DESC
    ";

    try {
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar leituras em andamento: ' . $e->getMessage();
    }
}
