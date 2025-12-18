<?php

class Routes {
    public $server_path = '';
    public $directory_path = '';
    public $file_name = '';
    public $params = [];
    public $querystring = '';
    public $route_section = '';
    public $server_route_file = '';
    public $host = 'ALESSANDRAL\LOCALHOST';
    public $url = '';
    public $protocol = '';
    public $error_route = false;

    public function __construct() {
        $this->protocol = 'http://';
        $this->host = $_SERVER['HTTP_HOST'];
        $this->url = $_SERVER['REQUEST_URI'];
        $this->url = $this->protocol . $this->host . $this->url;

        $file = new \SplFileInfo($_SERVER['REQUEST_URI']);
        if ($file->getExtension() && $file->getExtension() != 'php') {
            if (!file_exists($_SERVER['REQUEST_URI'])) {
                $this->error_route = true;
            }
        }

        // ✅ Normaliza as barras
        $this->server_path = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']) . '/';

        try {
            $url = $_SERVER['REQUEST_URI'];
            $url = str_replace('\/', '/', filter_var($url, FILTER_SANITIZE_URL));
            $url_parse = parse_url($url, PHP_URL_PATH);
            $url_parse = str_replace('/index.php', '', $url_parse);
            $url_parse = str_contains($url_parse, '?') ? explode('?', $url_parse)[0] : $url_parse;

            $this->SplitUrlVariables($url_parse);
            $this->SetQueryString();
            $this->SetRouteSection();
        } catch (Exception $e) {
            echo 'Erro: ' . $e->getMessage() . "\n";
        }
    }

    private function SetRouteSection() {
        if (str_contains($this->directory_path, 'api/')) {
            $this->route_section = 'api';
            return;
        }

        $this->route_section = 'pages';
    }

    private function check_directory_file($path): bool {
        $current_path = $this->server_path . $path;
        return !file_exists($current_path);
    }

    private function setParams($url) {
        // Implementação da lógica de parâmetros da URL
    }

    private function SplitUrlVariables($url_parse) {
        // ✅ Se URL vazia ou apenas '/', carrega index.php da raiz
        if (empty(trim($url_parse, '/'))) {
            $this->directory_path = '';
            $this->file_name = 'index.php';
            return;
        }

        $directories = explode('/', trim($url_parse, '/'));
        $directory_search = '';

        for ($i = 0; $i < count($directories); $i++) {
            $directory_search .= $directories[$i] . '/';

            // Verifica se o diretório NÃO existe
            if ($this->check_directory_file($directory_search)) {
                // Tenta arquivo .php com o nome do diretório
                if ($this->check_directory_file($this->directory_path . $directories[$i] . '.php')) {
                    $this->file_name = $directories[$i] . '.php';
                } 
                // Tenta index.php
                elseif ($this->check_directory_file($this->directory_path . 'index.php')) {
                    $this->file_name = 'index.php';
                } 
                else {
                    throw new Exception('File Not Found: ' . $this->server_path . $this->directory_path . $this->file_name);
                }

                $this->setParams($url_parse);
                return;
            }

            $this->directory_path = $directory_search;
        }

        // Se chegou aqui, tenta carregar index.php no último diretório
        if (!$this->check_directory_file($this->directory_path . 'index.php')) {
            $this->file_name = 'index.php';
        } else {
            throw new Exception('File not found: ' . $this->server_path . $this->directory_path . 'index.php');
        }
    }

    private function SetQueryString() {
        $this->querystring = $_SERVER['QUERY_STRING'] ?? '';
    }
}