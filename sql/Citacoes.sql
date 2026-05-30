-- =============================================================
-- Tabela: Citacoes
-- Descrição: Frases e citações favoritas de livros
-- =============================================================

CREATE TABLE [Biblioteca].[dbo].[Citacoes] (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    citacao     NVARCHAR(MAX)  NOT NULL,
    livro       NVARCHAR(500)  NULL,
    autor       NVARCHAR(300)  NULL,
    ativo       BIT            NOT NULL DEFAULT 1,
    dt_cadastro DATETIME       DEFAULT GETDATE()
);
GO

-- =============================================================
-- Inserir citações favoritas
-- Substitua pelos seus trechos e livros preferidos
-- =============================================================

INSERT INTO [Biblioteca].[dbo].[Citacoes] (citacao, livro, autor) VALUES
(N'Não há navio que nos leve tão longe quanto um livro.', N'—', N'Emily Dickinson'),
(N'Uma sala sem livros é como um corpo sem alma.', N'—', N'Cícero'),
(N'Livros são espelhos: vemos neles apenas o que já temos dentro.', N'A Sombra do Vento', N'Carlos Ruiz Zafón'),
(N'Ler é o sopro que une as almas através do tempo.', N'—', N'—'),
(N'As palavras de um livro podem mudar o curso de uma vida.', N'—', N'—'),
(N'Cada livro lido é uma vida a mais que se vive.', N'—', N'—'),
(N'Há livros que nos consolam, há os que nos inquietam — os melhores fazem os dois.', N'—', N'—'),
(N'O prazer da leitura é um dos poucos que não desgastam com o uso.', N'—', N'—'),
(N'Se você não tiver tempo para ler, não terá o espaço, as ferramentas e as palavras para escrever.', N'On Writing', N'Stephen King'),
(N'A escuridão não pode expulsar a escuridão; somente a luz pode fazer isso. O ódio não pode expulsar o ódio; somente o amor pode fazer isso.', N'Uma Força Mais Poderosa que a Bomba', N'Martin Luther King Jr.');
GO

-- =============================================================
-- Verificar dados inseridos
-- =============================================================
-- SELECT * FROM [Biblioteca].[dbo].[Citacoes] ORDER BY id;
