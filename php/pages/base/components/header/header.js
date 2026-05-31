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

            // Card 1: Livros por ano
            if (d.anos) {
                Object.keys(d.anos).forEach(function (ano) {
                    const el = document.getElementById('hc-ano-' + ano);
                    if (el) el.textContent = d.anos[ano];
                });
            }

            // Card 2: Média mensal
            const elMedia   = document.getElementById('hc-media');
            const elPeriodo = document.getElementById('hc-media-periodo');
            if (elMedia) {
                elMedia.textContent = d.media_mensal != null
                    ? parseFloat(d.media_mensal).toFixed(1)
                    : '—';
            }
            if (elPeriodo && d.periodo_media_fmt) {
                elPeriodo.textContent = d.periodo_media_fmt;
            }

            // Card 3: Top países
            const elTop = document.getElementById('hc-top-paises');
            if (elTop && d.top_paises && d.top_paises.length > 0) {
                const medals = ['🥇', '🥈', '🥉'];
                elTop.innerHTML = d.top_paises.map(function (p, i) {
                    return '<div class="hc-top-item">' +
                        '<span class="hc-top-medal">' + (medals[i] || (i + 1) + '.') + '</span>' +
                        '<span class="hc-top-pais">' + (p.pais || '—') + '</span>' +
                        '<span class="hc-top-count">' + p.total + '</span>' +
                        '</div>';
                }).join('');
            } else if (elTop) {
                elTop.innerHTML = '<span style="font-size:10px;color:rgba(255,255,255,0.5)">Sem dados</span>';
            }

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
