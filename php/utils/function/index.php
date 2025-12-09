<?php
//--- Verifica se a string contém o valor procurado.
//--- Implementação da função existente no PHP 8.0

if(! function_exists('str_contains')){
    function str_contains(string $haystack, string $needle, bool $isCase_Sensitive = false)
    {
        if ($isCase_Sensitive) {
            return strpos(strval($haystack), strval($needle)) === false ? false : true;
        } else {
            return stripos(strval($haystack), strval($needle)) === false ? false : true;
        }
    }
}

function sanitize_string($str){
    //-- Remove acentuação e caracteres especiais
    $str = iconv('UTF-8', 'ASCII//TRANSLIT', $str);

    // Remove todos os caracteres que não são letras ou números
    $str = preg_replace('/[^a-zA-Z0-9\s]/', '', $str);

    //-- Converte para minúscula
    $str = strtolower($str);
    return $str;
}

function log_file(string $content, string $file = 'debug')
{
    if (!$content) {
        return;
    }
    $now = new DateTime();
    error_log('[' . $now->format('Y-m-d H:i:s') . '] - ' . $content . PHP_EOL, 3, "php/log/$file.log");
}

function log_console(string $content)
{
    if (!$content) {
        return;
    }
    echo '<script>';
    echo 'console.log(' . json_encode($content) . ');';
    echo '</script>';
}