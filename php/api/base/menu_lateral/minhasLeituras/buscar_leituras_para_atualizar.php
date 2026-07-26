<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
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

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $titulo        = trim($_POST['titulo']        ?? '');
    $id = trim($_POST['id'] ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');


        // Tabelas permitidas (origem do livro)
    $TABELAS_PERMITIDAS = [
        'Biblioteca'                => '[Biblioteca].[dbo].[Livros]',
        'Skeelo'                    => '[Biblioteca].[dbo].[LeiturasSKEELO]',
        'Biblion'                   => '[Biblioteca].[dbo].[LivrosBiblion]',
        'MEC_Livros'                => '[Biblioteca].[dbo].[LivrosMEC]',
        'Audible'                   => '[Biblioteca].[dbo].[LivrosAudible]',
        'Kindle_Unlimited'          => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    ];

    if (!isset($TABELAS_PERMITIDAS[$local_leitura])) {
        $result_error = "Tabela de origem inválida: {$local_leitura}";
        return;
    }
     

    if (strlen($titulo) < 3) {
        $result_error = 'Digite pelo menos 3 caracteres para buscar.';
        return;
    }

        $params = [ '%' . $titulo . '%' ];
        $localFilter = '';

        if ($id!== '') {
            $localFilter = ' AND id= ? ';
            $params[] = $id ;
        }

         $tabelaSQL = $TABELAS_PERMITIDAS[$local_leitura];

    // Query completa — inclui data_fim e avaliacao com cast seguro
    $sqlCompleta = "
        SELECT
            ORIGEM.id,
            ORIGEM.titulo,
            ORIGEM.autor,
            ISNULL(CONVERT(VARCHAR(10), LEITURAS.data_inicio, 23), '') AS data_inicio,
            CONVERT(VARCHAR(10), ORIGEM.data_fim,    23) AS data_fim,
            ORIGEM.natureza AS natureza,
            CAST(ORIGEM.avaliacao AS NVARCHAR(10)) AS avaliacao,
            LOCAL.vLocal_Leitura AS vLocal_Leitura
        FROM {$tabelaSQL} ORIGEM
        LEFT JOIN [Biblioteca].[dbo].[LocalLeitura] LOCAL
            ON ORIGEM.tipo_midia = LOCAL.vLocal_Leitura
        LEFT JOIN [Biblioteca].[dbo].[Leituras] LEITURAS
            ON ORIGEM.id = LEITURAS.id_livros     
        WHERE ORIGEM.titulo LIKE ?
        {$localFilter}
        ORDER BY LEITURAS.data_inicio DESC
    ";


    //para levantar a data inicio se houver tem que linkar com Leituras
    // Fallback mínimo — apenas colunas garantidas do schema base
    $sqlMinima = "
        SELECT
            ORIGEM.id,
            ORIGEM.titulo,
            ORIGEM.autor,
            ISNULL(CONVERT(VARCHAR(10), LEITURAS.data_inicio, 23), '') AS data_inicio,
            '' AS data_fim,
            ORIGEM.natureza AS natureza,
            '' AS avaliacao,
            LOCAL.vLocal_Leitura AS local_leitura
        FROM {$tabelaSQL} ORIGEM
        LEFT JOIN [Biblioteca].[dbo].[LocalLeitura] LOCAL
            ON ORIGEM.tipo_midia = LOCAL.vLocal_Leitura
        LEFT JOIN [Biblioteca].[dbo].[Leituras] LEITURAS
            ON ORIGEM.id = LEITURAS.id_livros     
        WHERE ORIGEM.titulo LIKE ?
        {$localFilter}
        ORDER BY LEITURAS.data_inicio DESC
";



    try {
        $db = new DataBase();

        try {
            $result_data = $db->GetMany($sqlCompleta, $params);
        } catch (Exception $e) {
            $result_data = $db->GetMany($sqlMinima, $params);
        }

        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao buscar leituras: ' . $e->getMessage();
    }
}
