<?php

class Config {
    public $directory_server;
    public $site_address;
    public $port;
    public $debug_mode;
    public $page_title;
    public $page_description;

    private static $instance;


    private function __construct() {
        $this->directory_server = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']);
        $this->site_address = $_SERVER['SERVER_NAME'];
        $this->port = $_SERVER['SERVER_NAME'] == 'localhost' ? $_SERVER['SERVER_PORT'] : '';
        $this->debug_mode = str_contains($this->site_address, 'dev.') || str_contains($this->site_address, 'localhost') ? true : false;
        
        // echo 'server', $_SERVER['SERVER_NAME'];
        // echo  'root', $_SERVER['DOCUMENT_ROOT'];

        // ✅ Echo corrigido (melhor formatação para debug)
        // if($this->debug_mode) {
        //     echo '<pre>';
        //     echo 'SERVER: ' . $_SERVER['SERVER_NAME'] . "\n";
        //     echo 'ROOT: ' . $this->directory_server . "\n";
        //     echo 'PORT: ' . $this->port . "\n";
        //     echo '</pre>';
        // }

        // TIMEZONE
        // Foi alterado o padrão de timezone de America/Sao_Paulo,
        // para america/Argentina/Buenos_Aires pois,
        // no arquivo PHP.ini, foi definido que no timezone do
        // Brasil existe horário de verão. Porém, no real contexto
        // em 2019, isso não se aplica. Portanto, em testes, o
        // horário passou de GMT-03:00 para GMT-02:00 indevidamente.

        // Foi definido o período da argentina com o mesmo
        // GMT-03:00 e não possui horário de verão

        // GMT-03:00
        // $local = new DateTimeZone('GMT-03:00');

        date_default_timezone_set('America/Argentina/Buenos_Aires');
    }

    public static function getInstance(){
        if(self::$instance == null){
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function PageInfo($route_path){
      //  $menu_links = new Menu_links();
     //   $links = json_decode($menu_links->Read());

        $this->page_title = 'Home Page';
        $this->page_description = 'Inicio';

        // foreach($links as $link){
        //     if(str_contains($route_path, $link->value)){
        //         $this->page_title = $link->name;
        //         $this->page_description = $link->value;
        //     }
        // }
    }
    
}