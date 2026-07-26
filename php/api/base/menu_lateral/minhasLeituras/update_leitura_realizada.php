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

    // ─────────────────────────────────────────────────────────────
    // ENTRADA
    // ─────────────────────────────────────────────────────────────
    $id            = trim($_POST['id']            ?? ''); // ID do LIVRO na tabela de origem
    $titulo        = trim($_POST['titulo']        ?? '');
    $autor         = trim($_POST['autor']         ?? '');
    $paginas       = trim($_POST['paginas']       ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');
    $data_inicio   = trim($_POST['data_inicio']   ?? '');
    $data_fim      = trim($_POST['data_fim']      ?? '');
    $natureza      = trim($_POST['natureza']      ?? '');
    $avaliacao     = trim($_POST['avaliacao']     ?? '');



//echo "Recebido: id={$id}, titulo={$titulo}, autor={$autor}, paginas={$paginas}, local_leitura={$local_leitura}, data_inicio={$data_inicio}, data_fim={$data_fim}, natureza={$natureza}, avaliacao={$avaliacao}";



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

    if (empty($id) || !is_numeric($id)) {
        $result_error = 'ID do livro inválido.';
        return;
    }

    if (empty($titulo)) {
        $result_error = 'Título é obrigatório.';
        return;
    }

    if (empty($data_inicio)) {
        $result_error = 'Data de início é obrigatória.';
        return;
    }

    $dt_inicio = DateTime::createFromFormat('Y-m-d', $data_inicio);
    if (!$dt_inicio) {
        $result_error = 'Data de início inválida.';
        return;
    }

    $mes        = $dt_inicio->format('m/Y');
    $tempo_dias = null;

    if (!empty($data_fim)) {
        $dt_fim = DateTime::createFromFormat('Y-m-d', $data_fim);
        if ($dt_fim) {
            $tempo_dias = (int)$dt_inicio->diff($dt_fim)->days;
        }
    }

    try {
        $db = new DataBase();

        // ─────────────────────────────────────────────────────────────
        // BUSCA DADOS DO LIVRO NA TABELA DE ORIGEM
        // ─────────────────────────────────────────────────────────────
        $tabelaSQL = $TABELAS_PERMITIDAS[$local_leitura];

        $dadosLivro = $db->GetOne("
            SELECT TOP 1
                natureza,
                tema,
                tipo_midia,
                paginas
            FROM {$tabelaSQL}
            WHERE id = :id_livro
        ", [':id_livro' => (int)$id]);

        if (!$dadosLivro) {
            $result_error = "Livro não encontrado na tabela {$local_leitura}";
            return;
        }

        $naturezaLivro = $dadosLivro['natureza'] ?? null;
        $tema       = $dadosLivro['tema']       ?? null;
        $tipo_midiaLivro = $dadosLivro['tipo_midia'] ?? null;
        $paginasLivro = $dadosLivro['paginas']  ?? null;

        // Se natureza não vier do POST, usa a do livro
        if ($natureza === '' && $naturezaLivro !== null) {
            $natureza = $naturezaLivro;
        }

        // Se páginas não vierem do POST, usa as do livro
        if ($paginas === '' && $paginasLivro !== null) {
            $paginas = (string)$paginasLivro;
        }

        // Se tipo de mídia não vier do POST, usa o do livro
        if ($tipo_midia === '' && $tipo_midiaLivro !== null) {
            $tipo_midia = (string)$tipo_midiaLivro;
        }

        // ─────────────────────────────────────────────────────────────
        // VERIFICA SE JÁ EXISTE LEITURA PARA ESTE LIVRO
        // ─────────────────────────────────────────────────────────────
        $leituraExistente = $db->GetOne(
            "SELECT TOP 1 id, data_fim, avaliacao, natureza
             FROM [Biblioteca].[dbo].[Leituras]
             WHERE id_leitura = :id_livro",
            [':id_livro' => (int)$id]
        );

        $fim = $data_fim !== '' ? $data_fim : null;

        // ─────────────────────────────────────────────────────────────
        // SE JÁ EXISTE, ATUALIZAR COM DADOS FALTANTES
        // ─────────────────────────────────────────────────────────────
        if ($leituraExistente) {
            $updateFields = [];
            $updateParams = [':id_leitura' => $leituraExistente['id']];

            // Atualiza data_fim se vier no payload e não houver na tabela
            if ($fim !== null && $leituraExistente['data_fim'] === null) {
                $updateFields[] = 'data_fim = :data_fim';
                $updateParams[':data_fim'] = $fim;
                
                if ($tempo_dias !== null) {
                    $updateFields[] = 'tempo_dias = :tempo_dias';
                    $updateParams[':tempo_dias'] = $tempo_dias;
                }
            }

            // Atualiza avaliacao se vier no payload e não houver na tabela
            if ($avaliacao !== '' && $leituraExistente['avaliacao'] === null) {
                $updateFields[] = 'avaliacao = :avaliacao';
                $updateParams[':avaliacao'] = (float)$avaliacao;
            }

            // Atualiza natureza se vier no payload e não houver na tabela
            if ($natureza !== '' && $leituraExistente['natureza'] === null) {
                $updateFields[] = 'natureza = :natureza';
                $updateParams[':natureza'] = $natureza;
            }

            // Se há campos para atualizar, executa UPDATE
            if (!empty($updateFields)) {
                $updateSQL = "UPDATE [Biblioteca].[dbo].[Leituras]
                             SET " . implode(', ', $updateFields) . "
                             WHERE id = :id_leitura";
                $db->ExecuteNonQuery($updateSQL, $updateParams);
            }
        } else {
            // ─────────────────────────────────────────────────────────────
            // SE NÃO EXISTE, INSERIR NOVO REGISTRO
            // ─────────────────────────────────────────────────────────────
            $camposBase = [
                'id_leitura',   // ID do livro (chave de referência)
                'titulo',
                'autor',
                'mes',
                'data_inicio',
                'sexo_autor',
                'pais',
                'raça',
                'natureza',
                'tema',
                'tipo_midia',
                'paginas',
            ];

            $valsBase = [
                (int)$id,
                $titulo,
                $autor ?: null,
                $mes ?: null,
                $data_inicio ?: null,
                $sexo_autor ?: null,
                $pais ?: null,
                $raca ?: null,
                $natureza ?: null,
                $tema ?: null,
                $tipo_midia ?: null,
                $paginas !== '' ? (int)$paginas : null,
            ];

            // Campos opcionais
            if ($avaliacao !== '') {
                $camposBase[] = 'avaliacao';
                $valsBase[]   = (float)$avaliacao;
            }

            // Converte local_leitura para id_local_leitura
            $id_local_leitura = null;
            if ($local_leitura !== '') {
                $localMap = $db->GetOne(
                    "SELECT id FROM [Biblioteca].[dbo].[LocalLeitura] WHERE vLocal_Leitura = :local",
                    [':local' => $local_leitura]
                );
                if ($localMap) {
                    $id_local_leitura = (int)$localMap['id'];
                }
            }

            $camposComLocal = $camposBase;
            $valsComLocal   = $valsBase;

            if ($id_local_leitura !== null) {
                $camposComLocal[] = 'id_local_leitura';
                $valsComLocal[]   = $id_local_leitura;
            }

            // Função para montar INSERT
            $makeInsert = function(array $cols, array $vals, ?string $dataFim, ?int $tempoDias): array {
                $c = $cols;
                $v = $vals;

                if ($dataFim !== null) {
                    $c[] = 'data_fim';
                    $v[] = $dataFim;
                }
                if ($tempoDias !== null) {
                    $c[] = 'tempo_dias';
                    $v[] = $tempoDias;
                }

                $colList = implode(', ', array_map(fn($x) => "[{$x}]", $c));
                $phList  = implode(', ', array_map(fn($i) => ':v'.$i, range(0, count($c)-1)));
                $params  = [];

                foreach ($v as $i => $val) {
                    $params[':v'.$i] = $val;
                }

                $sql = "INSERT INTO [Biblioteca].[dbo].[Leituras] ({$colList}) VALUES ({$phList})";
                return [$sql, $params];
            };

            // Tentativas de insert (com local, sem local, sem data_fim/tempo_dias)
            $tentativas = [
                $makeInsert($camposComLocal, $valsComLocal, $fim, $tempo_dias),
                $makeInsert($camposBase,     $valsBase,     $fim, $tempo_dias),
                $makeInsert($camposBase,     $valsBase,     null, null),
            ];

            $inserido = false;
            $lastErr  = null;

            foreach ($tentativas as [$sqlTry, $pTry]) {
                try {
                    $db->ExecuteNonQuery($sqlTry, $pTry);
                    $inserido = true;
                    break;
                } catch (Exception $e) {
                    $lastErr = $e;
                }
            }

            if (!$inserido) {
                throw new Exception('Erro ao inserir leitura: ' . ($lastErr ? $lastErr->getMessage() : ''));
            }
        }

        // ─────────────────────────────────────────────────────────────
        // REMOVE DE LEITURAS EM ANDAMENTO (PELO ID DO LIVRO)
        // ─────────────────────────────────────────────────────────────
        try {
            $db->ExecuteNonQuery(
                "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                 WHERE id_leitura = :id_livro",
                [':id_livro' => (int)$id]
            );
        } catch (Exception $e) {
            // silencioso
        }

        // ─────────────────────────────────────────────────────────────
        // ATUALIZA STATUS = Lido NAS TABELAS
        // ─────────────────────────────────────────────────────────────
        if (!empty($data_fim)) {
            // Atualiza status na tabela de origem do livro
            try {
                $db->ExecuteNonQuery(
                    "UPDATE {$tabelaSQL}
                     SET status = 'Lido'
                     WHERE id = :id_livro",
                    [':id_livro' => (int)$id]
                );
            } catch (Exception $e) {
                // silencioso
            }
        }

        // ─────────────────────────────────────────────────────────────
        // FINAL
        // ─────────────────────────────────────────────────────────────
        $result_status = true;
        $result_data   = [
            'message'    => 'Leitura salva com sucesso.',
            'mes'        => $mes,
            'tempo_dias' => $tempo_dias,
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao salvar leitura: ' . $e->getMessage();
    }
}
