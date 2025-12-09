<?php

class Class_Map {

    private $config;
    private $file;
    private $path;
    private $file_name;
    private $extension;

    public function __construct(){
        $this->config = Config::getInstance();
        $this->file = new File();

        $this->path = $this->config->directory_server . '/public/assets/json/';
        $this->file_name = 'tree_map';
        $this->extension = 'json';
    }

    public function Read(){
        // Se não existe, força a criação
        if(!$this->file->Exists($this->path, $this->file_name, $this->extension)){
            $this->Build();
        }

        return $this->file->Read($this->path, $this->file_name, $this->extension);
    }

    public function Build() {
    // garante que a pasta de saída existe
    if (!is_dir($this->path)) {
        mkdir($this->path, 0777, true);
    }

    $ignore = [];

    // caminho correto onde estão suas classes
    $folder = str_replace('\\', '/', $this->config->directory_server . '/php/utils/class/application');

    // se a pasta não existir, evita erro fatal
    if (!is_dir($folder)) {
        throw new Exception("Diretório de classes não encontrado: " . $folder);
    }

    // gera lista de arquivos
    $json = json_encode($this->file->Tree($folder, $ignore));

    // grava o JSON no local configurado
    $filePath = $this->path . $this->file_name . '.' . $this->extension;
    file_put_contents($filePath, $json);
}
}