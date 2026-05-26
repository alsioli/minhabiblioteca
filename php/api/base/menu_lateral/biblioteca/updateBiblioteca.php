<?php

require_once 'php/utils/function/database.php';

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

    $titulo         = isset($data['titulo_atualizar']) ? $data['titulo_atualizar'] : null;
    $autor          = isset($data['autor_atualizar']) ? $data['autor_atualizar'] : null;
    $serie          = isset($data['serie_atualizar']) ? $data['serie_atualizar'] : null;
    $volume         = isset($data['volume_atualizar']) ? $data['volume_atualizar'] : null;
    $genero         = isset($data['genero_atualizar']) ? $data['genero_atualizar'] : null;
    $tema           = isset($data['tema_atualizar']) ? $data['tema_atualizar'] : null;
    $editora        = isset($data['editora_atualizar']) ? $data['editora_atualizar'] : null;
    $tipo_edicao    = isset($data['tipo_edicao_atualizar']) ? $data['tipo_edicao_atualizar'] : null;
    $paginas        = isset($data['paginas_atualizar']) ? $data['paginas_atualizar'] : null;
    $nacionalidade  = isset($data['nacionalidade_atualizar']) ? $data['nacionalidade_atualizar'] : null;
    $sexo_autor     = isset($data['sexo_autor_atualizar']) ? $data['sexo_autor_atualizar'] : null;
    $raca           = isset($data['raca_atualizar']) ? $data['raca_atualizar'] : null;
    $natureza       = isset($data['natureza_atualizar']) ? $data['natureza_atualizar'] : null;
    $status         = isset($data['status_atualizar']) ? $data['status_atualizar'] : null;
    $emprestimo     = isset($data['emprestimo_atualizar']) ? $data['emprestimo_atualizar'] : null;
    $data_compra    = isset($data['data_compra_atualizar']) ? $data['data_compra_atualizar'] : null;
    $valor_compra   = isset($data['valor_compra_atualizar']) ? $data['valor_compra_atualizar'] : null;
    $local_compra   = isset($data['local_compra_atualizar']) ? $data['local_compra_atualizar'] : null;
    $observacoes    = isset($data['observacoes_atualizar']) ? $data['observacoes_atualizar'] : null;
    $codigo         = isset($data['codigo_atualizar']) ? $data['codigo_atualizar'] : null;
    $tipo_codigo    = isset($data['tipo_codigo_atualizar']) ? $data['tipo_codigo_atualizar'] : null;


    $sqlQuery = "UPDATE [Biblioteca].[dbo].[Livros]
        SET ";
        $campos = [];
        $params = [];

        $map = [
            'codigo_atualizar'        => 'codigo',
            'tipo_codigo_atualizar'   => 'tipo_codigo',
            'titulo_atualizar'        => 'titulo',
            'autor_atualizar'         => 'autor',
            'sexo_autor_atualizar'    => 'sexo_autor',
            'nacionalidade_atualizar' => 'nacionalidade',
            'raca_atualizar'          => 'raça',
            'volume_atualizar'        => 'volume',
            'serie_atualizar'         => 'serie',
            'genero_atualizar'        => 'genero',
            'tema_atualizar'          => 'tema',
            'editora_atualizar'       => 'editora',
            'tipo_edicao_atualizar'   => 'tipo_edicao',
            'paginas_atualizar'       => 'paginas',
            'natureza_atualizar'      => 'natureza',
            'status_atualizar'        => 'status',
            'emprestimo_atualizar'    => 'emprestimo',
            'data_compra_atualizar'   => 'data_compra',
            'valor_compra_atualizar'  => 'valor_compra',
            'local_compra_atualizar'  => 'local_compra',
            'observacoes_atualizar'   => 'observacoes'
            ];

            $dadosCorrigidos = [];

            foreach ($map as $formField => $dbField) {
                if (isset($data[$formField])) {
                    $dadosCorrigidos[$dbField] = $data[$formField];
                }
            }

        // Campos opcionais - apenas atualiza os que foram enviados
       $camposPermitidos = ['codigo','tipo_codigo','titulo','autor','sexo_autor','nacionalidade',
    'raca', 'volume', 'serie', 'genero', 'tema', 'editora', 'tipo_edicao', 'paginas', 'natureza',
    'status', 'emprestimo', 'data_compra', 'valor_compra', 'local_compra', 'observacoes'];
        
       foreach ($dadosCorrigidos as $campo => $valor) {
            $campos[] = "$campo = :$campo";
            $params[":$campo"] = $valor;
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
