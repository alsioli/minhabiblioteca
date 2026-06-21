let citacoes_view = {

    _dados: [],
    _livroSelecionado: null,
    _sortCol: '',
    _sortDir: 'asc',

    _sortarPor: function (col) {
        if (this._sortCol === col) {
            this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this._sortCol = col;
            this._sortDir = 'asc';
        }
        const dir    = this._sortDir === 'asc' ? 1 : -1;
        const numCol = ['avaliacao_livro', 'avaliacao_frase'].includes(col);
        this._dados.sort(function (a, b) {
            const va = numCol ? (parseFloat(a[col]) || 0) : String(a[col] || '').toLowerCase();
            const vb = numCol ? (parseFloat(b[col]) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._renderTabela(this._dados);
    },

    buscar: async function () {
        const busca   = (document.getElementById('citBuscaTitulo') || {}).value || '';
        const citacao = (document.getElementById('citBuscaTexto')  || {}).value || '';

        const box = document.getElementById('citacoesTabela');
        if (!box) return;

        box.innerHTML = '<p class="text-muted small">Carregando...</p>';
        this._livroSelecionado = null;

        const params = new URLSearchParams();
        if (busca)   params.set('busca',   busca);
        if (citacao) params.set('citacao', citacao);

        try {
            const resp = await fetch('/php/api/base/main/citacoes/listar_citacoes.php?' + params.toString());
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = `<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`;
                return;
            }

            this._dados = json.data || [];
            this._renderTabela(this._dados);
        } catch (e) {
            console.error('Erro ao carregar citações:', e);
            box.innerHTML = '<div class="alert alert-danger">Erro ao carregar citações.</div>';
        }
    },

    _renderTabela: function (dados) {
        const box = document.getElementById('citacoesTabela');

        if (!dados || dados.length === 0) {
            box.innerHTML = '<p class="text-muted small">Nenhuma citação encontrada.</p>';
            return;
        }

        const thSt  = 'padding:6px 8px;text-align:left;border-bottom:2px solid #d97706;font-size:0.82rem;background:rgba(217,119,6,0.07);position:sticky;top:0;z-index:1;cursor:pointer;user-select:none;color:#d97706';
        const tdSt  = 'padding:5px 8px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;vertical-align:top';
        const tdCtr = 'padding:5px 8px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;text-align:center;white-space:nowrap;vertical-align:top';
        const sc = this._sortCol, sd = this._sortDir;
        const th = (col, label, w) => {
            const ind = col === sc ? (sd === 'asc' ? ' ↑' : ' ↓') : '';
            return `<th style="${thSt}${w ? ';width:' + w : ''}" onclick="citacoes_view._sortarPor('${col}')" title="Clique para ordenar">${label}${ind}</th>`;
        };

        let html = `
            <div style="margin-bottom:6px;font-size:0.82rem;color:#666">
                ${dados.length} citação(ões) encontrada(s)
            </div>
            <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead>
                    <tr>
                        ${th('titulo',           'Título')}
                        ${th('autor',            'Autor')}
                        ${th('capitulo',         'Capítulo',        '85px')}
                        ${th('pagina_percentual','Pág./Percentual', '110px')}
                        ${th('avaliacao_livro',  'Av. Livro',       '80px')}
                        ${th('avaliacao_frase',  'Av. Frase',       '80px')}
                        ${th('frases',           'Citação')}
                        <th style="padding:6px 8px;background:rgba(217,119,6,0.07);border-bottom:2px solid #d97706;width:90px"></th>
                    </tr>
                </thead>
                <tbody>
        `;

        dados.forEach(function (row) {
            const frasePreview = (row.frases || '').length > 100
                ? row.frases.substring(0, 100) + '...'
                : (row.frases || '—');

            const tituloEsc = (row.titulo || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const autorEsc  = (row.autor  || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

            html += `
                <tr onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                    <td style="${tdSt};font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.titulo || '').replace(/"/g, '&quot;')}">
                        ${row.titulo || '—'}
                    </td>
                    <td style="${tdSt};max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.autor || '').replace(/"/g, '&quot;')}">
                        ${row.autor || '—'}
                    </td>
                    <td style="${tdCtr}">${row.capitulo || '—'}</td>
                    <td style="${tdCtr}">${row.pagina_percentual || '—'}</td>
                    <td style="${tdCtr}">${row.avaliacao_livro != null ? row.avaliacao_livro : '—'}</td>
                    <td style="${tdCtr}">${row.avaliacao_frase != null ? row.avaliacao_frase : '—'}</td>
                    <td style="${tdSt};max-width:320px;font-style:italic">"${frasePreview}"</td>
                    <td style="${tdCtr}">
                        <button class="btn btn-sm btn-outline-primary"
                                style="font-size:0.78rem;padding:2px 8px"
                                onclick="citacoes_view.mostrarLivro('${tituloEsc}', '${autorEsc}')">
                            Ver livro
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        box.innerHTML = html;
    },

    mostrarLivro: function (titulo, autor) {
        this._livroSelecionado = titulo;

        const citacoesDoLivro = this._dados.filter(function (r) {
            return r.titulo === titulo;
        });

        if (citacoesDoLivro.length === 0) {
            const campoBusca = document.getElementById('citBuscaTitulo');
            const campoTexto = document.getElementById('citBuscaTexto');
            if (campoBusca) campoBusca.value = titulo;
            if (campoTexto) campoTexto.value = '';
            this.buscar();
            return;
        }

        this._renderDetalhe(titulo, autor, citacoesDoLivro);
    },

    _renderDetalhe: function (titulo, autor, citacoes) {
        const box = document.getElementById('citacoesTabela');

        const thSt = 'padding:6px 10px;text-align:left;border-bottom:2px solid #d97706;font-size:0.82rem;background:rgba(217,119,6,0.07);color:#d97706';
        const tdSt = 'padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;vertical-align:top';

        let linhas = '';
        citacoes.forEach(function (r, i) {
            linhas += `
                <tr onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                    <td style="${tdSt};width:40px;text-align:center;color:#888">${i + 1}</td>
                    <td style="${tdSt};width:90px;text-align:center">${r.capitulo || '—'}</td>
                    <td style="${tdSt};width:110px;text-align:center">${r.pagina_percentual || '—'}</td>
                    <td style="${tdSt};width:75px;text-align:center">${r.avaliacao_frase != null ? r.avaliacao_frase : '—'}</td>
                    <td style="${tdSt};white-space:pre-wrap;word-break:break-word;font-style:italic">"${r.frases || '—'}"</td>
                </tr>
            `;
        });

        const avLivro   = citacoes[0] && citacoes[0].avaliacao_livro != null ? citacoes[0].avaliacao_livro : '—';
        const tituloEsc = titulo.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const autorEsc  = (autor || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        box.innerHTML = `
            <div class="d-flex align-items-center flex-wrap mb-3" style="gap:8px">
                <button class="btn btn-sm btn-outline-secondary"
                        onclick="citacoes_view.voltarLista()">
                    ← Voltar
                </button>
                <div class="flex-grow-1">
                    <strong style="font-size:1rem">${titulo}</strong>
                    ${autor ? '<span style="color:#666;font-size:0.88rem;margin-left:8px">— ' + autor + '</span>' : ''}
                    <span style="font-size:0.82rem;color:#888;margin-left:10px">Avaliação do livro: ${avLivro}</span>
                </div>
                <button class="btn btn-sm btn-outline-dark"
                        onclick="citacoes_view.gerarPDF('${tituloEsc}', '${autorEsc}')">
                    📄 Gerar PDF
                </button>
            </div>
            <p style="font-size:0.82rem;color:#666;margin-bottom:10px">
                ${citacoes.length} citação(ões) registrada(s)
            </p>
            <div id="citacoesDetalheBlock">
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr>
                            <th style="${thSt};width:40px">#</th>
                            <th style="${thSt};width:90px">Capítulo</th>
                            <th style="${thSt};width:110px">Pág./Percentual</th>
                            <th style="${thSt};width:75px">Av. Frase</th>
                            <th style="${thSt}">Citação</th>
                        </tr>
                    </thead>
                    <tbody>${linhas}</tbody>
                </table>
            </div>
        `;
    },

    voltarLista: function () {
        this._livroSelecionado = null;
        this._renderTabela(this._dados);
    },

    gerarPDF: function (titulo, autor) {
        const bloco = document.getElementById('citacoesDetalheBlock');
        if (!bloco) return;

        const janela = window.open('', '_blank', 'width=860,height=700');
        if (!janela) return;

        janela.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Citações — ${titulo}</title>
                <style>
                    body { font-family: Georgia, serif; padding: 36px; color: #222; }
                    h1 { font-size: 1.15rem; margin: 0 0 4px; }
                    h2 { font-size: 0.92rem; font-weight: normal; color: #555; margin: 0 0 24px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { text-align: left; padding: 6px 10px; border-bottom: 2px solid #333; font-size: 0.85rem; background: #f5f5f5; }
                    td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 0.84rem; vertical-align: top; }
                    td:last-child { font-style: italic; white-space: pre-wrap; word-break: break-word; }
                    @media print { body { padding: 10px; } }
                </style>
            </head>
            <body>
                <h1>${titulo}</h1>
                <h2>${autor || ''}</h2>
                ${bloco.innerHTML}
                <script>window.onload = function () { window.print(); };<\/script>
            </body>
            </html>
        `);
        janela.document.close();
    },

};

window.citacoes_view = citacoes_view;
