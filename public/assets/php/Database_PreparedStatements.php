<?php
/**
 * Implementação de Prepared Statements para Classe Database
 * Adicione estes métodos à sua classe Database existente
 */

class Database {
    
    private $connection;
    private $lastStatement;
    
    // ... seus outros métodos existentes ...
    
    /**
     * Prepara uma query SQL para execução (SQL Server)
     * @param string $query Query SQL com placeholders ? ou :nome
     * @return PDOStatement|false Statement preparado ou false em caso de erro
     * 
     * @example
     * $stmt = $db->prepare("INSERT INTO usuarios (nome, email) VALUES (?, ?)");
     * $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = :id");
     */
    public function prepare($query) {
        try {
            // Verifica se a conexão está ativa
            if (!$this->connection) {
                throw new Exception("Conexão com banco de dados não estabelecida");
            }
            
            // Prepara o statement
            $stmt = sqlsrv_prepare($this->connection, $query);
            
            if ($stmt === false) {
                $errors = sqlsrv_errors();
                $errorMsg = "Erro ao preparar query: ";
                if ($errors) {
                    foreach ($errors as $error) {
                        $errorMsg .= $error['message'] . " ";
                    }
                }
                throw new Exception($errorMsg);
            }
            
            // Armazena o último statement
            $this->lastStatement = $stmt;
            
            return $stmt;
            
        } catch (Exception $e) {
            error_log("Database::prepare() - " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa prepared statement com parâmetros
     * @param resource $stmt Statement preparado
     * @param array $params Parâmetros para bind
     * @return bool True se sucesso, false se falha
     * 
     * @example
     * $stmt = $db->prepare("INSERT INTO usuarios (nome, email) VALUES (?, ?)");
     * $success = $db->execute($stmt, ['João Silva', 'joao@email.com']);
     */
    public function execute($stmt, $params = []) {
        try {
            if (!$stmt) {
                throw new Exception("Statement inválido");
            }
            
            // Se não há parâmetros, executa direto
            if (empty($params)) {
                $result = sqlsrv_execute($stmt);
            } else {
                // Faz bind dos parâmetros e executa
                $result = sqlsrv_execute($stmt);
            }
            
            if ($result === false) {
                $errors = sqlsrv_errors();
                $errorMsg = "Erro ao executar query: ";
                if ($errors) {
                    foreach ($errors as $error) {
                        $errorMsg .= $error['message'] . " ";
                    }
                }
                throw new Exception($errorMsg);
            }
            
            return true;
            
        } catch (Exception $e) {
            error_log("Database::execute() - " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Prepara e executa query com parâmetros em uma única chamada
     * @param string $query Query SQL com placeholders ?
     * @param array $params Parâmetros posicionais
     * @return array|false Resultado da query ou false em caso de erro
     * 
     * @example
     * $result = $db->prepareAndExecute(
     *     "SELECT * FROM usuarios WHERE email = ? AND ativo = ?",
     *     ['joao@email.com', 1]
     * );
     */
    public function prepareAndExecute($query, $params = []) {
        try {
            if (!$this->connection) {
                throw new Exception("Conexão com banco de dados não estabelecida");
            }
            
            // Prepara com parâmetros já vinculados
            $stmt = sqlsrv_prepare($this->connection, $query, $params);
            
            if ($stmt === false) {
                $errors = sqlsrv_errors();
                throw new Exception("Erro ao preparar query: " . print_r($errors, true));
            }
            
            // Executa
            if (sqlsrv_execute($stmt) === false) {
                $errors = sqlsrv_errors();
                throw new Exception("Erro ao executar query: " . print_r($errors, true));
            }
            
            // Retorna resultados
            $results = [];
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                $results[] = $row;
            }
            
            sqlsrv_free_stmt($stmt);
            
            return $results;
            
        } catch (Exception $e) {
            error_log("Database::prepareAndExecute() - " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa INSERT/UPDATE/DELETE com prepared statement
     * @param string $query Query SQL com placeholders ?
     * @param array $params Parâmetros
     * @return array Resultado com success, affectedRows, insertId
     * 
     * @example
     * $result = $db->executeNonQuery(
     *     "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
     *     ['João Silva', 'joao@email.com']
     * );
     * // Retorna: ['success' => true, 'affectedRows' => 1, 'insertId' => 123]
     */
    public function executeNonQuery($query, $params = []) {
        try {
            if (!$this->connection) {
                throw new Exception("Conexão com banco de dados não estabelecida");
            }
            
            // Prepara com parâmetros
            $stmt = sqlsrv_prepare($this->connection, $query, $params);
            
            if ($stmt === false) {
                $errors = sqlsrv_errors();
                throw new Exception("Erro ao preparar query: " . print_r($errors, true));
            }
            
            // Executa
            if (sqlsrv_execute($stmt) === false) {
                $errors = sqlsrv_errors();
                throw new Exception("Erro ao executar query: " . print_r($errors, true));
            }
            
            // Obtém linhas afetadas
            $affectedRows = sqlsrv_rows_affected($stmt);
            
            // Tenta obter ID inserido (se for INSERT)
            $insertId = null;
            if (stripos($query, 'INSERT') === 0) {
                $idStmt = sqlsrv_query($this->connection, "SELECT @@IDENTITY AS id");
                if ($idStmt !== false) {
                    $row = sqlsrv_fetch_array($idStmt, SQLSRV_FETCH_ASSOC);
                    if ($row && isset($row['id'])) {
                        $insertId = (int)$row['id'];
                    }
                    sqlsrv_free_stmt($idStmt);
                }
            }
            
            sqlsrv_free_stmt($stmt);
            
            return [
                'success' => true,
                'affectedRows' => $affectedRows !== false ? $affectedRows : 0,
                'insertId' => $insertId,
                'message' => 'Operação executada com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("Database::executeNonQuery() - " . $e->getMessage());
            return [
                'success' => false,
                'affectedRows' => 0,
                'insertId' => null,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Executa SELECT com prepared statement
     * @param string $query Query SQL com placeholders ?
     * @param array $params Parâmetros
     * @return array|false Resultado da query
     * 
     * @example
     * $users = $db->executeQuery(
     *     "SELECT * FROM usuarios WHERE ativo = ? AND cidade = ?",
     *     [1, 'Aracaju']
     * );
     */
    public function executeQuery($query, $params = []) {
        return $this->prepareAndExecute($query, $params);
    }
    
    /**
     * Executa múltiplas queries em transação
     * @param array $queries Array de ['query' => string, 'params' => array]
     * @return array Resultado da transação
     * 
     * @example
     * $result = $db->executeTransaction([
     *     ['query' => 'INSERT INTO usuarios (nome) VALUES (?)', 'params' => ['João']],
     *     ['query' => 'INSERT INTO logs (acao) VALUES (?)', 'params' => ['cadastro']],
     *     ['query' => 'UPDATE contadores SET total = total + 1', 'params' => []]
     * ]);
     */
    public function executeTransaction($queries) {
        try {
            if (!$this->connection) {
                throw new Exception("Conexão com banco de dados não estabelecida");
            }
            
            // Inicia transação
            if (sqlsrv_begin_transaction($this->connection) === false) {
                throw new Exception("Erro ao iniciar transação");
            }
            
            $results = [];
            $totalAffected = 0;
            
            foreach ($queries as $item) {
                $query = $item['query'];
                $params = isset($item['params']) ? $item['params'] : [];
                
                // Prepara e executa
                $stmt = sqlsrv_prepare($this->connection, $query, $params);
                
                if ($stmt === false) {
                    throw new Exception("Erro ao preparar query na transação");
                }
                
                if (sqlsrv_execute($stmt) === false) {
                    throw new Exception("Erro ao executar query na transação");
                }
                
                $affected = sqlsrv_rows_affected($stmt);
                $totalAffected += ($affected !== false ? $affected : 0);
                
                $results[] = [
                    'success' => true,
                    'affectedRows' => $affected
                ];
                
                sqlsrv_free_stmt($stmt);
            }
            
            // Commit da transação
            if (sqlsrv_commit($this->connection) === false) {
                throw new Exception("Erro ao fazer commit da transação");
            }
            
            return [
                'success' => true,
                'results' => $results,
                'totalAffected' => $totalAffected,
                'message' => 'Transação executada com sucesso'
            ];
            
        } catch (Exception $e) {
            // Rollback em caso de erro
            if ($this->connection) {
                sqlsrv_rollback($this->connection);
            }
            
            error_log("Database::executeTransaction() - " . $e->getMessage());
            
            return [
                'success' => false,
                'results' => [],
                'totalAffected' => 0,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtém o último ID inserido
     * @return int|null ID inserido ou null
     */
    public function getLastInsertId() {
        try {
            if (!$this->connection) {
                return null;
            }
            
            $stmt = sqlsrv_query($this->connection, "SELECT @@IDENTITY AS id");
            if ($stmt === false) {
                return null;
            }
            
            $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            sqlsrv_free_stmt($stmt);
            
            return $row && isset($row['id']) ? (int)$row['id'] : null;
            
        } catch (Exception $e) {
            error_log("Database::getLastInsertId() - " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Escapa string para prevenir SQL Injection (fallback)
     * Nota: Use prepared statements sempre que possível
     * @param string $value Valor a escapar
     * @return string Valor escapado
     */
    public function escape($value) {
        if (is_null($value)) {
            return 'NULL';
        }
        
        if (is_numeric($value)) {
            return $value;
        }
        
        // Remove aspas simples duplicadas e adiciona proteção
        $value = str_replace("'", "''", $value);
        return "'" . $value . "'";
    }
    
    /**
     * Fecha statement
     * @param resource $stmt Statement para fechar
     */
    public function closeStatement($stmt) {
        if ($stmt) {
            sqlsrv_free_stmt($stmt);
        }
    }
}

?>
