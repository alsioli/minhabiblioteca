-- ============================================================
-- DDL: Tabela ListaDesafios
-- ============================================================

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'ListaDesafios'
)
BEGIN
    CREATE TABLE [Biblioteca].[dbo].[ListaDesafios] (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        tematica    NVARCHAR(200) NOT NULL,
        descricao   NVARCHAR(MAX) NULL,
        ano         INT           NULL,
        meta_livros INT           NULL,
        situacao    NVARCHAR(50)  NULL CONSTRAINT DF_ListaDesafios_situacao DEFAULT 'Em andamento',
        data_inicio DATE          NULL,
        data_fim    DATE          NULL,
        criado_em   DATETIME      CONSTRAINT DF_ListaDesafios_criado_em DEFAULT GETDATE(),
        bAtivo      BIT           NOT NULL CONSTRAINT DF_ListaDesafios_bAtivo DEFAULT 1
    );
    PRINT 'Tabela ListaDesafios criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela ListaDesafios já existe — nenhuma alteração necessária.';
END
