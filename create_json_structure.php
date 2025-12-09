<?php
// Definir o caminho
$base_path = __DIR__;
$json_path = $base_path . '/public/assets/json/';
$file_path = $json_path . 'tree_map.json';

// Criar diretórios se não existirem
if (!is_dir($json_path)) {
    mkdir($json_path, 0777, true);
    echo "Diretório criado: $json_path\n";
} else {
    echo "Diretório já existe: $json_path\n";
}

// Criar arquivo com array vazio
if (!file_exists($file_path)) {
    file_put_contents($file_path, '[]');
    echo "Arquivo criado: $file_path\n";
} else {
    echo "Arquivo já existe: $file_path\n";
}

echo "\nEstrutura criada com sucesso!\n";