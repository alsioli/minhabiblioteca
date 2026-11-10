<?php
/*
 * Funções compartilhadas para a tabela [Autor] (Lista de Escritores).
 *
 * - normalizarNomeAutor(): limpa o nome (espaços nas pontas, espaços duplos,
 *   espaço não separável, tabs e quebras de linha).
 * - AUTOR_NOME_SQL: expressão SQL que compara nomes já gravados ignorando
 *   espaços nas pontas e maiúsculas/minúsculas.
 * - garantirAutor(): inclui o autor se ele for novo; se já existir, só preenche
 *   sexo/raça/nacionalidade que estiverem vazios (nunca sobrescreve).
 */

const AUTOR_NOME_SQL = "LOWER(LTRIM(RTRIM(nome_autor)))";

function normalizarNomeAutor($nome): string {
    $nome = (string)$nome;
    // NBSP (U+00A0) e outros espaços Unicode viram espaço comum
    $nome = preg_replace('/[\s\x{00A0}\x{2000}-\x{200B}\x{202F}\x{3000}]+/u', ' ', $nome) ?? $nome;
    return trim($nome);
}

function normalizarSexoAutor($sexo): string {
    $s = strtoupper(trim((string)$sexo));
    if ($s === 'FEMININO') return 'F';
    if ($s === 'MASCULINO') return 'M';
    return $s;
}

function garantirAutor(DataBase $db, $nome, $sexo = '', $raca = '', $nac = ''): void {
    $nome = normalizarNomeAutor($nome);
    if ($nome === '') return;

    $sexo = normalizarSexoAutor($sexo);
    $raca = normalizarNomeAutor($raca);
    $nac  = normalizarNomeAutor($nac);

    $db->ExecuteNonQuery(
        "IF NOT EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Autor] WHERE " . AUTOR_NOME_SQL . " = LOWER(:nome))
             INSERT INTO [Biblioteca].[dbo].[Autor] (nome_autor, sexo_autor, [raça], nacionalidade)
             VALUES (:nome2, NULLIF(:sexo,''), NULLIF(:raca,''), NULLIF(:nac,''))
         ELSE
             UPDATE [Biblioteca].[dbo].[Autor]
                SET sexo_autor    = COALESCE(NULLIF(LTRIM(RTRIM(sexo_autor)), ''), NULLIF(:sexo2,'')),
                    [raça]        = COALESCE(NULLIF(LTRIM(RTRIM([raça])), ''),     NULLIF(:raca2,'')),
                    nacionalidade = COALESCE(NULLIF(LTRIM(RTRIM(nacionalidade)), ''), NULLIF(:nac2,''))
              WHERE " . AUTOR_NOME_SQL . " = LOWER(:nome3)",
        [
            ':nome'  => $nome, ':nome2' => $nome, ':nome3' => $nome,
            ':sexo'  => $sexo, ':raca'  => $raca, ':nac'   => $nac,
            ':sexo2' => $sexo, ':raca2' => $raca, ':nac2'  => $nac,
        ]
    );
}
