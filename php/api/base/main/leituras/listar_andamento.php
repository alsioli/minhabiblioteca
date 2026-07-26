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
    // JOIN com Leituras para obter local_leitura (usado ao marcar livro como Lido).
   $sqlComLocal = "
   WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY id_leitura
                   ORDER BY COALESCE(dt_alteracao, '1900-01-01') DESC, id DESC
               ) AS rn
        FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
    )
    SELECT
        r.id_leitura                              AS id,
        r.id_leitura                              AS id_leitura,
        r.titulo,
        r.autor,
        r.paginas,
        r.tipo_midia,
        r.data_inicio,
        r.percentual,
        r.pagina_atual,
        r.dt_alteracao                            AS ultima_atualizacao,
        DATEDIFF(day, r.data_inicio, GETDATE())   AS dias_lendo,
        ISNULL(lt.vLocal_Leitura, '')              AS local_leitura,
        leit.id_livros                            AS id_livros
    FROM ranked r
    LEFT JOIN [Biblioteca].[dbo].[LocalLeitura] lt ON lt.id = r.id_local_leitura
    LEFT JOIN [Biblioteca].[dbo].[Leituras] leit ON leit.id = r.id_leitura
    WHERE r.rn = 1
    ORDER BY COALESCE(r.dt_alteracao, '1900-01-01') DESC, r.id DESC
";

   try {
        $result_data = $db->GetMany($sqlComLocal);
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao carregar leituras em andamento: ' . $e->getMessage();
    }
}
