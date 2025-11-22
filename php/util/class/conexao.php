<?php

class Database {
    private $host = 'ALESSANDRAL\LOCALHOST';
    private $db = 'Biblioteca';
    private $conn;

    public function connect() {
        try {
            $this->conn = new PDO(
                'sqlsrv:Server=' . $this->host . ';Database=' . $this->db,
 
            );
            // Configura para lançar exceções em caso de erro
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch (PDOException $e) {
            echo 'Erro: ' . $e->getMessage();
            return null;
        }
    }

    /**
     * GetMany - Retorna múltiplos registros do banco de dados
     *
     * @param string $query Query SQL a ser executada
     * @param array $params Parâmetros para prepared statement
     * @return array Array de arrays associativos
     */
    public function GetMany($query, $params = []) {
        try {
            if ($this->conn === null) {
                $this->connect();
            }

            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $results;
        } catch (PDOException $e) {
            error_log("Erro ao executar GetMany: " . $e->getMessage());
            return [];
        }
    }
}

$db = new Database();
$conn = $db->connect();

if ($conn) {
    echo "Conexão bem-sucedida!";
} else {
    echo "Falha na conexão.";
}