-- ============================================================
-- DDL: Tabela ListaDesafios
-- ============================================================
-- Execute este arquivo sempre que criar o banco do zero
-- ou ao atualizar o schema (suporte a livros não lidos no desafio)

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

-- ============================================================
-- DDL: Tabela DesafiosLeitura
-- Vincula livros do acervo (lidos ou não) a um desafio.
-- ============================================================

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'DesafiosLeitura'
)
BEGIN
    CREATE TABLE [Biblioteca].[dbo].[DesafiosLeitura] (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Titulo          NVARCHAR(500)  NOT NULL,
        IdLeitura       INT            NULL,
        LocalLeitura    NVARCHAR(50)   NULL,
        NomeDesafio     NVARCHAR(200)  NOT NULL,
        Sequencia       INT            NOT NULL,
        NaturezaDesafio NVARCHAR(200)  NULL,
        DataCadastro    DATETIME       NOT NULL CONSTRAINT DF_DesafiosLeitura_DataCadastro DEFAULT GETDATE()
    );
    PRINT 'Tabela DesafiosLeitura criada com sucesso.';
END
ELSE
BEGIN
    -- Adiciona coluna Titulo se não existir (migração do schema antigo)
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'DesafiosLeitura' AND COLUMN_NAME = 'Titulo'
    )
    BEGIN
        ALTER TABLE [Biblioteca].[dbo].[DesafiosLeitura]
            ADD Titulo NVARCHAR(500) NULL;
        PRINT 'Coluna Titulo adicionada em DesafiosLeitura.';
    END
    ELSE
    BEGIN
        PRINT 'Tabela DesafiosLeitura já está atualizada.';
    END
END
