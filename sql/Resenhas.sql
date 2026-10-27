CREATE TABLE [Biblioteca].[dbo].[Resenhas] (
    id_leitura  INT NOT NULL,
    nome_livro  VARCHAR(255),
    autor       VARCHAR(255),
    mes_leitura VARCHAR(20),
    avaliacao   FLOAT,
    resenhas    VARCHAR(MAX)
);
