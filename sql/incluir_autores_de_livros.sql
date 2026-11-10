-- Inclui na tabela Autor (Lista de Escritores) os autores que existem em Livros e ainda não estão em Autor.
--   * Nome limpo: sem espaços nas pontas, sem espaços duplos, NBSP/tab/quebra de linha viram espaço.
--   * Comparação com Autor ignora maiúsculas e espaços nas pontas.
--   * Campos com vários autores juntos (vírgula, ponto e vírgula, barra, "&", "E Outros",
--     "(autor)", "Diversos Autores") ficam de fora — precisam ser separados manualmente.
--   * Sexo, raça e nacionalidade: valor mais frequente entre os livros do autor;
--     em empate, o do livro mais recente (maior id).
-- Cópia de segurança: [dbo].[Autor_backup_20261108]
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
SET NOCOUNT ON;

IF OBJECT_ID('[Biblioteca].[dbo].[Autor_backup_20261108]') IS NULL
    SELECT * INTO [Biblioteca].[dbo].[Autor_backup_20261108] FROM [Biblioteca].[dbo].[Autor];

IF OBJECT_ID('tempdb..#n') IS NOT NULL DROP TABLE #n;

SELECT id,
       LTRIM(RTRIM(REPLACE(REPLACE(REPLACE(REPLACE(autor, NCHAR(160), N' '), CHAR(9), ' '), CHAR(13), ' '), CHAR(10), ' '))) AS nome,
       NULLIF(UPPER(LTRIM(RTRIM(sexo_autor))), '') AS sexo,
       NULLIF(LTRIM(RTRIM([raça])), '')            AS raca,
       NULLIF(LTRIM(RTRIM(nacionalidade)), '')     AS nac
INTO #n
FROM [Biblioteca].[dbo].[Livros]
WHERE autor IS NOT NULL AND LTRIM(RTRIM(autor)) <> '';

WHILE EXISTS (SELECT 1 FROM #n WHERE nome LIKE '%  %')
    UPDATE #n SET nome = REPLACE(nome, '  ', ' ') WHERE nome LIKE '%  %';

-- Já cadastrados em Autor
DELETE n FROM #n n
WHERE EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Autor] a
              WHERE LOWER(LTRIM(RTRIM(a.nome_autor))) = LOWER(n.nome));

-- Vários autores no mesmo campo
DELETE FROM #n
WHERE nome LIKE '%,%' OR nome LIKE '%;%' OR nome LIKE '%/%' OR nome LIKE '% & %'
   OR nome LIKE '% e outros' OR nome LIKE '% e [0-9]%' OR nome LIKE '% e % e %'
   OR nome LIKE '%(autor)%' OR nome LIKE '%(tradutor)%'
   OR nome = 'Diversos Autores'
   OR nome = 'Tim Lahaye E Jerry Jenkins'
   OR nome = 'Aryane Cararo E Duda Porto De Souza';

BEGIN TRAN;

;WITH nomes AS (SELECT DISTINCT nome FROM #n),
sx AS (SELECT nome, sexo, ROW_NUMBER() OVER (PARTITION BY nome ORDER BY COUNT(*) DESC, MAX(id) DESC) rn
       FROM #n WHERE sexo IS NOT NULL GROUP BY nome, sexo),
rc AS (SELECT nome, raca, ROW_NUMBER() OVER (PARTITION BY nome ORDER BY COUNT(*) DESC, MAX(id) DESC) rn
       FROM #n WHERE raca IS NOT NULL GROUP BY nome, raca),
nc AS (SELECT nome, nac, ROW_NUMBER() OVER (PARTITION BY nome ORDER BY COUNT(*) DESC, MAX(id) DESC) rn
       FROM #n WHERE nac IS NOT NULL GROUP BY nome, nac)
INSERT INTO [Biblioteca].[dbo].[Autor] (nome_autor, sexo_autor, [raça], nacionalidade)
SELECT n.nome, sx.sexo, rc.raca, nc.nac
FROM nomes n
LEFT JOIN sx ON sx.nome = n.nome AND sx.rn = 1
LEFT JOIN rc ON rc.nome = n.nome AND rc.rn = 1
LEFT JOIN nc ON nc.nome = n.nome AND nc.rn = 1;

SELECT @@ROWCOUNT AS autores_incluidos;

COMMIT;
