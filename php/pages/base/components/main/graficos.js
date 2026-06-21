/**
 * graficos.js — Renderiza todos os gráficos da biblioteca
 * Dependência: Chart.js (carregado via CDN antes deste script)
 */

let graficos = {

    _instancias: {},

    // ── Paleta ──────────────────────────────────────────────────
    _cores: {
        lido:      '#28a745',
        lendo:     '#fd7e14',
        naoLido:   '#adb5bd',
        bar1:      'rgba(78, 121, 167, 0.82)',
        bar2:      'rgba(242, 142, 43, 0.82)',
        concluida: 'rgba(40, 167, 69, 0.82)',
        andamento: 'rgba(253, 126, 20, 0.82)',
    },

    // ── Destrói instância anterior com segurança ────────────────
    _destruir: function (id) {
        try {
            if (this._instancias[id]) {
                this._instancias[id].destroy();
            }
        } catch (e) {
            // canvas pode ter sido removido do DOM — ignora
        }
        delete this._instancias[id];
    },

    // ── Ordena meses "MM/YYYY" cronologicamente ──────────────────
    _sortKey: function (mesStr) {
        const p = (mesStr || '').split('/');
        return p.length === 2 ? parseInt(p[1]) * 100 + parseInt(p[0]) : 0;
    },

    // ── Plugin inline: mostra valores acima das barras ────────────
    _pluginValoresBarras: {
        id: 'valoresBarras',
        afterDatasetsDraw: function (chart) {
            var ctx = chart.ctx;
            chart.data.datasets.forEach(function (dataset, i) {
                var meta = chart.getDatasetMeta(i);
                if (meta.hidden) return;
                meta.data.forEach(function (bar, j) {
                    var val = dataset.data[j];
                    if (!val || val <= 0) return;
                    ctx.save();
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillStyle = '#444';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(val, bar.x, bar.y - 2);
                    ctx.restore();
                });
            });
        }
    },

    // ── Pivot: [{mes, total}] → {mes: total} ───────────────────
    _pivot: function (lista, campoMes, campoVal) {
        const map = {};
        (lista || []).forEach(function (r) {
            map[r[campoMes]] = parseInt(r[campoVal]) || 0;
        });
        return map;
    },

    // ── Exibe erro no container ──────────────────────────────────
    _erroContainer: function (msg) {
        const el = document.getElementById('graficosContainer');
        if (el) el.innerHTML = '<div class="alert alert-danger mt-3">' + msg + '</div>';
    },

    // ── Inicializa todos os gráficos ─────────────────────────────
    init: async function () {
        try {
            const [resMes, resAcervo, resTBR] = await Promise.all([
                fetch('/php/api/base/main/livros/listar_grafico_mes.php').then(function (r) { return r.json(); }),
                fetch('/php/api/base/main/livros/listar_grafico_acervo.php').then(function (r) { return r.json(); }),
                fetch('/php/api/base/main/livros/listar_grafico_tbr_vs_leituras.php').then(function (r) { return r.json(); }),
            ]);

            if (!resMes.status) {
                console.error('Erro API gráfico mês:', resMes.error);
            } else {
                this._renderGraficosMes(resMes.data || {});
            }

            if (!resAcervo.status) {
                console.error('Erro API gráfico acervo:', resAcervo.error);
            } else {
                this._renderGraficosAcervo(resAcervo.data || {});
            }

            if (!resTBR.status) {
                console.error('Erro API gráfico TBR:', resTBR.error);
            } else {
                this._renderTBRvsLeituras(resTBR.data || {});
            }

        } catch (e) {
            console.error('Erro ao carregar gráficos:', e);
            this._erroContainer('Erro ao carregar gráficos. Verifique a conexão com o banco de dados.');
        }
    },

    // ════════════════════════════════════════════════════════════
    //  GRÁFICOS DE LEITURAS POR MÊS
    // ════════════════════════════════════════════════════════════

    _renderGraficosMes: function (data) {
        const totalMap     = this._pivot(data.total_por_mes,      'mes', 'total');
        const concluidaMap = this._pivot(data.concluidas_por_mes, 'mes', 'total');
        const andamentoMap = this._pivot(data.andamento_por_mes,  'mes', 'total');

        const todosMeses = [...new Set([
            ...Object.keys(totalMap),
            ...Object.keys(concluidaMap),
            ...Object.keys(andamentoMap),
        ])].sort(function (a, b) { return graficos._sortKey(a) - graficos._sortKey(b); });

        const semDados = '<p class="text-muted text-center py-4">Sem dados de leituras mensais.</p>';

        if (todosMeses.length === 0) {
            const el1 = document.getElementById('graf-mes-total');
            const el2 = document.getElementById('graf-mes-andamento');
            if (el1) el1.parentElement.innerHTML = semDados;
            if (el2) el2.parentElement.innerHTML = '';
            return;
        }

        const totalArr     = todosMeses.map(function (m) { return totalMap[m]     || 0; });
        const concluidaArr = todosMeses.map(function (m) { return concluidaMap[m] || 0; });
        const andamentoArr = todosMeses.map(function (m) { return andamentoMap[m] || 0; });

        // ── Gráfico 1: Total de leituras por mês ────────────────
        this._destruir('graf-mes-total');
        const el1 = document.getElementById('graf-mes-total');
        if (!el1) return;
        this._instancias['graf-mes-total'] = new Chart(el1.getContext('2d'), {
            type: 'bar',
            data: {
                labels: todosMeses,
                datasets: [{
                    label: 'Leituras registradas',
                    data: totalArr,
                    backgroundColor: this._cores.bar1,
                    borderColor: 'rgba(78,121,167,1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ' ' + ctx.parsed.y + ' leitura' + (ctx.parsed.y !== 1 ? 's' : '');
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: [this._pluginValoresBarras]
        });

        // ── Gráfico 2: Concluídas vs Em andamento ───────────────
        this._destruir('graf-mes-andamento');
        const el2 = document.getElementById('graf-mes-andamento');
        if (!el2) return;
        this._instancias['graf-mes-andamento'] = new Chart(el2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: todosMeses,
                datasets: [
                    {
                        label: 'Concluídas',
                        data: concluidaArr,
                        backgroundColor: this._cores.concluida,
                        borderColor: 'rgba(40,167,69,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Em andamento (iniciadas)',
                        data: andamentoArr,
                        backgroundColor: this._cores.andamento,
                        borderColor: 'rgba(253,126,20,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: [this._pluginValoresBarras]
        });
    },

    // ════════════════════════════════════════════════════════════
    //  GRÁFICOS DO ACERVO (ROSCA)
    // ════════════════════════════════════════════════════════════

    _renderGraficosAcervo: function (data) {
        this._renderRosca('graf-fisicos', data.fisicos, 'Livros Físicos');
        this._renderRosca('graf-tag',     data.tag,     'Tag');
        this._renderRosca('graf-ebooks',  data.ebooks,  'Ebooks / Kindle');
        this._renderGeral('graf-geral',   data.geral);
    },

    _renderRosca: function (canvasId, row, titulo) {
        const el = document.getElementById(canvasId);
        if (!el) return;

        const lidos   = parseInt((row && row.lidos)    || 0);
        const lendo   = parseInt((row && row.lendo)    || 0);
        const naoLido = parseInt((row && row.nao_lidos) || 0);
        const total   = parseInt((row && row.total)    || 0);

        const labelEl = document.getElementById(canvasId + '-total');
        if (labelEl) labelEl.textContent = total + ' livro' + (total !== 1 ? 's' : '');

        if (total === 0) {
            el.parentElement.innerHTML =
                '<p class="text-muted text-center py-3" style="font-size:0.85rem">' +
                'Sem dados para <strong>' + titulo + '</strong>.</p>';
            return;
        }

        this._destruir(canvasId);
        const elAtual = document.getElementById(canvasId);
        if (!elAtual) return;

        const ctx = elAtual.getContext('2d');
        const cores = this._cores;

        this._instancias[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lidos', 'Lendo', 'Não lidos'],
                datasets: [{
                    data: [lidos, lendo, naoLido],
                    backgroundColor: [cores.lido, cores.lendo, cores.naoLido],
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            generateLabels: function (chart) {
                                var ds  = chart.data.datasets[0];
                                var tot = ds.data.reduce(function (a, b) { return a + b; }, 0);
                                return chart.data.labels.map(function (lbl, i) {
                                    var val = ds.data[i];
                                    var pct = tot > 0 ? Math.round((val / tot) * 100) : 0;
                                    return {
                                        text:       lbl + ': ' + val + ' (' + pct + '%)',
                                        fillStyle:  ds.backgroundColor[i],
                                        strokeStyle:'#fff',
                                        lineWidth:  2,
                                        index:      i,
                                        hidden:     false
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                const pct = total > 0 ? ((c.parsed / total) * 100).toFixed(1) : 0;
                                return ' ' + c.label + ': ' + c.parsed + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centro_' + canvasId,
                afterDraw: function (chart) {
                    const c   = chart.ctx;
                    const w   = chart.width;
                    const h   = chart.height;
                    const pct = total > 0 ? Math.round((lidos / total) * 100) + '%' : '0%';

                    c.save();                           // salva estado ANTES de modificar
                    c.font = 'bold ' + Math.round(h / 6) + 'px sans-serif';
                    c.fillStyle    = '#28a745';
                    c.textAlign    = 'center';
                    c.textBaseline = 'middle';
                    c.fillText(pct, w / 2, h / 2 - 12);
                    c.font      = Math.round(h / 12) + 'px sans-serif';
                    c.fillStyle = '#888';
                    c.fillText('lidos', w / 2, h / 2 + 10);
                    c.restore();                        // restaura estado APÓS modificar
                }
            }]
        });
    },

    // ════════════════════════════════════════════════════════════
    //  GRÁFICO: TBR PLANEJADO vs LEITURAS CONCLUÍDAS POR MÊS
    // ════════════════════════════════════════════════════════════

    _renderTBRvsLeituras: function (data) {
        const tbrMap   = this._pivot(data.tbr_por_mes,   'mes', 'total');
        const lidasMap = this._pivot(data.lidas_por_mes, 'mes', 'total');

        const todosMeses = [...new Set([
            ...Object.keys(tbrMap),
            ...Object.keys(lidasMap),
        ])].sort(function (a, b) { return graficos._sortKey(a) - graficos._sortKey(b); });

        const el = document.getElementById('graf-tbr-vs-leituras');
        if (!el) return;

        if (todosMeses.length === 0) {
            el.parentElement.innerHTML =
                '<p class="text-muted text-center py-4">Sem dados de TBR ou leituras para comparar.</p>';
            return;
        }

        const tbrArr   = todosMeses.map(function (m) { return tbrMap[m]   || 0; });
        const lidasArr = todosMeses.map(function (m) { return lidasMap[m] || 0; });

        this._destruir('graf-tbr-vs-leituras');
        const elAtual = document.getElementById('graf-tbr-vs-leituras');
        if (!elAtual) return;

        this._instancias['graf-tbr-vs-leituras'] = new Chart(elAtual.getContext('2d'), {
            type: 'bar',
            data: {
                labels: todosMeses,
                datasets: [
                    {
                        label: 'TBR Planejado',
                        data: tbrArr,
                        backgroundColor: 'rgba(108, 117, 125, 0.75)',
                        borderColor: 'rgba(108,117,125,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Leituras Concluídas',
                        data: lidasArr,
                        backgroundColor: 'rgba(40, 167, 69, 0.82)',
                        borderColor: 'rgba(40,167,69,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + ' livro' + (ctx.parsed.y !== 1 ? 's' : '');
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: [this._pluginValoresBarras]
        });
    },

    _renderGeral: function (canvasId, geral) {
        const el = document.getElementById(canvasId);
        if (!el || !geral || geral.length === 0) return;

        const labels  = geral.map(function (r) { return r.status; });
        const valores = geral.map(function (r) { return parseInt(r.total) || 0; });
        const total   = valores.reduce(function (a, b) { return a + b; }, 0);

        const labelEl = document.getElementById(canvasId + '-total');
        if (labelEl) labelEl.textContent = total + ' livro' + (total !== 1 ? 's' : '');

        const coresGeral = [
            '#28a745', '#fd7e14', '#adb5bd',
            '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'
        ];

        this._destruir(canvasId);
        const elAtual = document.getElementById(canvasId);
        if (!elAtual) return;

        this._instancias[canvasId] = new Chart(elAtual.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: coresGeral.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            generateLabels: function (chart) {
                                var ds  = chart.data.datasets[0];
                                var tot = ds.data.reduce(function (a, b) { return a + b; }, 0);
                                return chart.data.labels.map(function (lbl, i) {
                                    var val = ds.data[i];
                                    var pct = tot > 0 ? Math.round((val / tot) * 100) : 0;
                                    return {
                                        text:       lbl + ': ' + val + ' (' + pct + '%)',
                                        fillStyle:  ds.backgroundColor[i],
                                        strokeStyle:'#fff',
                                        lineWidth:  2,
                                        index:      i,
                                        hidden:     false
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                const pct = total > 0 ? ((c.parsed / total) * 100).toFixed(1) : 0;
                                return ' ' + c.label + ': ' + c.parsed + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

};

window.graficos = graficos;
