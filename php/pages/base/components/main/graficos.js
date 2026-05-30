/**
 * graficos.js — Renderiza todos os gráficos da biblioteca
 * Dependência: Chart.js (carregado via CDN antes deste script)
 */

let graficos = {

    _instancias: {},   // guarda instâncias para destruir antes de recriar

    // ── Paleta ──────────────────────────────────────────────────
    _cores: {
        lido:     '#28a745',
        lendo:    '#fd7e14',
        naoLido:  '#adb5bd',
        bar1:     'rgba(78, 121, 167, 0.82)',
        bar2:     'rgba(242, 142, 43, 0.82)',
        concluida:'rgba(40, 167, 69, 0.82)',
        andamento:'rgba(253, 126, 20, 0.82)',
        border:   'rgba(0,0,0,0)',
    },

    // ── Utilitário: destrói gráfico anterior se existir ─────────
    _destruir: function (id) {
        if (this._instancias[id]) {
            this._instancias[id].destroy();
            delete this._instancias[id];
        }
    },

    // ── Ordena meses "MM/YYYY" cronologicamente ──────────────────
    _sortKey: function (mesStr) {
        const p = (mesStr || '').split('/');
        return p.length === 2 ? parseInt(p[1]) * 100 + parseInt(p[0]) : 0;
    },

    // ── Pivot: array [{mes, total}] → mapa {mes: total} ─────────
    _pivot: function (lista, campoMes, campoVal) {
        const map = {};
        (lista || []).forEach(r => { map[r[campoMes]] = parseInt(r[campoVal]) || 0; });
        return map;
    },

    // ── Inicializa todos os gráficos ─────────────────────────────
    init: async function () {
        try {
            const [resMes, resAcervo] = await Promise.all([
                fetch('/php/api/base/main/livros/listar_grafico_mes.php').then(r => r.json()),
                fetch('/php/api/base/main/livros/listar_grafico_acervo.php').then(r => r.json()),
            ]);

            if (resMes.status)    this._renderGraficosMes(resMes.data);
            if (resAcervo.status) this._renderGraficosAcervo(resAcervo.data);

        } catch (e) {
            console.error('Erro ao carregar gráficos:', e);
            document.getElementById('graficosContainer').innerHTML =
                '<div class="alert alert-danger">Erro ao carregar gráficos.</div>';
        }
    },

    // ════════════════════════════════════════════════════════════
    //  GRÁFICOS DE LEITURAS POR MÊS
    // ════════════════════════════════════════════════════════════

    _renderGraficosMes: function (data) {
        const totalMap     = this._pivot(data.total_por_mes,      'mes', 'total');
        const concluidaMap = this._pivot(data.concluidas_por_mes, 'mes', 'total');
        const andamentoMap = this._pivot(data.andamento_por_mes,  'mes', 'total');

        // Coleta todos os meses presentes e ordena cronologicamente
        const todosMeses = [...new Set([
            ...Object.keys(totalMap),
            ...Object.keys(concluidaMap),
            ...Object.keys(andamentoMap),
        ])].sort((a, b) => this._sortKey(a) - this._sortKey(b));

        if (todosMeses.length === 0) {
            document.getElementById('graf-mes-total').parentElement.innerHTML =
                '<p class="text-muted text-center py-4">Sem dados de leituras mensais.</p>';
            document.getElementById('graf-mes-andamento').parentElement.innerHTML = '';
            return;
        }

        const totalArr     = todosMeses.map(m => totalMap[m]     || 0);
        const concluidaArr = todosMeses.map(m => concluidaMap[m] || 0);
        const andamentoArr = todosMeses.map(m => andamentoMap[m] || 0);

        // ── Gráfico 1: Total de leituras por mês ────────────────
        this._destruir('graf-mes-total');
        const ctx1 = document.getElementById('graf-mes-total').getContext('2d');
        this._instancias['graf-mes-total'] = new Chart(ctx1, {
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
                    title:  { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y} leitura${ctx.parsed.y !== 1 ? 's' : ''}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: '#f0f0f0' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });

        // ── Gráfico 2: Concluídas vs Em andamento por mês ───────
        this._destruir('graf-mes-andamento');
        const ctx2 = document.getElementById('graf-mes-andamento').getContext('2d');
        this._instancias['graf-mes-andamento'] = new Chart(ctx2, {
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
                            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: '#f0f0f0' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    // ════════════════════════════════════════════════════════════
    //  GRÁFICOS DO ACERVO (ROSCA)
    // ════════════════════════════════════════════════════════════

    _renderGraficosAcervo: function (data) {
        this._renderRosca('graf-fisicos', data.fisicos,
            'Livros Físicos', '(Estante, 1a. Prateleira, Presente)');
        this._renderRosca('graf-tag',    data.tag,
            'Tag', '');
        this._renderRosca('graf-ebooks', data.ebooks,
            'Ebooks / Kindle', '');
        this._renderGeral('graf-geral',  data.geral);
    },

    _renderRosca: function (canvasId, row, titulo, subtitulo) {
        const el = document.getElementById(canvasId);
        if (!el) return;

        const lidos   = parseInt(row?.lidos   || 0);
        const lendo   = parseInt(row?.lendo   || 0);
        const naoLido = parseInt(row?.nao_lidos || 0);
        const total   = parseInt(row?.total   || 0);

        // Atualiza label do card
        const labelEl = document.getElementById(canvasId + '-total');
        if (labelEl) labelEl.textContent = total + ' livros';

        if (total === 0) {
            el.parentElement.innerHTML = `<p class="text-muted text-center py-3" style="font-size:0.85rem">
                Sem dados para <strong>${titulo}</strong>.</p>`;
            return;
        }

        this._destruir(canvasId);
        const ctx = el.getContext('2d');
        this._instancias[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lidos', 'Lendo', 'Não lidos'],
                datasets: [{
                    data: [lidos, lendo, naoLido],
                    backgroundColor: [
                        this._cores.lido,
                        this._cores.lendo,
                        this._cores.naoLido,
                    ],
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
                    legend: { position: 'bottom', labels: { font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const pct = total > 0
                                    ? ((ctx.parsed / total) * 100).toFixed(1)
                                    : 0;
                                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centro',
                afterDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.restore();
                    const pct = total > 0
                        ? Math.round((lidos / total) * 100) + '%'
                        : '0%';
                    ctx.font = `bold ${Math.round(height / 6)}px sans-serif`;
                    ctx.fillStyle = '#28a745';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(pct, width / 2, height / 2 - 12);
                    ctx.font = `${Math.round(height / 12)}px sans-serif`;
                    ctx.fillStyle = '#888';
                    ctx.fillText('lidos', width / 2, height / 2 + 10);
                    ctx.save();
                }
            }]
        });
    },

    _renderGeral: function (canvasId, geral) {
        const el = document.getElementById(canvasId);
        if (!el || !geral || geral.length === 0) return;

        const labels = geral.map(r => r.status);
        const valores = geral.map(r => parseInt(r.total) || 0);
        const total = valores.reduce((a, b) => a + b, 0);

        const coresGeral = [
            '#28a745', '#fd7e14', '#adb5bd',
            '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'
        ];

        const labelEl = document.getElementById(canvasId + '-total');
        if (labelEl) labelEl.textContent = total + ' livros';

        this._destruir(canvasId);
        const ctx = el.getContext('2d');
        this._instancias[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
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
                    legend: { position: 'bottom', labels: { font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.parsed} (${total > 0 ? ((ctx.parsed/total)*100).toFixed(1) : 0}%)`
                        }
                    }
                }
            }
        });
    }

};

window.graficos = graficos;
