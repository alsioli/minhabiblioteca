<?php
/**
 * EXEMPLOS DE USO - Prepared Statements na Classe Database
 * Como usar os métodos implementados
 */

// Assumindo que você já tem a conexão estabelecida
// $db = new Database();
// $db->connect(...);

// ============================================
// EXEMPLO 1: INSERT com Prepared Statement
// ============================================
$stmt = $db->prepare("INSERT INTO usuarios (nome, email, ativo) VALUES (?, ?, ?)");
if ($stmt) {
    // Para SQL Server, os parâmetros já devem estar no prepare
    // Use executeNonQuery ao invés
}

// FORMA RECOMENDADA: executeNonQuery (mais simples)
$result = $db->executeNonQuery(
    "INSERT INTO usuarios (nome, email, ativo) VALUES (?, ?, ?)",
    ['João Silva', 'joao@email.com', 1]
);

if ($result['success']) {
    echo "Usuário inserido! ID: " . $result['insertId'];
    echo "\nLinhas afetadas: " . $result['affectedRows'];
} else {
    echo "Erro: " . $result['message'];
}


// ============================================
// EXEMPLO 2: UPDATE com Prepared Statement
// ============================================
$result = $db->executeNonQuery(
    "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
    ['João da Silva', 'joao.silva@email.com', 123]
);

if ($result['success']) {
    echo "Usuário atualizado! Linhas: " . $result['affectedRows'];
}


// ============================================
// EXEMPLO 3: DELETE com Prepared Statement
// ============================================
$result = $db->executeNonQuery(
    "DELETE FROM usuarios WHERE id = ?",
    [123]
);

if ($result['success']) {
    echo "Usuário deletado!";
}


// ============================================
// EXEMPLO 4: SELECT com Prepared Statement
// ============================================
$usuarios = $db->executeQuery(
    "SELECT * FROM usuarios WHERE ativo = ? AND cidade = ?",
    [1, 'Aracaju']
);

if ($usuarios !== false) {
    foreach ($usuarios as $usuario) {
        echo $usuario['nome'] . " - " . $usuario['email'] . "\n";
    }
} else {
    echo "Erro ao buscar usuários";
}


// ============================================
// EXEMPLO 5: SELECT com LIKE
// ============================================
$nome = 'João';
$usuarios = $db->executeQuery(
    "SELECT * FROM usuarios WHERE nome LIKE ?",
    ['%' . $nome . '%']
);


// ============================================
// EXEMPLO 6: INSERT com múltiplos registros
// ============================================
$novosUsuarios = [
    ['Maria Silva', 'maria@email.com', 1],
    ['Pedro Santos', 'pedro@email.com', 1],
    ['Ana Costa', 'ana@email.com', 1]
];

foreach ($novosUsuarios as $dados) {
    $result = $db->executeNonQuery(
        "INSERT INTO usuarios (nome, email, ativo) VALUES (?, ?, ?)",
        $dados
    );
    
    if ($result['success']) {
        echo "Inserido ID: " . $result['insertId'] . "\n";
    }
}


// ============================================
// EXEMPLO 7: Transação com múltiplas queries
// ============================================
$queries = [
    [
        'query' => 'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
        'params' => ['Carlos Lima', 'carlos@email.com']
    ],
    [
        'query' => 'INSERT INTO logs (acao, descricao) VALUES (?, ?)',
        'params' => ['cadastro', 'Novo usuário cadastrado']
    ],
    [
        'query' => 'UPDATE contadores SET total = total + 1 WHERE tipo = ?',
        'params' => ['usuarios']
    ]
];

$result = $db->executeTransaction($queries);

if ($result['success']) {
    echo "Transação concluída! Total de linhas afetadas: " . $result['totalAffected'];
} else {
    echo "Erro na transação: " . $result['message'];
    echo "\nAs alterações foram revertidas (rollback)";
}


// ============================================
// EXEMPLO 8: SELECT com JOIN
// ============================================
$dados = $db->executeQuery(
    "SELECT u.*, c.nome as cidade_nome 
     FROM usuarios u 
     INNER JOIN cidades c ON u.cidade_id = c.id 
     WHERE u.ativo = ? AND c.estado = ?",
    [1, 'SE']
);


// ============================================
// EXEMPLO 9: UPDATE condicional
// ============================================
$result = $db->executeNonQuery(
    "UPDATE vistorias 
     SET status = ?, data_conclusao = GETDATE() 
     WHERE id = ? AND status != ?",
    ['concluida', 456, 'cancelada']
);


// ============================================
// EXEMPLO 10: SELECT COUNT
// ============================================
$resultado = $db->executeQuery(
    "SELECT COUNT(*) as total FROM usuarios WHERE ativo = ?",
    [1]
);

if ($resultado && count($resultado) > 0) {
    $total = $resultado[0]['total'];
    echo "Total de usuários ativos: " . $total;
}


// ============================================
// EXEMPLO 11: INSERT com retorno de ID
// ============================================
$result = $db->executeNonQuery(
    "INSERT INTO vistorias (tipo, data_criacao, usuario_id) VALUES (?, GETDATE(), ?)",
    ['Tipo A', 1]
);

if ($result['success']) {
    $vistoriaId = $result['insertId'];
    
    // Agora inserir itens da vistoria
    $itens = [
        ['Item 1', 'OK'],
        ['Item 2', 'NOK'],
        ['Item 3', 'OK']
    ];
    
    foreach ($itens as $item) {
        $db->executeNonQuery(
            "INSERT INTO vistoria_itens (vistoria_id, descricao, status) VALUES (?, ?, ?)",
            [$vistoriaId, $item[0], $item[1]]
        );
    }
}


// ============================================
// EXEMPLO 12: UPDATE ou INSERT (UPSERT)
// ============================================
// Primeiro verifica se existe
$existe = $db->executeQuery(
    "SELECT id FROM usuarios WHERE email = ?",
    ['teste@email.com']
);

if (count($existe) > 0) {
    // UPDATE
    $result = $db->executeNonQuery(
        "UPDATE usuarios SET nome = ? WHERE email = ?",
        ['Novo Nome', 'teste@email.com']
    );
} else {
    // INSERT
    $result = $db->executeNonQuery(
        "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
        ['Novo Nome', 'teste@email.com']
    );
}


// ============================================
// EXEMPLO 13: DELETE múltiplos registros
// ============================================
$idsParaDeletar = [1, 2, 3, 4, 5];

// Cria placeholders: ?, ?, ?, ?, ?
$placeholders = implode(',', array_fill(0, count($idsParaDeletar), '?'));

$result = $db->executeNonQuery(
    "DELETE FROM usuarios WHERE id IN ($placeholders)",
    $idsParaDeletar
);

echo "Deletados: " . $result['affectedRows'] . " registros";


// ============================================
// EXEMPLO 14: Stored Procedure
// ============================================
$result = $db->executeQuery(
    "EXEC sp_BuscarUsuariosPorCidade @cidade = ?, @ativo = ?",
    ['Aracaju', 1]
);


// ============================================
// EXEMPLO 15: Obter último ID inserido
// ============================================
$result = $db->executeNonQuery(
    "INSERT INTO logs (acao) VALUES (?)",
    ['teste']
);

// Alternativa 1: Pegar do resultado
$id1 = $result['insertId'];

// Alternativa 2: Método específico
$id2 = $db->getLastInsertId();


// ============================================
// EXEMPLO 16: Proteção contra SQL Injection
// ============================================

// ❌ NUNCA FAÇA ISSO (vulnerável):
$nome = $_POST['nome']; // pode conter '; DROP TABLE usuarios; --
$query = "SELECT * FROM usuarios WHERE nome = '$nome'";

// ✅ SEMPRE USE PREPARED STATEMENTS:
$nome = $_POST['nome'];
$result = $db->executeQuery(
    "SELECT * FROM usuarios WHERE nome = ?",
    [$nome]
);

// O SQL Server vai escapar automaticamente qualquer tentativa de injection


// ============================================
// EXEMPLO 17: API Endpoint completo
// ============================================

// arquivo: api/usuarios/insert.php
header('Content-Type: application/json');

try {
    // Recebe dados do POST
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Valida dados
    if (empty($data['nome']) || empty($data['email'])) {
        throw new Exception("Nome e email são obrigatórios");
    }
    
    // Executa INSERT com prepared statement
    $result = $db->executeNonQuery(
        "INSERT INTO usuarios (nome, email, ativo, data_cadastro) VALUES (?, ?, ?, GETDATE())",
        [$data['nome'], $data['email'], 1]
    );
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'insertId' => $result['insertId'],
            'affectedRows' => $result['affectedRows'],
            'message' => 'Usuário cadastrado com sucesso'
        ]);
    } else {
        throw new Exception($result['message']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

?>
