<?php
include_once 'php/utils/class/application/file.php';
include_once 'php/config.php';
include_once 'php/utils/class/build/class_map.php';

echo "Gerando mapa de classes...\n";

$class_map = new Class_Map();
$class_map->Build(true);

echo "Mapa de classes gerado com sucesso!\n";
echo "Arquivo: public/assets/json/tree_map.json\n";