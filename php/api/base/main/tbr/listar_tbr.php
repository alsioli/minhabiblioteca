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

    $acao = trim($_GET['acao'] ?? 'tbr');
    $mes  = trim($_GET['mes']  ?? '');

    $db = new DataBase();

    try {
        if ($acao === 'meses') {
            $sql = "
                SELECT DISTINCT mes_referencia
                FROM [Biblioteca].[dbo].[TBR_Mensal]
                WHERE mes_referencia IS NOT NULL AND mes_referencia <> ''
                ORDER BY mes_referencia DESC
            ";
            $result_data   = $db->GetMany($sql);
            $result_status = true;
            return;
        }

        if ($mes === '') {
            $result_error = 'Mês de referência é obrigatório.';
            return;
        }

        $params = [':mes' => $mes];
        $order  = "ORDER BY
                CASE t.previsao_leitura
                    WHEN 'Começo do mês' THEN 1
                    WHEN 'Depois do dia 10' THEN 2
                    WHEN 'Antes do dia 20' THEN 3
                    WHEN 'Final do mês' THEN 4
                    ELSE 5
                END, t.titulo";

        $camposBase = "t.id, t.origem, t.releitura, t.titulo, t.autor,
                       t.sexo_autor, t.pais, t.natureza, t.tema,
                       t.tipo_edicao, t.paginas, t.mes_referencia, t.previsao_leitura";

        // Tentativa 1: avaliação de Leituras + status de Livros
        try {
            $result_data = $db->GetMany("
                SELECT {$camposBase}, lv.status, l.avaliacao
                FROM [Biblioteca].[dbo].[TBR_Mensal] t
                LEFT JOIN (
                    SELECT titulo, avaliacao,
                           ROW_NUMBER() OVER (PARTITION BY titulo ORDER BY id DESC) AS rn
                    FROM [Biblioteca].[dbo].[Leituras]
                ) l  ON l.titulo  = t.titulo AND l.rn  = 1
                LEFT JOIN (
                    SELECT titulo, status,
                           ROW_NUMBER() OVER (PARTITION BY titulo ORDER BY id DESC) AS rn
                    FROM [Biblioteca].[dbo].[Livros]
                    WHERE status IS NOT NULL
                ) lv ON lv.titulo = t.titulo AND lv.rn = 1
                WHERE t.mes_referencia = :mes
                {$order}
            ", $params);
            $result_status = true;
            return;
        } catch (Exception $e) { /* status não encontrado em Livros, tenta sem */ }

        // Tentativa 2: sem join de status (NULL AS status)
        try {
            $result_data = $db->GetMany("
                SELECT {$camposBase}, NULL AS status, l.avaliacao
                FROM [Biblioteca].[dbo].[TBR_Mensal] t
                LEFT JOIN (
                    SELECT titulo, avaliacao,
                           ROW_NUMBER() OVER (PARTITION BY titulo ORDER BY id DESC) AS rn
                    FROM [Biblioteca].[dbo].[Leituras]
                ) l ON l.titulo = t.titulo AND l.rn = 1
                WHERE t.mes_referencia = :mes
                {$order}
            ", $params);
            $result_status = true;
            return;
        } catch (Exception $e) { /* Leituras com problema, tenta sem join */ }

        // Tentativa 3: apenas TBR_Mensal sem joins
        $result_data = $db->GetMany("
            SELECT {$camposBase}, NULL AS status, NULL AS avaliacao
            FROM [Biblioteca].[dbo].[TBR_Mensal] t
            WHERE t.mes_referencia = :mes
            {$order}
        ", $params);
        $result_status = true;

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar TBR: ' . $e->getMessage();
    }
}
