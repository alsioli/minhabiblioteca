<?php

require_once 'php/util/database.php';

//Inicializar variáveis de resposta
$result_status = 'false';
$result_error = '';
$result_data = null;


switch($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        //GetMethod($routes->$params);
        break;
    case 'POST':
        break;
    case 'PUT':
        PutMethod();
        break;
    case 'DELETE':
        break;
    default:
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

//header('Content-Type: application/json');
echo json_encode($response);

function PutMethod() {
    
    global $result_status, $result_error, $result_data;

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

        // Validar se o JSON é válido
    if (json_last_error() !== JSON_ERROR_NONE) {
        $result_status = 'false';
        $result_error = 'JSON inválido: ' . json_last_error_msg();
        return;
    }

        if (!isset($data['id'])) {
        $result_status = 'false';
        $result_error = 'ID não fornecido.';
        return;
    }
    
    $id = $data['id'];

    $titulo  = isset($data['titulo']) ? $data['titulo'] : null;  
    $autor = isset ($data['autor']) ? $data['autor'] : null;
    $serie  = isset($data['serie']) ? $data['serie']: null;
    $volume  = isset($data['volume']) ? $data['volume']: null;
    $genero  = isset($data['genero']) ? $data['genero']: null;
    $tema  = isset($data['tema']) ? $data['tema']: null;
    $editora = isset($data['editora']) ? $data['editora']: null;
    $tipo_edicao  = isset($data['tipo_edicao']) ? $data['tipo_edicao']: null;
    $paginas  = isset($data['paginas']) ? $data['paginas']: null;
    $nacionalidade  = isset($data['nacionalidade']) ? $data['nacionalidade']: null;
    $troca_skoob  = isset($data['troca_skoob']) ? $data['troca_skoob']: null;
    $local  = isset($data['local']) ? $data['local']: null;
    $status  = isset($data['status']) ? $data['status']: null;
    $avaliacao  = isset($data['avaliacao']) ? $data['avaliacao']: null;
    $emprestimo  = isset($data['emprestimo']) ? $data['emprestimo']: null;
    $compra_bienal  = isset($data['compra_bienal']) ? $data['compra_bienal']: null;
    $mes_leitura  = isset($data['mes_leitura']) ? $data['mes_leitura']: null;
    $data_compra = isset($data['data_compra']) ? $data['data_compra']: null;

    $sqlQuery = "UPDATE [Biblioteca].[dbo].[Livros]
        SET ";
        $campos = [];
        $params = [];

        // Campos opcionais - apenas atualiza os que foram enviados
        $camposPermitidos =[
            'titulo', 'autor', 'serie', 'volume', 'genero', 'tema', 'editora',
            'tipo_edicao', 'paginas', 'nacionalidade', 'troca_skoob', 'local',
            'status', 'avaliacao', 'emprestimo', 'compra_bienal', 'mes_leitura',
            'data_compra'
        ];
        
        foreach($camposPermitidos as $campo){
            if (isset($data[$campo])){
                $campos[] = "$campo = :$campo";
                $params[":$campo"] = $data[$campo];
            }            
        } 
        // Verifica se existem campos para atualizar ou se veio vazio
        if(empty($campos)){
            $result_status = 'false';
            $result_error = 'Nenhum campo para atualizar.';
            return;
        }
        
        $sqlQuery .= implode(', ', $campos);
        $sqlQuery .=" WHERE id = :id;";
        $params[':id'] = $id;
    
    try{
      $db = new Database(); 
      $result_data = $db->ExecuteNonQuery($sqlQuery, $params);
      $result_status = 'true';
    } catch(Exception $e){
      $result_status = 'false';
      $result_error = $e->getMessage();
    }
}
