-- Atualiza a tabela Leituras com base no cadastro dos livros:
--   * Leituras da Biblioteca (id_local_leitura = 6): sexo_autor, pais, raça, tema e
--     tipo_leitura passam a ser iguais a Livros (vínculo por id_livros).
--   * Leituras de outras plataformas cujo título existe uma única vez em Livros:
--     sexo_autor, pais, raça e tema vêm de Livros (tipo_leitura é da plataforma).
--   * Demais vazios de tema/tipo_leitura: preenchidos pela tabela de origem da plataforma.
--   * tempo_dias das leituras concluídas e resenhas = 'S' quando já existe resenha.
-- Campos vazios em Livros não apagam o que já existe em Leituras.
-- Cópia de segurança: [dbo].[Leituras_backup_20261025]
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;

IF OBJECT_ID('[Biblioteca].[dbo].[Leituras_backup_20261025]') IS NULL
    SELECT * INTO [Biblioteca].[dbo].[Leituras_backup_20261025] FROM [Biblioteca].[dbo].[Leituras];

BEGIN TRAN;

-- 1. Biblioteca: vínculo direto por id_livros
UPDATE l
SET l.sexo_autor   = COALESCE(NULLIF(lv.sexo_autor, ''),    l.sexo_autor),
    l.pais         = COALESCE(NULLIF(lv.nacionalidade, ''), l.pais),
    l.[raça]       = COALESCE(NULLIF(lv.[raça], ''),        l.[raça]),
    l.tema         = COALESCE(NULLIF(lv.tema, ''),          l.tema),
    l.tipo_leitura = COALESCE(NULLIF(lv.tipo_edicao, ''),   l.tipo_leitura)
FROM [Biblioteca].[dbo].[Leituras] l
INNER JOIN [Biblioteca].[dbo].[Livros] lv ON lv.id = l.id_livros
WHERE l.id_local_leitura = 6;

-- 2. Outras plataformas: vínculo por título único em Livros
;WITH unicos AS (
    SELECT titulo, MAX(id) AS id
    FROM [Biblioteca].[dbo].[Livros]
    GROUP BY titulo
    HAVING COUNT(*) = 1
)
UPDATE l
SET l.sexo_autor = COALESCE(NULLIF(lv.sexo_autor, ''),    l.sexo_autor),
    l.pais       = COALESCE(NULLIF(lv.nacionalidade, ''), l.pais),
    l.[raça]     = COALESCE(NULLIF(lv.[raça], ''),        l.[raça]),
    l.tema       = COALESCE(NULLIF(lv.tema, ''),          l.tema)
FROM [Biblioteca].[dbo].[Leituras] l
INNER JOIN unicos u ON u.titulo = l.titulo
INNER JOIN [Biblioteca].[dbo].[Livros] lv ON lv.id = u.id
WHERE ISNULL(l.id_local_leitura, 0) <> 6;

-- 3. Vazios restantes de tema/tipo_leitura: tabela de origem da plataforma
;WITH origem AS (
    SELECT id, 6 AS id_local, tema, CAST(tipo_edicao AS VARCHAR(100)) AS tipo FROM [Biblioteca].[dbo].[Livros]
    UNION ALL SELECT id, 1, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LeiturasSKEELO]
    UNION ALL SELECT id, 2, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosBiblion]
    UNION ALL SELECT id, 3, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosMEC]
    UNION ALL SELECT id, 4, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosAudible]
    UNION ALL SELECT id, 5, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosKindleUnlimited]
    UNION ALL SELECT id, 7, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosScribd]
    UNION ALL SELECT id, 8, tema, CAST(tipo_midia AS VARCHAR(100)) FROM [Biblioteca].[dbo].[LivrosEmprestimos]
)
UPDATE l
SET l.tema         = COALESCE(NULLIF(l.tema, ''),         o.tema),
    l.tipo_leitura = COALESCE(NULLIF(l.tipo_leitura, ''), o.tipo)
FROM [Biblioteca].[dbo].[Leituras] l
INNER JOIN origem o ON o.id = l.id_livros AND o.id_local = l.id_local_leitura
WHERE ISNULL(l.tema, '') = '' OR ISNULL(l.tipo_leitura, '') = '';

-- 4. tempo_dias das leituras concluídas
UPDATE [Biblioteca].[dbo].[Leituras]
SET tempo_dias = DATEDIFF(day, data_inicio, data_fim)
WHERE data_fim IS NOT NULL AND data_inicio IS NOT NULL AND tempo_dias IS NULL;

-- 5. Marca resenhas existentes
UPDATE l
SET l.resenhas = 'S'
FROM [Biblioteca].[dbo].[Leituras] l
WHERE l.resenhas IS NULL
  AND EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Resenhas] r WHERE r.id_leitura = l.id);

COMMIT;
