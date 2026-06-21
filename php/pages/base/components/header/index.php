
<script src="/php/pages/base/components/header/header.js"></script>

<div class="menu-backdrop" id="menuBackdrop" onclick="toggleMenu()"></div>

<header class="cabecalho-biblioteca">

    <button class="btn-hamburger" onclick="toggleMenu()" aria-label="Menu">
        <span></span><span></span><span></span>
    </button>

    <!-- ── Bloco esquerda: Citações rotativas ─────────────────── -->
    <div class="bloco-esquerda">
        <p class="citacao-label">Frases de livros especiais</p>
        <div id="bloco-citacao" class="bloco-citacao-conteudo">
            <span class="citacao-texto">Carregando...</span>
        </div>
    </div>

    <!-- ── Bloco meio: Cards maiores ──────────────────────────── -->
    <div class="bloco-meio">
        <div class="header-cards">

            <!-- Card 1: Livros por ano -->
            <div class="header-card header-card-lg">
                <p class="hc-titulo">Livros por Ano</p>
                <div class="hc-linhas-ano">
                    <?php
                    $anoAtual = (int)date('Y');
                    for ($y = $anoAtual; $y >= $anoAtual - 2; $y--) {
                        echo '<div class="hc-linha-ano">';
                        echo '<span class="hc-ano-label">' . $y . '</span>';
                        echo '<span class="hc-ano-valor" id="hc-ano-' . $y . '">—</span>';
                        echo '</div>';
                    }
                    ?>
                </div>
            </div>

            <!-- Card 2: Média mensal (últimos 12 meses) -->
            <div class="header-card header-card-lg" style="align-items:center">
                <p class="hc-titulo" style="text-align:center">Média Mensal</p>
                <span class="header-card-numero" id="hc-media">—</span>
                <span class="header-card-label">livros / mês</span>
                <small class="hc-periodo" id="hc-media-periodo">últimos 12 meses</small>
            </div>

            <!-- Card 3: Top 3 países -->
            <div class="header-card header-card-lg">
                <p class="hc-titulo">Top Países</p>
                <div id="hc-top-paises" class="hc-top-lista">
                    <span style="font-size:10px;color:rgba(255,255,255,0.5)">Carregando...</span>
                </div>
            </div>

        </div>
    </div>

    <!-- ── Bloco direita: Título + botão início ─────────────────── -->
    <div class="bloco-direita">
        <h1>Biblioteca<br>Alessandra</h1>
        <button onclick="voltarParaInicio()"
                style="margin-top:8px;padding:4px 14px;font-size:0.8rem;
                       background:transparent;border:1px solid rgba(255,255,255,0.6);
                       color:#fff;border-radius:4px;cursor:pointer;letter-spacing:0.03em;
                       transition:background 0.2s,border-color 0.2s"
                onmouseover="this.style.background='rgba(255,255,255,0.15)';this.style.borderColor='#fff'"
                onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,255,255,0.6)'">
            ⌂ Início
        </button>
    </div>

</header>
