<?php

include 'php/util/database.php';

//Inicializar variáveis de resposta
$result_status = 'false';
$result_error = '';
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        GetMethod();
        break;
    case 'POST':
        // Handle POST request
        echo "Handling POST request";
        break;
    case 'PUT':
        // Handle PUT request
        echo "Handling PUT request";
        break;
    case 'DELETE':
        // Handle DELETE request
        echo "Handling DELETE request";
        break;
    default:
        // Handle unsupported methods
        http_response_code(405);
        echo "Method Not Allowed";
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
echo json_encode($response);

function GetMethod() {
    
    global $result_status, $result_error, $result_data;

    $id = isset($_GET['id']);
    $titulo  = isset($_GET['titulo']) ? $_GET['titulo'] : null;  
    $autor = isset ($_GET['autor']) ? $_GET['autor'] : null;
    $serie  = isset($_GET['serie']) ? $_GET['serie']: null;
    $volume  = isset($_GET['volume']) ? $_GET['volume']: null;
    $genero  = isset($_GET['genero']) ? $_GET['genero']: null;
    $tema  = isset($_GET['tema']) ? $_GET['tema']: null;
    $editora = isset($_GET['editora']) ? $_GET['editora']: null;
    $tipo_edicao  = isset($_GET['tipo_edicao']) ? $_GET['tipo_edicao']: null;
    $paginas  = isset($_GET['paginas']) ? $_GET['paginas']: null;
    $nacionalidade  = isset($_GET['nacionalidade']) ? $_GET['nacionalidade']: null;
    $troca_skoob  = isset($_GET['troca_skoob']) ? $_GET['troca_skoob']: null;
    $local  = isset($_GET['local']) ? $_GET['local']: null;
    $status  = isset($_GET['status']) ? $_GET['status']: null;
    $avaliacao  = isset($_GET['avaliacao']) ? $_GET['avaliacao']: null;
    $emprestimo  = isset($_GET['emprestimo']) ? $_GET['emprestimo']: null;
    $compra_bienal  = isset($_GET['compra_bienal']) ? $_GET['compra_bienal']: null;
    $mes_leitura  = isset($_GET['mes_leitura']) ? $_GET['mes_leitura']: null;
    $data_compra = isset($_GET['data_compra']) ? $_GET['data_compra']: null;

    $sqlQuery = "SELECT *
         FROM [Biblioteca].[dbo].[Livros]";
        $campos = [];
        $params = [];

    // Campos opcionais - apenas pesquisa os que foram enviados
        $camposRecebidos =[
            'id', 'titulo', 'autor', 'serie', 'volume', 'genero', 'tema', 'editora',
            'tipo_edicao', 'paginas', 'nacionalidade', 'troca_skoob', 'local', 'status', 
            'avaliacao', 'emprestimo', 'compra_bienal', 'mes_leitura','data_compra'
        ];

        foreach($camposRecebidos as $campo){
            if(isset($_GET[$campo]) && $_GET[$campo] !== null && $_GET[$campo] !== ''){
                    $campos[] = "$campo = :$campo";
                    $params[":$campo"] = $_GET[$campo];
                }  
            }                   

        // Verifica se existem campos para pesquisar ou se veio vazio
        if(!empty($campos)){
            $sqlQuery .= " WHERE " . implode(' AND ', $campos);
        }

    try{
      $db = new Database(); 
     // echo $sqlQuery;
     // die();
       $result_data = ($db->GetMany($sqlQuery, $params));
       $result_status = 'true';
    } catch(Exception $e){
      $result_status = 'false';
      $result_error = $e->getMessage();
    }
}

