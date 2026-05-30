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

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    try {
        $db = new DataBase();

        // Busca leituras concluídas em LeiturasEmAndamento (percentual >= 100 OU última página)
        // que ainda não foram finalizadas em Leituras (data_fim IS NULL)
        $sqlBuscar = "
            SELECT
                l.id,
                l.titulo,
                l.autor,
                l.data_inicio,
                l.mes,
                CONVERT(DATE, la.dt_alteracao) AS data_fim,
                la.avaliacao
            FROM [Biblioteca].[dbo].[Leituras] l
            INNER JOIN (
                SELECT id_leitura, dt_alteracao, avaliacao,
                       ROW_NUMBER() OVER (PARTITION BY id_leitura ORDER BY dt_alteracao DESC) AS rn
                FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                WHERE percentual >= 100
                   OR (paginas IS NOT NULL AND paginas > 0
                       AND pagina_atual IS NOT NULL AND pagina_atual >= paginas)
            ) la ON la.id_leitura = l.id AND la.rn = 1
            WHERE l.data_fim IS NULL
        ";

        $pendentes = $db->GetMany($sqlBuscar);

        $sincronizados = 0;
        $detalhes      = [];

        foreach ($pendentes as $l) {
            $id        = (int)($l['id'] ?? 0);
            $titulo    = $l['titulo']   ?? '';
            $autor     = $l['autor']    ?? '';
            $data_fim  = $l['data_fim'];
            $avaliacao = $l['avaliacao'];
            $mes       = $l['mes']      ?? '';  // formato MM/YYYY

            if (!$id || !$data_fim) continue;

            // 1. Atualiza data_fim, tempo_dias e avaliacao em Leituras
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[Leituras]
                SET data_fim   = :p0,
                    tempo_dias = DATEDIFF(day, data_inicio, :p1),
                    avaliacao  = :p2
                WHERE id = :p3
            ", [
                ':p0' => $data_fim,
                ':p1' => $data_fim,
                ':p2' => $avaliacao !== null ? (float)$avaliacao : null,
                ':p3' => $id,
            ]);

            // 2. Atualiza Livros: status = 'Lido' e mes_leitura
            //    Faz match por titulo + autor quando disponível
            if (!empty($titulo)) {
                if (!empty($autor)) {
                    $db->ExecuteNonQuery("
                        UPDATE [Biblioteca].[dbo].[Livros]
                        SET [status]    = 'Lido',
                            mes_leitura = :p0
                        WHERE titulo    = :p1
                          AND autor     = :p2
                          AND ([status] IS NULL OR [status] != 'Lido')
                    ", [
                        ':p0' => $mes,
                        ':p1' => $titulo,
                        ':p2' => $autor,
                    ]);
                } else {
                    $db->ExecuteNonQuery("
                        UPDATE [Biblioteca].[dbo].[Livros]
                        SET [status]    = 'Lido',
                            mes_leitura = :p0
                        WHERE titulo    = :p1
                          AND ([status] IS NULL OR [status] != 'Lido')
                    ", [
                        ':p0' => $mes,
                        ':p1' => $titulo,
                    ]);
                }
            }

            $sincronizados++;
            $detalhes[] = $titulo;
        }

        $result_status = true;
        $result_data   = [
            'sincronizados' => $sincronizados,
            'detalhes'      => $detalhes,
            'message'       => $sincronizados > 0
                ? "{$sincronizados} leitura(s) sincronizada(s) com sucesso."
                : "Nenhuma leitura pendente para sincronizar.",
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao sincronizar leituras: ' . $e->getMessage();
    }
}
