<?php

/*
 * DDL — execute no SQL Server ANTES de usar as funcionalidades de status por plataforma:
 *
 *   ALTER TABLE [Biblioteca].[dbo].[Leituras]
 *       ADD local_leitura NVARCHAR(100) NULL;
 *
 * Isso permite rastrear em qual plataforma (Biblioteca, Skeelo, Audible...)
 * o livro foi lido e atualizar o status na tabela correta.
 */

/**
 * Retorna o nome da tabela correspondente ao vLocalLeitura.
 * Usa whitelist para evitar SQL injection.
 */
function getTabela(string $local_leitura): ?string {
    $mapa = [
        'Skeelo'            => 'LeiturasSKEELO',
        'Biblion'           => 'LivrosBiblion',
        'MEC_Livros'        => 'LivrosMEC',
        'Audible'           => 'LivrosAudible',
        'Kindle_Unlimited'  => 'LivrosKindleUnlimited',
        'Biblioteca'        => 'Livros',
    ];
    return $mapa[$local_leitura] ?? null;
}

/**
 * Atualiza o campo [status] na tabela correspondente ao local_leitura.
 * Faz match por titulo + autor (quando disponível).
 * Silencia erros para não quebrar o fluxo principal.
 */
function atualizarStatusNaTabela($db, string $local_leitura, string $titulo, string $autor, string $status): void {
    if (empty($local_leitura) || empty($titulo)) return;

    $tabela = getTabela($local_leitura);
    if (!$tabela) return;

    try {
        if (!empty($autor)) {
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[{$tabela}]
                SET [status] = :status
                WHERE titulo = :titulo
                  AND autor  = :autor
            ", [':status' => $status, ':titulo' => $titulo, ':autor' => $autor]);
        } else {
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[{$tabela}]
                SET [status] = :status
                WHERE titulo = :titulo
            ", [':status' => $status, ':titulo' => $titulo]);
        }
    } catch (Exception $e) {
        error_log("[atualizarStatusNaTabela] Erro ao atualizar {$tabela}: " . $e->getMessage());
    }
}
