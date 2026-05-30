/**
 * header.js — Citações rotativas + contadores de leituras no header
 */
(function () {
    'use strict';

    let _citacoes  = [];
    let _idxAtual  = 0;
    let _intervalo = null;

    // ── Carrega e exibe citações ──────────────────────────────────
    async function carregarCitacoes() {
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_citacoes.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) return;

            _citacoes = json.data;
            exibirCitacao(0);

            // Troca a cada 10 segundos
            _intervalo = setInterval(function () {
                _idxAtual = (_idxAtual + 1) % _citacoes.length;
                exibirCitacao(_idxAtual);
            }, 10000);

        } catch (e) {
            console.error('Erro ao carregar citações:', e);
        }
    }

    function exibirCitacao(idx) {
        const el = document.getElementById('bloco-citacao');
        if (!el) return;

        const c = _citacoes[idx];
        if (!c) return;

        // Fade out → atualiza → fade in
        el.style.opacity = '0';
        setTimeout(function () {
            const temAtribuicao = (c.livro && c.livro !== '—') || (c.autor && c.autor !== '—');
            const livro  = (c.livro && c.livro !== '—') ? c.livro  : '';
            const autor  = (c.autor && c.autor !== '—') ? c.autor  : '';
            const sep    = livro && autor ? ' — ' : '';
            const atrib  = temAtribuicao ? `<span class="citacao-atrib">${livro}${sep}${autor}</span>` : '';

            el.innerHTML = `
                <span class="citacao-texto">"${c.citacao}"</span>
                ${atrib}
            `;
            el.style.opacity = '1';
        }, 350);
    }

    // ── Carrega e exibe contadores ────────────────────────────────
    async function carregarContadores() {
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_contadores_header.php');
            const json = await resp.json();

            if (!json.status) return;

            const d = json.data;

            const elAnoAtual = document.getElementById('contador-ano-atual');
            const elAnoAnt   = document.getElementById('contador-ano-anterior');
            const elMes      = document.getElementById('contador-mes');
            const elLblAnt   = document.getElementById('label-ano-anterior');
            const elLblMes   = document.getElementById('label-ano-ant-mes');

            if (elAnoAtual) elAnoAtual.textContent = d.lidos_ano_atual    ?? '—';
            if (elAnoAnt)   elAnoAnt.textContent   = d.lidos_ano_anterior ?? '—';
            if (elMes)      elMes.textContent       = d.lidos_ano_ant_mes ?? '—';
            if (elLblAnt)   elLblAnt.textContent    = 'Lidos em ' + d.ano_anterior;
            if (elLblMes)   elLblMes.textContent    = 'Lidos em ' + d.mes_ref_fmt;

        } catch (e) {
            console.error('Erro ao carregar contadores do header:', e);
        }
    }

    // ── Inicializa ao carregar a página ──────────────────────────
    function init() {
        carregarCitacoes();
        carregarContadores();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// ── Retorna ao dashboard principal ───────────────────────────
window.voltarParaInicio = function () {
    $.get('/php/pages/base/components/main/index.php', function (html) {
        const innerHtml = $('<div>').html(html).find('#mainConteudo').html();
        if (innerHtml) {
            $('#mainConteudo').html(innerHtml);
        }
        $.getScript('/php/pages/base/components/main/dashboard.js')
            .done(function () {
                if (window.dashboard) dashboard.init();
            });
    });
};
