<?php
class File
{
    private $fileList = [];
    private $folderList = [];

    public function Open($file_path, $mode = 'r')
    {
        if (!file_exists($file_path) && $mode == 'r') {
            log_file('File Not Found. - ' . $file_path);
            throw new Exception('File Not Found. - ' . $file_path);
        }

        $currentFile = false;
        $counter = 0;
        $max_time = 10; // Maximum time to wait in seconds
        while (!is_resource($currentFile) && $counter < $max_time) {
            $currentFile = fopen($file_path, $mode);
            if (!is_resource($currentFile)) {
                usleep(1000000); // Sleep for 1 second before retrying
                $counter++;
            }
        }

        if (!is_resource($currentFile)) {
            log_file('Unable to read file within the allotted time. - ' . $file_path);
            throw new Exception('Unable to read file within the allotted time. - ' . $file_path);
        }

        return $currentFile;
    }

    public function Create($path, $file_name = null, $extension = null)
    {
        $file_path = $this->MountFilePath($path, $file_name, $extension);
        $currentFile = $this->Open($file_path, 'w');
        // Conteúdo pode ser escrito aqui
        fclose($currentFile);
    }

    public function Delete($path, $file_name = null, $extension = null, $ignore_error = true)
    {
        $file_path = $this->MountFilePath($path, $file_name, $extension);
        if (!file_exists($file_path)) {
            if (!$ignore_error) {
                throw new Exception('File Not Found: ' . $file_path);
            }
            return false;
        }

        unlink($file_path);
        return true;
    }

    public function Exists($path, $file_name = null, $extension = null)
    {
        $file_path = $this->MountFilePath($path, $file_name, $extension);
        return file_exists($file_path);
    }

    public function IsWritable($path, $file_name = null, $extension = null)
    {
        $file_path = $this->MountFilePath($path, $file_name, $extension);
        if (!file_exists($file_path)) {
            return false;
        }
        return is_writable($file_path);
    }

    public function Read($path, $file_name = null, $extension = null)
    {
        $file_path = $this->MountFile2Path($path, $file_name, $extension);
        $currentFile = $this->Open($file_path);
        try {
            $fileSize = filesize($file_path);
            $content = null;
            if ($fileSize > 0) {
                $content = fread($currentFile, $fileSize);
            }
            return $content;
        } finally {
            rewind($currentFile);
            fclose($currentFile);
        }
    }

    // ADICIONE ESTE MÉTODO (alias para MountFile2Path)
    private function MountFilePath($path, $file_name, $extension)
    {
        return $this->MountFile2Path($path, $file_name, $extension);
    }

     public function Tree($folder, $ignore = []) {
        $files = [];

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($folder, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            $path = str_replace('\\', '/', $file->getPathname());

            // Ignorar arquivos/pastas se estiverem na lista
            $skip = false;
            foreach ($ignore as $pattern) {
                if (str_contains($path, $pattern)) {
                    $skip = true;
                    break;
                }
            }

            if (!$skip && $file->isFile()) {
                $files[] = $path;
            }
        }

        return $files;
    }

    private function MountFile2Path($path, $file_name, $extension)
    {
        if (!$file_name || !$extension) {
            return $path;
        }

        $completeFileName = rtrim($path, '/') . '/' . $file_name . '.' . $extension;
        return $completeFileName;
    }

    public function TreeDir($path, $ignore_folder = [], $ignore_files = [])
    {
        $this->ModelList = [];
        $this->FileList = [];

        foreach (scandir($path) as $item) {
            $flag_ignore_file = false;
            if ($item == '.' || $item == '..') {
                continue;
            }

            if (str_contains($item, '.')) {
                foreach ($ignore_files as $ignore_item) {
                    if (str_contains(strtolower($item), $ignore_item)) {
                        $flag_ignore_file = true;
                    }
                }
                if ($flag_ignore_file) {
                    continue;
                }
            }

            // Verifica se já está na lista
            if (in_array(strtolower($item), $this->fileList)) {
                $this->fileList = array_merge($this->fileList, [strtolower($item)]);
            } else {
                $folder_ignore = false;
                foreach ($ignore_folder as $ignore_item) {
                    if (str_contains(strtolower($item), $ignore_item)) {
                        $folder_ignore = true;
                    }
                }
                if ($folder_ignore) {
                    continue;
                }

                if (in_array(strtolower($item), $this->folderList)) {
                    $this->folderList = array_merge($this->folderList, [strtolower($item)]);
                }
            }
        }

        return $this->fileList;
    }
}