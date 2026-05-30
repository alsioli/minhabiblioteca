
<script src="/php/pages/base/components/header/header.js"></script>

<header class="cabecalho-biblioteca">

    <!-- ── Bloco esquerda: Citações rotativas ─────────────────── -->
    <div class="bloco-esquerda">
        <p class="citacao-label">Frases de livros especiais</p>
        <div id="bloco-citacao" class="bloco-citacao-conteudo">
            <span class="citacao-texto">Carregando...</span>
        </div>
    </div>

    <!-- ── Bloco meio: Cards de contadores ────────────────────── -->
    <div class="bloco-meio">
        <div class="header-cards">

            <div class="header-card">
                <span class="header-card-numero" id="contador-ano-atual">—</span>
                <span class="header-card-label">Lidos em <?php echo date('Y'); ?></span>
            </div>

            <div class="header-card">
                <span class="header-card-numero" id="contador-ano-anterior">—</span>
                <span class="header-card-label" id="label-ano-anterior">Lidos em <?php echo date('Y') - 1; ?></span>
            </div>

            <div class="header-card">
                <span class="header-card-numero" id="contador-mes">—</span>
                <span class="header-card-label" id="label-ano-ant-mes">Até <?php echo date('m') . '/' . (date('Y') - 1); ?></span>
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
