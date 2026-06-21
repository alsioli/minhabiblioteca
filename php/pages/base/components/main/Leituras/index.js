let leituras_view = {

    // Dados armazenados para re-ordenação
    _andDados: [],
    _mesDados: [],
    _anoDados: [],

    // Estado de ordenação por tabela
    _andSortCol: '', _andSortDir: 'asc',
    _mesSortCol: '', _mesSortDir: 'asc',
    _anoSortCol: '', _anoSortDir: 'asc',

    _sortarAndamento: function (col) {
        this._andSortCol = this._andSortCol === col && this._andSortDir === 'asc' ? (this._andSortDir = 'desc', col) : (this._andSortDir = 'asc', col);
        const dir = this._andSortDir === 'asc' ? 1 : -1;
        const num = ['dias_lendo', 'percentual', 'pagina_atual'].includes(col);
        this._andDados.sort((a, b) => {
            const va = num ? (parseFloat(a[col]) || 0) : String(a[col] || '').toLowerCase();
            const vb = num ? (parseFloat(b[col]) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._renderAndamento(this._andDados);
    },

    _sortarMes: function (col) {
        this._mesSortCol = this._mesSortCol === col && this._mesSortDir === 'asc' ? (this._mesSortDir = 'desc', col) : (this._mesSortDir = 'asc', col);
        const dir = this._mesSortDir === 'asc' ? 1 : -1;
        const num = ['paginas', 'avaliacao', 'tempo_dias'].includes(col);
        this._mesDados.sort((a, b) => {
            const va = num ? (parseFloat(a[col]) || 0) : String(a[col] || '').toLowerCase();
            const vb = num ? (parseFloat(b[col]) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._renderMes(this._mesDados);
    },

    _sortarAno: function (col) {
        this._anoSortCol = this._anoSortCol === col && this._anoSortDir === 'asc' ? (this._anoSortDir = 'desc', col) : (this._anoSortDir = 'asc', col);
        const dir = this._anoSortDir === 'asc' ? 1 : -1;
        const num = ['paginas', 'avaliacao', 'tempo_dias'].includes(col);
        this._anoDados.sort((a, b) => {
            const va = num ? (parseFloat(a[col]) || 0) : String(a[col] || '').toLowerCase();
            const vb = num ? (parseFloat(b[col]) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._renderAno(this._anoDados);
    },

    // ─── Utilitário de formatação de data ───────────────────────
    _fmtData: function (val) {
        if (!val) return '—';
        const s = String(val).split('T')[0].split('-');
        return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : val;
    },

    _fmtDataHora: function (val) {
        if (!val) return '—';
        const partes = String(val).replace('T', ' ').split(' ');
        const data   = partes[0].split('-');
        const hora   = partes[1] ? partes[1].slice(0, 5) : '';
        const dataBR = data.length === 3 ? `${data[2]}/${data[1]}/${data[0]}` : partes[0];
        return hora ? `${dataBR} ${hora}` : dataBR;
    },

    _estrelas: function (val) {
        if (val == null || val === '') return '—';
        const n = Math.round(parseFloat(val));
        return '⭐'.repeat(Math.max(0, Math.min(n, 5)));
    },

    // ─────────────────────────────────────────────────────────────
    //  LEITURAS EM ANDAMENTO
    // ─────────────────────────────────────────────────────────────

    carregarAndamento: async function () {
        $('#leiturasAndamentoTabela').html('<p class="text-muted small">Carregando...</p>');

        // Sincroniza automaticamente livros com 100% antes de exibir a lista
        try {
            const syncResp = await fetch(
                '/php/api/base/menu_lateral/minhasLeituras/sincronizar_leituras.php',
                { method: 'POST' }
            );
            const syncJson = await syncResp.json();
            if (syncJson.status && syncJson.data && syncJson.data.sincronizados > 0) {
                // Atualiza os cards do header para refletir os novos livros finalizados
                if (typeof window.atualizarHeaderContadores === 'function') {
                    window.atualizarHeaderContadores();
                }
            }
        } catch (e) {
            console.warn('Aviso ao sincronizar leituras antes de exibir andamento:', e);
        }

        try {
            const resp = await fetch('/php/api/base/main/leituras/listar_andamento.php');
            const json = await resp.json();

            if (!json.status) {
                $('#leiturasAndamentoTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Nenhum dado encontrado.'}</div>`
                );
                return;
            }

            this._andDados = json.data || [];
            this._andSortCol = ''; this._andSortDir = 'asc';
            this._renderAndamento(this._andDados);
        } catch (e) {
            console.error('Erro ao carregar leituras em andamento:', e);
            $('#leiturasAndamentoTabela').html(
                '<div class="alert alert-danger">Erro ao carregar dados.</div>'
            );
        }
    },

    _renderAndamento: function (lista) {
        const container = $('#leiturasAndamentoTabela');

        if (lista.length === 0) {
            container.html('<p class="text-muted">Nenhuma leitura em andamento.</p>');
            return;
        }

        const thA = 'padding:6px 8px;border-bottom:2px solid #7c3aed;cursor:pointer;user-select:none;white-space:nowrap;color:#7c3aed';
        const scA = this._andSortCol, sdA = this._andSortDir;
        const thAnd = (col, label, align) => {
            const ind = col === scA ? (sdA === 'asc' ? ' ↑' : ' ↓') : '';
            return `<th style="${thA};text-align:${align || 'left'}" onclick="leituras_view._sortarAndamento('${col}')" title="Clique para ordenar">${label}${ind}</th>`;
        };

        let html = `
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:rgba(124,58,237,0.07);position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        ${thAnd('titulo',             'Título')}
                        ${thAnd('autor',              'Autor')}
                        ${thAnd('tipo_midia',         'Mídia')}
                        ${thAnd('data_inicio',        'Início',           'center')}
                        ${thAnd('dias_lendo',         'Dias lendo',       'center')}
                        ${thAnd('percentual',         '% Lido',           'center')}
                        ${thAnd('pagina_atual',       'Pág. Atual',       'center')}
                        ${thAnd('ultima_atualizacao', 'Últ. Atualização', 'center')}
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        lista.forEach(l => {
            const dias = parseInt(l.dias_lendo) || 0;

            let diasBg, diasCor;
            if (dias > 30)       { diasBg = '#ffebee'; diasCor = '#c62828'; }
            else if (dias > 15)  { diasBg = '#fff3e0'; diasCor = '#e65100'; }
            else                 { diasBg = '#e8f5e9'; diasCor = '#2e7d32'; }

            const pct = l.percentual != null
                ? `${parseFloat(l.percentual).toFixed(1)}%`
                : '—';
            const pag = l.pagina_atual != null ? l.pagina_atual : '—';

            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:5px 8px;white-space:normal;word-break:break-word;max-width:260px">${l.titulo || ''}</td>
                    <td style="padding:5px 8px;white-space:normal;max-width:160px">${l.autor || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.tipo_midia || '—'}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_inicio)}</td>
                    <td style="padding:5px 8px;text-align:center">
                        <span style="padding:2px 10px;border-radius:4px;background:${diasBg};color:${diasCor};font-weight:bold">${dias}</span>
                    </td>
                    <td style="padding:5px 8px;text-align:center">${pct}</td>
                    <td style="padding:5px 8px;text-align:center">${pag}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap;font-size:0.78rem">${this._fmtDataHora(l.ultima_atualizacao)}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.html(html);
    },

    // ─────────────────────────────────────────────────────────────
    //  LEITURAS DO MÊS
    // ─────────────────────────────────────────────────────────────

    carregarMes: async function (mesISO) {
        if (!mesISO) return;

        // Envia no formato YYYY-MM que listar_mes.php espera
        $('#leiturasMesTabela').html('<p class="text-muted small">Carregando...</p>');
        $('#leiturasMesBadge').text('0 livros');

        try {
            const resp = await fetch(
                `/php/api/base/main/leituras/listar_mes.php?mes=${encodeURIComponent(mesISO)}`
            );
            const json = await resp.json();

            const lista = (json.status && json.data) ? json.data : [];
            const qtd   = lista.length;
            $('#leiturasMesBadge').text(`${qtd} livro${qtd !== 1 ? 's' : ''}`);

            if (!json.status || qtd === 0) {
                $('#leiturasMesTabela').html('<p class="text-muted">Nenhum livro registrado neste mês.</p>');
                return;
            }

            this._mesDados = lista;
            this._mesSortCol = ''; this._mesSortDir = 'asc';
            this._renderMes(this._mesDados);
        } catch (e) {
            console.error('Erro ao carregar leituras do mês:', e);
            $('#leiturasMesTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderMes: function (lista) {
        const thM = 'padding:6px 8px;border-bottom:2px solid #4a76a8;cursor:pointer;user-select:none;white-space:nowrap;color:#4a76a8';
        const scM = this._mesSortCol, sdM = this._mesSortDir;
        const thMes = (col, label, align) => {
            const ind = col === scM ? (sdM === 'asc' ? ' ↑' : ' ↓') : '';
            return `<th style="${thM};text-align:${align || 'left'}" onclick="leituras_view._sortarMes('${col}')" title="Clique para ordenar">${label}${ind}</th>`;
        };

        let html = `
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:rgba(74,118,168,0.07);position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        ${thMes('titulo',     'Título')}
                        ${thMes('autor',      'Autor')}
                        ${thMes('natureza',   'Natureza')}
                        ${thMes('tipo_midia', 'Mídia')}
                        ${thMes('paginas',    'Páginas',  'center')}
                        ${thMes('avaliacao',  'Avaliação','center')}
                        ${thMes('data_inicio','Início',   'center')}
                        ${thMes('data_fim',   'Fim',      'center')}
                        ${thMes('tempo_dias', 'Tempo',    'center')}
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        lista.forEach(l => {
            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:5px 8px;white-space:normal;word-break:break-word;max-width:260px">${l.titulo || ''}</td>
                    <td style="padding:5px 8px;white-space:normal;max-width:160px">${l.autor || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.natureza || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.tipo_midia || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${l.paginas || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${this._estrelas(l.avaliacao)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_inicio)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_fim)}</td>
                    <td style="padding:5px 8px;text-align:center">${l.tempo_dias != null ? l.tempo_dias + 'd' : '—'}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#leiturasMesTabela').html(html);
    },

    // ─────────────────────────────────────────────────────────────
    //  LEITURAS DO ANO
    // ─────────────────────────────────────────────────────────────

    _classGrupoMidia: function (tipo) {
        const t = (tipo || '').toLowerCase().trim();
        if (t.includes('epub') || t.includes('ebook') || t.includes('e-book') ||
            t.includes('kindle') || t.includes('digital')) return 'ebook';
        if (t === 'tag') return 'tag';
        return 'fisico';
    },

    carregarAno: async function (ano) {
        if (!ano) return;

        $('#leiturasAnoTabela').html('<p class="text-muted small">Carregando...</p>');
        $('#leiturasAnoTotal, #leiturasAnoEbook, #leiturasAnoTag, #leiturasAnoFisico').text('—');

        try {
            const resp = await fetch(
                `/php/api/base/main/leituras/listar_ano.php?ano=${encodeURIComponent(ano)}`
            );
            const json = await resp.json();

            if (!json.status) {
                $('#leiturasAnoTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Nenhum dado encontrado.'}</div>`
                );
                return;
            }

            const lista  = json.data || [];
            const total  = lista.length;
            const self   = this;
            const ebooks = lista.filter(l => self._classGrupoMidia(l.tipo_midia) === 'ebook').length;
            const tags   = lista.filter(l => self._classGrupoMidia(l.tipo_midia) === 'tag').length;
            const fisico = lista.filter(l => self._classGrupoMidia(l.tipo_midia) === 'fisico').length;
            const pct    = n => total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%';

            $('#leiturasAnoTotal').text(`${total} livro${total !== 1 ? 's' : ''}`);
            $('#leiturasAnoEbook').text(`${ebooks} ebook${ebooks !== 1 ? 's' : ''} — ${pct(ebooks)}`);
            $('#leiturasAnoTag').text(`${tags} TAG — ${pct(tags)}`);
            $('#leiturasAnoFisico').text(`${fisico} físico${fisico !== 1 ? 's' : ''} — ${pct(fisico)}`);

            if (total === 0) {
                $('#leiturasAnoTabela').html('<p class="text-muted">Nenhum livro registrado neste ano.</p>');
                return;
            }

            this._anoDados = lista;
            this._anoSortCol = ''; this._anoSortDir = 'asc';
            this._renderAno(this._anoDados);
        } catch (e) {
            console.error('Erro ao carregar leituras do ano:', e);
            $('#leiturasAnoTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderAno: function (lista) {
        const thN = 'padding:6px 8px;border-bottom:2px solid #0891b2;cursor:pointer;user-select:none;white-space:nowrap;color:#0891b2';
        const scN = this._anoSortCol, sdN = this._anoSortDir;
        const thAno = (col, label, align) => {
            const ind = col === scN ? (sdN === 'asc' ? ' ↑' : ' ↓') : '';
            return `<th style="${thN};text-align:${align || 'left'}" onclick="leituras_view._sortarAno('${col}')" title="Clique para ordenar">${label}${ind}</th>`;
        };

        let html = `
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:rgba(8,145,178,0.07);position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2;width:30px">#</th>
                        ${thAno('titulo',     'Título')}
                        ${thAno('autor',      'Autor')}
                        ${thAno('natureza',   'Natureza')}
                        ${thAno('tipo_midia', 'Mídia')}
                        ${thAno('paginas',    'Páginas',  'center')}
                        ${thAno('avaliacao',  'Avaliação','center')}
                        ${thAno('data_inicio','Início',   'center')}
                        ${thAno('data_fim',   'Fim',      'center')}
                        ${thAno('tempo_dias', 'Tempo',    'center')}
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        lista.forEach((l, idx) => {
            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:5px 8px;text-align:center;color:#999;font-size:0.78rem">${idx + 1}</td>
                    <td style="padding:5px 8px;white-space:normal;word-break:break-word;max-width:260px">${l.titulo || ''}</td>
                    <td style="padding:5px 8px;white-space:normal;max-width:160px">${l.autor || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.natureza || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.tipo_midia || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${l.paginas || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${this._estrelas(l.avaliacao)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_inicio)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_fim)}</td>
                    <td style="padding:5px 8px;text-align:center">${l.tempo_dias != null ? l.tempo_dias + 'd' : '—'}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#leiturasAnoTabela').html(html);
    },

    // ─────────────────────────────────────────────────────────────
    //  LIVROS POR NACIONALIDADE
    // ─────────────────────────────────────────────────────────────

    carregarNacionalidade: async function () {
        $('#livrosAgrupTabela').html('<p class="text-muted small">Carregando...</p>');
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_nacionalidade.php');
            const json = await resp.json();

            if (!json.status) {
                $('#livrosAgrupTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Erro ao carregar dados.'}</div>`
                );
                return;
            }

            this._renderAgrupamento(json.data, 'nacionalidade', 'Nacionalidade');
        } catch (e) {
            console.error('Erro ao carregar por nacionalidade:', e);
            $('#livrosAgrupTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    // ─────────────────────────────────────────────────────────────
    //  LIVROS POR RAÇA
    // ─────────────────────────────────────────────────────────────

    carregarRaca: async function () {
        $('#livrosAgrupTabela').html('<p class="text-muted small">Carregando...</p>');
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_raca.php');
            const json = await resp.json();

            if (!json.status) {
                $('#livrosAgrupTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Erro ao carregar dados.'}</div>`
                );
                return;
            }

            this._renderAgrupamento(json.data, 'raca', 'Raça');
        } catch (e) {
            console.error('Erro ao carregar por raça:', e);
            $('#livrosAgrupTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderAgrupamento: function (data, campoChave, labelColuna) {
        const totalGeral = data.total_geral || 0;
        const linhas     = data.linhas      || [];

        if (linhas.length === 0) {
            $('#livrosAgrupTabela').html('<p class="text-muted">Nenhum dado encontrado.</p>');
            return;
        }

        // Cores fixas para as categorias (ciclo)
        const cores = ['#4e79a7','#f28e2b','#e15759','#76b7b2',
                       '#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac'];

        let html = `
            <div class="mb-3">
                <span style="font-size:0.9rem;color:#555">
                    Total de livros no acervo: <strong>${totalGeral}</strong>
                </span>
            </div>
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:rgba(8,145,178,0.07);position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #0891b2;color:#0891b2">${labelColuna}</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2">Total</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2">Lidos</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2">Lendo</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2">Não Lidos</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #0891b2;color:#0891b2;min-width:160px">% Lidos</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #0891b2;color:#0891b2">% do Acervo</th>
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        linhas.forEach((row, idx) => {
            const chave      = row[campoChave] || '—';
            const total      = parseInt(row.total)    || 0;
            const lidos      = parseInt(row.lidos)    || 0;
            const lendo      = parseInt(row.lendo)    || 0;
            const naoLidos   = parseInt(row.nao_lidos) || 0;
            const pctLidos   = total > 0 ? ((lidos / total) * 100).toFixed(1) : '0.0';
            const pctAcervo  = totalGeral > 0 ? ((total / totalGeral) * 100).toFixed(1) : '0.0';
            const cor        = cores[idx % cores.length];

            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:6px 10px;font-weight:500">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
                                     background:${cor};margin-right:6px"></span>
                        ${chave}
                    </td>
                    <td style="padding:6px 10px;text-align:center;font-weight:bold">${total}</td>
                    <td style="padding:6px 10px;text-align:center;color:#28a745">${lidos}</td>
                    <td style="padding:6px 10px;text-align:center;color:#fd7e14">${lendo}</td>
                    <td style="padding:6px 10px;text-align:center;color:#6c757d">${naoLidos}</td>
                    <td style="padding:6px 10px">
                        <div style="display:flex;align-items:center;gap:6px">
                            <div style="flex:1;background:#e9ecef;border-radius:4px;height:8px;overflow:hidden">
                                <div style="width:${pctLidos}%;background:${cor};height:100%;border-radius:4px"></div>
                            </div>
                            <span style="white-space:nowrap;font-size:0.8rem">${pctLidos}%</span>
                        </div>
                    </td>
                    <td style="padding:6px 10px;text-align:center;font-size:0.8rem;color:#888">${pctAcervo}%</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#livrosAgrupTabela').html(html);
    }

};

window.leituras_view = leituras_view;
