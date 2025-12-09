<?php

class Build
{
    private $classMap;
    private $cache;

    public function __construct()
    {
        // inicializa dependências
        $this->classMap = new Class_Map();
        $this->cache = new Cache();
    }

    /**
     * Executa o processo de build inicial:
     * - Gera/Recria o tree_map.json
     * - Limpa ou inicializa o cache
     */
    public function run()
    {
        echo "Iniciando processo de build...\n";

        // recria o mapa de classes
        $this->generateClassMap();

        // inicializa cache
        $this->initializeCache();

        echo "Build concluído com sucesso!\n";
    }

    /**
     * Gera/Recria o tree_map.json
     */
    private function generateClassMap()
    {
        echo "Gerando tree_map.json...\n";
        $this->classMap->Build();
    }

    /**
     * Inicializa o cache
     */
    private function initializeCache()
    {
        echo "Inicializando cache...\n";
        $this->cache->clear();
        $this->cache->set('last_build', date('Y-m-d H:i:s'));
    }

    /**
     * Verifica se o build está atualizado
     */
    public function isUpdated($seconds = 300)
    {
        $lastBuild = $this->cache->get('last_build');
        if (!$lastBuild) {
            return false;
        }

        $lastTimestamp = strtotime($lastBuild);
        return (time() - $lastTimestamp) <= $seconds;
    }
}