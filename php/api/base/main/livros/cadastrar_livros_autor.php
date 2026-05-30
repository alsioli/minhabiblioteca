<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$body  = json_decode(file_get_contents('php://input'), true);
$dados = $body['dados'] ?? [];

if (empty($dados) || !is_array($dados)) {
    echo json_encode(['status' => false, 'error' => 'Nenhum dado recebido.']);
    exit;
}

// Colunas aceitas na tabela LivrosAutor
$COLUNAS_DB = [
    'Titulo', 'TituloPortugues', 'Autor', 'Serie', 'Volume',
    'Genero', 'Tema', 'Paginas', 'Status', 'Pais', 'DataPublicacao',
];

$sql = "
    INSERT INTO [Biblioteca].[dbo].[LivrosAutor]
        ([Titulo], [TituloPortugues], [Autor], [Serie], [Volume],
         [Genero], [Tema], [Paginas], [Status], [Pais], [DataPublicacao])
    VALUES
        (:Titulo, :TituloPortugues, :Autor, :Serie, :Volume,
         :Genero, :Tema, :Paginas, :Status, :Pais, :DataPublicacao)
";

try {
    $db = new DataBase();
    $db->beginTransaction();

    $inseridos = 0;
    $erros     = [];

    foreach ($dados as $i => $row) {
        // Título é obrigatório
        if (empty($row['Titulo'])) {
            $erros[] = "Linha " . ($i + 1) . ": Título vazio, ignorado.";
            continue;
        }

        $params = [];
        foreach ($COLUNAS_DB as $col) {
            $val = $row[$col] ?? null;

            // Converte string vazia em NULL
            if ($val === '' || $val === null) {
                $params[':' . $col] = null;
                continue;
            }

            // Trata Paginas e Volume como inteiros
            if ($col === 'Paginas' || $col === 'Volume') {
                $params[':' . $col] = is_numeric($val) ? (int)$val : null;
                continue;
            }

            $params[':' . $col] = trim($val);
        }

        try {
            $db->ExecuteNonQuery($sql, $params);
            $inseridos++;
        } catch (Exception $ex) {
            $erros[] = "Linha " . ($i + 1) . " (" . ($row['Titulo'] ?? '?') . "): " . $ex->getMessage();
        }
    }

    $db->commit();

    echo json_encode([
        'status'    => true,
        'inseridos' => $inseridos,
        'erros'     => $erros,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $db->rollback();
    echo json_encode(['status' => false, 'error' => 'Erro na transação: ' . $e->getMessage()]);
}
