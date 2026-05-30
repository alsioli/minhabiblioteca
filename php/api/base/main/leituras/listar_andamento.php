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

    // Todos os livros em andamento (data_fim IS NULL) com o progresso mais recente de LeiturasEmAndamento
    $sql = "
        SELECT
            l.id,
            l.titulo,
            l.autor,
            l.paginas,
            l.tipo_midia,
            l.data_inicio,
            DATEDIFF(day, l.data_inicio, GETDATE()) AS dias_lendo,
            la.percentual,
            la.pagina_atual,
            la.dt_alteracao AS ultima_atualizacao
        FROM [Biblioteca].[dbo].[Leituras] l
        LEFT JOIN (
            SELECT id_leitura, percentual, pagina_atual, dt_alteracao,
                   ROW_NUMBER() OVER (PARTITION BY id_leitura ORDER BY dt_alteracao DESC) AS rn
            FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
        ) la ON la.id_leitura = l.id AND la.rn = 1
        WHERE l.data_fim IS NULL
          AND l.titulo IS NOT NULL
        ORDER BY l.data_inicio DESC
    ";

    try {
        $result_data   = $db->GetMany($sql);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar leituras: ' . $e->getMessage();
    }
}
