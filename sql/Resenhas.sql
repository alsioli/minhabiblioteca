CREATE TABLE [Biblioteca].[dbo].[Resenhas] (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    id_leitura  INT NOT NULL,
    nome_livro  NVARCHAR(255),
    autor       NVARCHAR(255),
    mes_leitura NVARCHAR(20),
    avaliacao   DECIMAL(3,1),
    resenha     VARCHAR(MAX),
    created_at  DATETIME DEFAULT GETDATE()
);
