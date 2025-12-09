<?php

include_once 'php/utils/class/application/file.php';
include_once 'php/config.php';
include_once 'php/utils/class/build/class_map.php';

class AutoLoad
{
    private $file_list = [];

    public function __construct()
    {
        spl_autoload_register(function ($class) {
            $build = false;

            for ($try = 0; $try < 2; $try++) {
                if ($try >= 1) {
                    $build = true;
                }

                $file_found = $this->SearchClass($class, $build);

                if (is_string($file_found) && $file_found !== '' && file_exists($file_found)) {
                    include_once($file_found);
                    return;
                }
            }

            throw new Exception("File Class not found - " . $class);
        });
    }

    private function SearchClass($class, $build = false)
    {
        $class_map = new Class_Map();

        if ($build) {
            $class_map->Build();
            $this->file_list = json_decode($class_map->Read());
        }

        if ($this->file_list == NULL) {
            $this->file_list = json_decode($class_map->Read());
        }

        if ($this->file_list == NULL) {
            return NULL;
        }

        // percorre apenas uma vez
        foreach ($this->file_list as $file) {
            $file_normalized = basename($file, '.php'); // pega só o nome do arquivo sem extensão

            if (strcasecmp($file_normalized, $class) === 0) {
                return $file;
            }
        }

        return NULL;
    }
}

new AutoLoad();