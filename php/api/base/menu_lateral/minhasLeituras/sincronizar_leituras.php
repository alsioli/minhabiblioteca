<?php

include_once __DIR__ . "/../../../../utils/function/database.php";
include_once __DIR__ . "/../../../../utils/function/atualizar_status_tabela.php";

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
        $joinLA = "
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

        // Tenta com local_leitura; se a coluna não existir, usa '' como fallback
        try {
            $pendentes = $db->GetMany("
                SELECT l.id, l.titulo, l.autor, l.data_inicio, l.mes,
                       ISNULL(l.local_leitura, '') AS local_leitura,
                       CONVERT(DATE, la.dt_alteracao) AS data_fim, la.avaliacao
                FROM [Biblioteca].[dbo].[Leituras] l {$joinLA}
            ");
        } catch (Exception $e) {
            $pendentes = $db->GetMany("
                SELECT l.id, l.titulo, l.autor, l.data_inicio, l.mes,
                       ''                           AS local_leitura,
                       CONVERT(DATE, la.dt_alteracao) AS data_fim, la.avaliacao
                FROM [Biblioteca].[dbo].[Leituras] l {$joinLA}
            ");
        }

        $sincronizados = 0;
        $detalhes      = [];

        foreach ($pendentes as $l) {
            $id            = (int)($l['id'] ?? 0);
            $titulo        = $l['titulo']        ?? '';
            $autor         = $l['autor']         ?? '';
            $data_fim      = $l['data_fim'];
            $avaliacao     = $l['avaliacao'];
            $local_leitura = $l['local_leitura'] ?? '';

            if (!$id || !$data_fim) continue;

            // Deriva mês/ano de conclusão a partir de data_fim
            $dt_fim_obj      = new DateTime($data_fim);
            $mes_ano_leitura = $dt_fim_obj->format('m/Y');   // MM/YYYY
            $ano_leitura     = (int)$dt_fim_obj->format('Y');
            $aval            = $avaliacao !== null ? (float)$avaliacao : null;

            // 1. Atualiza Leituras: data_fim, tempo_dias, avaliacao, mes
            $mesAno = $dt_fim_obj->format('m/Y');
            try {
                $db->ExecuteNonQuery("
                    UPDATE [Biblioteca].[dbo].[Leituras]
                    SET data_fim   = :p0,
                        tempo_dias = DATEDIFF(day, data_inicio, :p1),
                        avaliacao  = :p2,
                        mes        = :p4
                    WHERE id = :p3
                ", [':p0' => $data_fim, ':p1' => $data_fim, ':p2' => $aval, ':p3' => $id, ':p4' => $mesAno]);
            } catch (Exception $e) {
                // Fallback sem colunas que podem não existir
                try {
                    $db->ExecuteNonQuery("
                        UPDATE [Biblioteca].[dbo].[Leituras]
                        SET data_fim = :p0
                        WHERE id = :p3
                    ", [':p0' => $data_fim, ':p3' => $id]);
                } catch (Exception $e2) { /* silencioso — prossegue para deletar de LeiturasEmAndamento */ }
            }

            // 2. Atualiza Livros: status, mes_leitura, ano_leitura, mes_ano_leitura, avaliacao
            if (!empty($titulo)) {
                $whereAutor = !empty($autor) ? "AND autor = :autor" : '';
                $paramsLivros = [
                    ':mes_ano'  => $mes_ano_leitura,
                    ':ano'      => $ano_leitura,
                    ':aval'     => $aval,
                    ':titulo'   => $titulo,
                ];
                if (!empty($autor)) $paramsLivros[':autor'] = $autor;

                try {
                    $db->ExecuteNonQuery("
                        UPDATE [Biblioteca].[dbo].[Livros]
                        SET [status]          = 'Lido',
                            [mes_leitura]     = :mes_ano,
                            [ano_leitura]     = :ano,
                            [mes_ano_leitura] = :mes_ano,
                            [avaliacao]       = :aval
                        WHERE titulo = :titulo {$whereAutor}
                    ", $paramsLivros);
                } catch (Exception $e) {
                    // Fallback: colunas novas podem não existir ainda
                    $db->ExecuteNonQuery("
                        UPDATE [Biblioteca].[dbo].[Livros]
                        SET [status]      = 'Lido',
                            [mes_leitura] = :mes_ano
                        WHERE titulo = :titulo {$whereAutor}
                    ", array_intersect_key($paramsLivros, array_flip([':mes_ano', ':titulo', ':autor'])));
                }
            }

            // 3. Atualiza status na tabela da plataforma
            atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, 'Lido');

            // 4. Tenta atualizar avaliacao na tabela da plataforma (silencioso)
            if ($aval !== null && !empty($local_leitura)) {
                $tabPlat = getTabela($local_leitura);
                if ($tabPlat) {
                    try {
                        $wAutor = !empty($autor) ? "AND autor = :autor" : '';
                        $pPlat  = [':aval' => $aval, ':titulo' => $titulo];
                        if (!empty($autor)) $pPlat[':autor'] = $autor;
                        $db->ExecuteNonQuery("
                            UPDATE [Biblioteca].[dbo].[{$tabPlat}]
                            SET [avaliacao] = :aval
                            WHERE titulo = :titulo {$wAutor}
                        ", $pPlat);
                    } catch (Exception $e) { /* coluna pode não existir */ }
                }
            }

            // 5. Remove de LeiturasEmAndamento
            try {
                $db->ExecuteNonQuery(
                    "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento] WHERE id_leitura = :id",
                    [':id' => $id]
                );
            } catch (Exception $e) { /* silencioso */ }

            // Atualiza situacao no CronogramaLCs para 'Lido'
            try {
                $db->ExecuteNonQuery("
                    UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                    SET situacao = 'Lido'
                    WHERE titulo = :titulo
                      AND situacao <> 'Lido'
                ", [':titulo' => $titulo]);
            } catch (Exception $e) {
                // Silencioso — CronogramaLCs pode nao ter entrada para este livro
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
