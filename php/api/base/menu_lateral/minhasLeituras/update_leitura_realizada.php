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

    $id            = trim($_POST['id']            ?? '');
    $titulo        = trim($_POST['titulo']        ?? '');
    $autor         = trim($_POST['autor']         ?? '');
    $paginas       = trim($_POST['paginas']       ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');
    $data_inicio   = trim($_POST['data_inicio']   ?? '');
    $data_fim      = trim($_POST['data_fim']      ?? '');
    $natureza      = trim($_POST['natureza']      ?? '');
    $avaliacao     = trim($_POST['avaliacao']     ?? '');

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

        if (!empty($id) && is_numeric($id)) {
            // ── UPDATE no registro existente ─────────────────────────
            $idx        = 0;
            $setClauses = [];
            $params     = [':id' => (int)$id];

            $setClauses[] = "[data_inicio] = :p" . $idx; $params[':p'.$idx++] = $data_inicio;
            $setClauses[] = "[mes]         = :p" . $idx; $params[':p'.$idx++] = $mes;
            $setClauses[] = "[natureza]    = :p" . $idx; $params[':p'.$idx++] = $natureza !== '' ? $natureza : null;
            $setClauses[] = "[avaliacao]   = :p" . $idx; $params[':p'.$idx++] = $avaliacao !== '' ? (float)$avaliacao : null;

            $setFim   = $setClauses;
            $prmFim   = $params;
            $setFim[] = "[data_fim]   = :p" . $idx;   $prmFim[':p'.$idx++] = $data_fim !== '' ? $data_fim : null;
            $setFim[] = "[tempo_dias] = :p" . $idx;   $prmFim[':p'.$idx++] = $tempo_dias;

            try {
                $db->ExecuteNonQuery(
                    "UPDATE [Biblioteca].[dbo].[Leituras] SET " . implode(', ', $setFim) . " WHERE id = :id",
                    $prmFim
                );
            } catch (Exception $e) {
                $db->ExecuteNonQuery(
                    "UPDATE [Biblioteca].[dbo].[Leituras] SET " . implode(', ', $setClauses) . " WHERE id = :id",
                    $params
                );
            }

            // Remove de LeiturasEmAndamento
            try {
                $db->ExecuteNonQuery(
                    "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento] WHERE id_leitura = :id_del",
                    [':id_del' => (int)$id]
                );
            } catch (Exception $e) { /* silencioso */ }

        } else {
            // ── INSERT — livro ainda não existe em Leituras ──────────

            // Evita duplicata: mesmo título + autor + data_fim já registrado
            if ($fim !== null) {
                $autorWhere = $autor !== '' ? "AND LOWER(ISNULL(autor,'')) = LOWER(:autor_chk)" : '';
                $paramsChk  = [':titulo_chk' => $titulo, ':fim_chk' => $fim];
                if ($autor !== '') $paramsChk[':autor_chk'] = $autor;
                $jaExiste = $db->GetOne(
                    "SELECT TOP 1 id FROM [Biblioteca].[dbo].[Leituras]
                     WHERE LOWER(titulo) = LOWER(:titulo_chk)
                       AND data_fim = :fim_chk
                       {$autorWhere}",
                    $paramsChk
                );
                if ($jaExiste) {
                    $result_error = 'Já existe uma leitura com mesmo título, autor e data de conclusão.';
                    return;
                }
            }

            // Campos base (sempre existem)
            $camposBase = ['titulo', 'autor', 'mes', 'data_inicio'];
            $valsBase   = [$titulo, $autor !== '' ? $autor : null, $mes, $data_inicio];

            if ($paginas  !== '') { $camposBase[] = 'paginas';  $valsBase[] = (int)$paginas; }
            if ($natureza !== '') { $camposBase[] = 'natureza'; $valsBase[] = $natureza; }
            if ($avaliacao!== '') { $camposBase[] = 'avaliacao';$valsBase[] = (float)$avaliacao; }

            // Variações: com/sem local_leitura, com/sem data_fim+tempo_dias
            $camposComLocal = $camposBase;
            $valsComLocal   = $valsBase;
            if ($local_leitura !== '') {
                $camposComLocal[] = 'local_leitura';
                $valsComLocal[]   = $local_leitura;
            }

            function makeInsert(array $cols, array $vals, ?string $dataFim, ?int $tempoDias): array {
                $c = $cols; $v = $vals;
                if ($dataFim !== null) { $c[] = 'data_fim';   $v[] = $dataFim; }
                if ($tempoDias !== null){ $c[] = 'tempo_dias'; $v[] = $tempoDias; }
                $colList = implode(', ', array_map(fn($x) => "[{$x}]", $c));
                $phList  = implode(', ', array_map(fn($i) => ':v'.$i, range(0, count($c)-1)));
                $params  = [];
                foreach ($v as $i => $val) { $params[':v'.$i] = $val; }
                return ["INSERT INTO [Biblioteca].[dbo].[Leituras] ({$colList}) VALUES ({$phList})", $params];
            }

            $fim = $data_fim !== '' ? $data_fim : null;

            // Tenta em cascata: mais completo → menos colunas
            $tentativas = [
                makeInsert($camposComLocal, $valsComLocal, $fim, $tempo_dias), // com local + datas
                makeInsert($camposBase,     $valsBase,     $fim, $tempo_dias), // sem local, com datas
                makeInsert($camposBase,     $valsBase,     null, null),        // só campos base
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

            // Também remove de LeiturasEmAndamento pelo título
            try {
                $db->ExecuteNonQuery(
                    "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                     WHERE id_leitura IN (SELECT id FROM [Biblioteca].[dbo].[Leituras] WHERE titulo = :titulo)",
                    [':titulo' => $titulo]
                );
            } catch (Exception $e) { /* silencioso */ }
        }

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
