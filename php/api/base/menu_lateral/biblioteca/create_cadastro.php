<?php

require_once __DIR__ . '/../../../../utils/function/database.php';

function normalizeTipoCodigo($tipo_codigo) {
    $tipo_codigo = trim((string)$tipo_codigo);
    $tipo_codigo = strtoupper($tipo_codigo);
    $tipo_codigo = str_replace(['ISBN_10', 'ISBN10'], 'ISBN-10', $tipo_codigo);
    $tipo_codigo = str_replace(['ISBN_13', 'ISBN13'], 'ISBN-13', $tipo_codigo);

    if ($tipo_codigo === '10') {
        return 'ISBN-10';
    }
    if ($tipo_codigo === '13' || $tipo_codigo === '14') {
        return 'ISBN-13';
    }
    if ($tipo_codigo === 'ASIN') {
        return 'ASIN';
    }

    return $tipo_codigo;
}

function normalizeCodigoForStorage($tipo_codigo, $codigo) {
    $tipo_codigo = normalizeTipoCodigo($tipo_codigo);
    $codigo = trim((string)$codigo);

    if ($tipo_codigo === 'ISBN-10' || $tipo_codigo === 'ISBN-13') {
        $codigo = preg_replace('/[^0-9Xx]/', '', $codigo);
        $codigo = strtoupper($codigo);
    }

    return $codigo;
}

// Inicializar variáveis de resposta
$result_status = false;
$result_error = '';
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
echo json_encode($response);

function PostMethod() {

    global $result_status, $result_error, $result_data;

    $data          = $_POST;
    $localCadastro = trim($data['local_cadastro'] ?? 'Biblioteca');

    // titulo e autor são obrigatórios em todas as tabelas
    // codigo e tipo_codigo só são obrigatórios na tabela Biblioteca (Livros)
    $requiredFields = ['titulo', 'autor'];
    if ($localCadastro === 'Biblioteca') {
        $requiredFields[] = 'codigo';
        $requiredFields[] = 'tipo_codigo';
    }

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $result_status = false;
            $result_error  = 'O campo ' . $field . ' é obrigatório.';
            return;
        }
    }

    // Campos comuns a todas as tabelas
    $map = [
        'titulo'      => 'titulo',
        'autor'       => 'autor',
        'serie'       => 'serie',
        'volume'      => 'volume',
        'genero'      => 'genero',
        'tema'        => 'tema',
        'editora'     => 'editora',
        'paginas'     => 'paginas',
        'status'      => 'status',
        'avaliacao'   => 'avaliacao',
        'emprestimo'  => 'emprestimo',
        // Campos exclusivos de cada tabela
        'ku_tipo'     => 'ku_tipo',
        'skeelo_tipo' => 'skeelo_tipo',
        'pais'        => 'pais',
        'tipo_midia'  => 'tipo_midia',
        'favorito'    => 'favorito',
        'biblion_tipo'=> 'biblion_tipo',
        // Campos exclusivos da tabela Biblioteca (Livros)
        'sexo_autor'  => 'sexo_autor',
        'nacionalidade'=> 'nacionalidade',
        'raca'        => 'raça',
        'tipo_edicao' => 'tipo_edicao',
        'natureza'    => 'natureza',
        'data_compra' => 'data_compra',
        'valor_compra'=> 'valor_compra',
        'local_compra'=> 'local_compra',
        'observacoes'  => 'observacoes',
    ];

    $dadosCorrigidos = [];
    foreach ($map as $formField => $dbField) {
        if (isset($data[$formField]) && trim($data[$formField]) !== '') {
            $dadosCorrigidos[$dbField] = $data[$formField];
        }
    }

    // Processa codigo/tipo_codigo somente para a tabela Biblioteca
    if ($localCadastro === 'Biblioteca') {
        // mes_leitura (YYYY-MM) → coluna mes_leitura + derivar mes e ano (só existem em Livros)
        $mesLeitura = trim($data['mes_leitura'] ?? '');
        if ($mesLeitura !== '' && preg_match('/^(\d{4})-(\d{2})$/', $mesLeitura, $ml)) {
            $dadosCorrigidos['mes_leitura'] = $mesLeitura;
            $dadosCorrigidos['ano']         = (int) $ml[1];
            $dadosCorrigidos['mes']         = (int) $ml[2];
        }
        $codigo      = trim($data['codigo'] ?? '');
        $tipo_codigo = normalizeTipoCodigo($data['tipo_codigo'] ?? '');

        $codigoColumnMap = [
            'ASIN'    => 'nASIN',
            'ISBN-10' => 'nISBN_10',
            'ISBN-13' => 'nISBN_13',
        ];

        if ($codigo === '' || !isset($codigoColumnMap[$tipo_codigo])) {
            $result_status = false;
            $result_error  = 'Código e tipo de código inválidos.';
            return;
        }

        $dadosCorrigidos[$codigoColumnMap[$tipo_codigo]] = normalizeCodigoForStorage($tipo_codigo, $codigo);
    }

    if (empty($dadosCorrigidos)) {
        $result_status = false;
        $result_error = 'Nenhum dado enviado para cadastro.';
        return;
    }

    $columns = [];
    $placeholders = [];
    $params = [];
    $idx = 0;

    // Usa índices numéricos nos parâmetros para evitar problemas com
    // caracteres especiais em nomes de colunas (ex: "raça" → ":raça" é inválido no PDO)
    foreach ($dadosCorrigidos as $field => $value) {
        $paramKey       = ':p' . $idx++;
        $columns[]      = "[{$field}]";
        $placeholders[] = $paramKey;
        $params[$paramKey] = $value;
    }

    // Redireciona para a tabela correta conforme o local selecionado (whitelist)
    $tabelaMap = [
        'Skeelo'            => '[Biblioteca].[dbo].[LeiturasSKEELO]',
        'Biblion'           => '[Biblioteca].[dbo].[LivrosBiblion]',
        'MEC_Livros'        => '[Biblioteca].[dbo].[LivrosMEC]',
        'Audible'           => '[Biblioteca].[dbo].[LivrosAudible]',
        'Kindle_Unlimited'  => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
        'Biblioteca'        => '[Biblioteca].[dbo].[Livros]',
    ];
    $localCadastro = trim($data['local_cadastro'] ?? 'Biblioteca');
    $tabelaDestino = $tabelaMap[$localCadastro] ?? '[Biblioteca].[dbo].[Livros]';

    $sqlQuery = "INSERT INTO {$tabelaDestino} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sqlQuery, $params);
        $result_status = true;
        $result_data = ['message' => 'Livro cadastrado com sucesso'];

        // Upsert na tabela Autores (silencioso — não falha o cadastro se der erro)
        $autorNome    = trim($data['autor']         ?? '');
        $autorSexo    = trim($data['sexo_autor']    ?? '');
        $autorRaca    = trim($data['raca']          ?? '');
        $autorNac     = trim($data['nacionalidade'] ?? '');

        if ($autorNome !== '') {
            try {
                $db->ExecuteNonQuery(
                    "IF NOT EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Autor] WHERE LOWER(nome_autor) = LOWER(:nome))
                         INSERT INTO [Biblioteca].[dbo].[Autor] (nome_autor, sexo_autor, [raça], nacionalidade)
                         VALUES (:nome2, NULLIF(:sexo,''), NULLIF(:raca,''), NULLIF(:nac,''))",
                    [
                        ':nome'  => $autorNome, ':nome2' => $autorNome,
                        ':sexo'  => $autorSexo, ':raca'  => $autorRaca, ':nac' => $autorNac,
                    ]
                );
            } catch (Exception $e) {
                // Tabela Autores pode não existir ainda — ignora silenciosamente
            }
        }

        // Se status = 'Lendo' e data_inicio_leitura foi informado, registra em Leituras e LeiturasEmAndamento
        $statusVal   = trim($data['status']               ?? '');
        $dataInicio  = trim($data['data_inicio_leitura']  ?? '');
        $tituloVal   = trim($data['titulo']               ?? '');
        $autorVal    = trim($data['autor']                ?? '');
        $paginasVal  = trim($data['paginas']              ?? '');
        $tipoMidia   = trim($data['tipo_midia']           ?? '');
        $localLeitura = $localCadastro;

        if (strtolower($statusVal) === 'lendo' && $dataInicio !== '' && $tituloVal !== '') {
            $dtObj = DateTime::createFromFormat('Y-m-d', $dataInicio);
            if ($dtObj) {
                $mesLeitura = $dtObj->format('m/Y');

                $camposL = ['titulo', 'autor', 'mes', 'data_inicio', 'local_leitura'];
                $valsL   = [
                    $tituloVal,
                    $autorVal ?: null,
                    $mesLeitura,
                    $dataInicio,
                    $localLeitura,
                ];
                if ($paginasVal !== '') { $camposL[] = 'paginas'; $valsL[] = (int)$paginasVal; }
                if ($tipoMidia  !== '') { $camposL[] = 'tipo_midia'; $valsL[] = $tipoMidia; }

                $colListL = implode(', ', array_map(fn($c) => "[{$c}]", $camposL));
                $phListL  = implode(', ', array_map(fn($i) => ':lp'.$i, range(0, count($camposL)-1)));
                $paramsL  = [];
                foreach ($valsL as $i => $v) { $paramsL[':lp'.$i] = $v; }

                $idLeitura = null;
                try {
                    $rowL = $db->GetOne(
                        "INSERT INTO [Biblioteca].[dbo].[Leituras] ({$colListL}) OUTPUT INSERTED.id VALUES ({$phListL})",
                        $paramsL
                    );
                    $idLeitura = $rowL['id'] ?? null;
                } catch (Exception $e) {
                    // Tenta sem local_leitura
                    $camposL2 = array_filter($camposL, fn($c) => $c !== 'local_leitura');
                    $camposL2 = array_values($camposL2);
                    $valsL2   = array_slice($valsL, 0, count($camposL2));
                    $colL2    = implode(', ', array_map(fn($c) => "[{$c}]", $camposL2));
                    $phL2     = implode(', ', array_map(fn($i) => ':lp2'.$i, range(0, count($camposL2)-1)));
                    $pL2      = [];
                    foreach ($valsL2 as $i => $v) { $pL2[':lp2'.$i] = $v; }
                    try {
                        $rowL = $db->GetOne(
                            "INSERT INTO [Biblioteca].[dbo].[Leituras] ({$colL2}) OUTPUT INSERTED.id VALUES ({$phL2})",
                            $pL2
                        );
                        $idLeitura = $rowL['id'] ?? null;
                    } catch (Exception $e2) { /* silencioso */ }
                }

                if ($idLeitura) {
                    try {
                        $db->ExecuteNonQuery("
                            INSERT INTO [Biblioteca].[dbo].[LeiturasEmAndamento]
                                (id_leitura, titulo, autor, paginas, tipo_midia, data_inicio,
                                 dt_alteracao, tipo_input, percentual, pagina_atual, tempo_leitura)
                            VALUES
                                (:la0, :la1, :la2, :la3, :la4, :la5,
                                 GETDATE(), 'percentual', 0, 0, 0)
                        ", [
                            ':la0' => (int)$idLeitura,
                            ':la1' => $tituloVal,
                            ':la2' => $autorVal ?: null,
                            ':la3' => $paginasVal !== '' ? (int)$paginasVal : null,
                            ':la4' => $tipoMidia ?: null,
                            ':la5' => $dataInicio,
                        ]);
                    } catch (Exception $e) { /* silencioso */ }
                }
            }
        }

    } catch (Exception $e) {
        $result_status = false;
        $result_error = 'Erro ao cadastrar: ' . $e->getMessage();
    }
}
