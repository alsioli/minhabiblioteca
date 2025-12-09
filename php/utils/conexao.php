
<?php
class Conexao {

    private $host = 'ALESSANDRAL\LOCALHOST';
    private $database = 'Biblioteca';
    private $conn;

    public function connect() {
        try {
            $this->conn = new PDO(
                'sqlsrv:Server=' . $this->host . ';Database=' . $this->database,
            );
            // Configura para lançar exceções em caso de erro
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch (PDOException $e) {
            echo 'Erro: ' . $e->getMessage();
            return null;
        }
    }
}

$database = new Conexao();
$conn = $database->connect();

if ($conn) {
    echo "Conexão bem-sucedida!";
} else {
    echo "Falha na conexão.";
}