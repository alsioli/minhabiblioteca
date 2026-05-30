
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js"></script>


<script src="/php/pages/base/components/menu_lateral/index.js"></script>


<aside class="menu-lateral">
    <nav>

        <div class="grupo">
            <button class="botao-menu">Biblioteca</button>
                <ul class="submenu">
                    <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalNovoLivro()">Cadastro de livro</a></li>
                    <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalAtualizarLivro()">Alterar cadastro</a></li>
                </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Leituras Coletivas</button>
            <ul>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalNovaLC()">Cadastro de Grupo de LC</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalNovaCronogramaLC()">Nova LC</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirCronogramaLC()">Acompanhamento das LC´s</a></li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Minhas leituras</button>
            <ul>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalComecarLivro()">Começando um livro</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalAtualizandoLeitura()">Atualizando a leitura atual</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalMinhasImpressoes()">Minhas Impressões</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalTBRMensal()">Cadastro TBR Mensal</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalFraseFavorita()">Frase Favorita</a></li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Consultas</button>
            <ul>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirLeiturasAndamento()">Leituras em Andamento</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirLeiturasMes()">Leituras do Mês</a></li>
                <li>Leituras por ano</li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirNacionalidade()">Livros por Nacionalidade</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirRaca()">Livros por Raça</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirEstatisticasLivros()">Livros e Ebooks — Estatísticas</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirListaPorAutor()">Lista por Autor</a></li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Desafios</button>
            <ul>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirModalNovoDesafio()">Cadastro de desafios</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirAcompanhamentoDesafios()">Acompanhamento de desafios</a></li>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirDesafiosAndamento()">Desafios em andamento</a></li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Gráficos</button>
            <ul>
                <li><a class="btn-submenu" href="#" onclick="menuLateral.abrirGraficos()">Gráficos de Leituras</a></li>
                <li>Fazer gráfico com comandos</li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Lista de desejos</button>
            <ul>
                <li>WishList Amazon</li>
            </ul>
        </div>

        <div class="grupo">
            <button class="botao-menu">Listas por autor</button>
            <ul>
                <li>Cadastrar listas - modal</li>
                <li>Listas autores</li>
                <li>Alterar dados</li>
            </ul>
        </div>

    </nav>
</aside>


