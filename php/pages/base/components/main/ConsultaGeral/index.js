window.consulta_geral_view = {

    _carregarSelects: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/biblioteca/selects_cadastro.php');
            const json = await resp.json();

            if (!json.status || !json.data) return;

            const selTipo = document.getElementById('cgTipoEdicao');
            if (selTipo) {
                (json.data.tipo_edicao || []).filter(Boolean).sort().forEach(function (v) {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = v;
                    selTipo.appendChild(opt);
                });
            }

            const selNat = document.getElementById('cgNatureza');
            if (selNat) {
                (json.data.natureza || []).filter(Boolean).sort().forEach(function (v) {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = v;
                    selNat.appendChild(opt);
                });
            }

            const selRaca = document.getElementById('cgRaca');
            if (selRaca) {
                (json.data.raca || []).filter(Boolean).sort().forEach(function (v) {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = v;
                    selRaca.appendChild(opt);
                });
            }

            const selPais = document.getElementById('cgPais');
            if (selPais) {
                (json.data.nacionalidade || []).filter(Boolean).sort().forEach(function (v) {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = v;
                    selPais.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('[ConsultaGeral] Erro ao carregar selects:', e);
        }
    },

    init: async function () {
        try {
            await this._carregarSelects();
            await this.buscar();
        } catch (e) {
            console.error('[ConsultaGeral] Erro em init:', e);
            alert('Erro ao inicializar Consulta Geral: ' + e.message);
        }
    },

    buscar: async function () {
        try {
            const titulo      = (document.getElementById('cgTitulo')     || {}).value || '';
            const autor       = (document.getElementById('cgAutor')      || {}).value || '';
            const tipo_edicao = (document.getElementById('cgTipoEdicao') || {}).value || '';
            const lido        = (document.getElementById('cgLido')       || {}).value || '';
            const paginas     = (document.getElementById('cgPaginas')    || {}).value || '';
            const natureza    = (document.getElementById('cgNatureza')   || {}).value || '';
            const sexo        = (document.getElementById('cgSexo')       || {}).value || '';
            const raca        = (document.getElementById('cgRaca')       || {}).value || '';
            const pais        = (document.getElementById('cgPais')       || {}).value || '';
            const mes         = (document.getElementById('cgMes')        || {}).value || '';

            const box = document.getElementById('cgTabela');
            if (!box) return;

            box.innerHTML = '<p class="text-muted small">Carregando...</p>';

            const params = new URLSearchParams();
            if (titulo.trim())  params.set('titulo',      titulo.trim());
            if (autor.trim())   params.set('autor',       autor.trim());
            if (tipo_edicao)    params.set('tipo_edicao', tipo_edicao);
            if (lido)           params.set('lido',        lido);
            if (paginas)        params.set('paginas',     paginas);
            if (natureza)       params.set('natureza', natureza);
            if (sexo)           params.set('sexo',     sexo);
            if (raca)           params.set('raca',     raca);
            if (pais)           params.set('pais',     pais);
            if (mes)            params.set('mes',      mes);

            const resp = await fetch('/php/api/base/main/livros/consulta_geral.php?' + params.toString());
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = '<div class="alert alert-warning">' + (json.error || 'Erro ao consultar.') + '</div>';
                return;
            }

            this._renderTabela(json.data || []);
        } catch (e) {
            console.error('[ConsultaGeral] Erro ao buscar:', e);
            const box = document.getElementById('cgTabela');
            if (box) box.innerHTML = '<div class="alert alert-danger">Erro ao carregar resultados: ' + e.message + '</div>';
        }
    },

    limpar: function () {
        try {
            const ids = ['cgTitulo', 'cgAutor', 'cgTipoEdicao', 'cgLido', 'cgPaginas', 'cgNatureza', 'cgSexo', 'cgRaca', 'cgPais', 'cgMes'];
            ids.forEach(function (id) {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.buscar();
        } catch (e) {
            console.error('[ConsultaGeral] Erro ao limpar:', e);
        }
    },

    _formatMes: function (m) {
        if (!m) return '-';
        const parts = m.split('-');
        return parts.length === 2 ? parts[1] + '/' + parts[0] : m;
    },

    _statusStyle: function (s) {
        if (!s) return '';
        var map = {
            'Lido':          'background:#d4edda;color:#155724',
            'Lendo':         'background:#cce5ff;color:#004085',
            'Nao quero ler': 'background:#f8d7da;color:#721c24',
        };
        for (var key in map) {
            if (s.toLowerCase().indexOf(key.toLowerCase()) !== -1) return map[key];
        }
        return 'background:#fff3cd;color:#856404';
    },

    _dadosCompletos: [],
    _pagina: 0,
    _PAGE_SIZE: 30,
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
        const numCol = ['id', 'paginas'].indexOf(col) !== -1;
        this._dadosCompletos.sort(function (a, b) {
            const va = numCol ? (parseInt(a[col], 10) || 0) : String(a[col] || '').toLowerCase();
            const vb = numCol ? (parseInt(b[col], 10) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._pagina = 0;
        const tbody = document.getElementById('cgTbody');
        if (tbody) tbody.innerHTML = '';
        this._carregarMais();
        this._atualizarHeadersSort();
    },

    _atualizarHeadersSort: function () {
        var cols = ['id','titulo','autor','tipo_edicao','status','paginas','avaliacao','tema','natureza','mes_leitura'];
        var self = this;
        cols.forEach(function (col) {
            var th = document.getElementById('cgTh_' + col);
            if (!th) return;
            var label = th.getAttribute('data-label');
            th.innerHTML = label + (col === self._sortCol ? (self._sortDir === 'asc' ? ' ↑' : ' ↓') : '');
        });
    },

    _renderLinhas: function (inicio, fim) {
        const self  = this;
        const tbody = document.getElementById('cgTbody');
        if (!tbody) return;

        const tdSt = 'padding:5px 10px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;vertical-align:middle';
        let html = '';

        for (let i = inicio; i < fim; i++) {
            const row = this._dadosCompletos[i];
            const sc  = self._statusStyle(row.status);
            const tit = (row.titulo || '-').replace(/"/g, '&quot;');
            const aut = (row.autor  || '-').replace(/"/g, '&quot;');

            html += '<tr onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'\'">';
            html += '<td style="' + tdSt + ';text-align:center;white-space:nowrap;color:#888">'
                  + (row.id || '-') + '</td>';
            html += '<td style="' + tdSt + ';font-weight:500;max-width:280px;overflow:hidden;'
                  + 'text-overflow:ellipsis;white-space:nowrap" title="' + tit + '">'
                  + (row.titulo || '-') + '</td>';
            html += '<td style="' + tdSt + ';max-width:200px;overflow:hidden;'
                  + 'text-overflow:ellipsis;white-space:nowrap" title="' + aut + '">'
                  + (row.autor || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">' + (row.tipo_edicao || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">'
                  + '<span style="padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:600;' + sc + '">'
                  + (row.status || '-') + '</span></td>';
            html += '<td style="' + tdSt + ';text-align:center;white-space:nowrap">'
                  + (row.paginas || '-') + '</td>';
            html += '<td style="' + tdSt + ';text-align:center;white-space:nowrap">' + (row.avaliacao || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">' + (row.tema     || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">' + (row.natureza || '-') + '</td>';
            html += '<td style="' + tdSt + ';text-align:center;white-space:nowrap">'
                  + self._formatMes(row.mes_leitura) + '</td>';
            html += '</tr>';
        }

        tbody.insertAdjacentHTML('beforeend', html);
    },

    _renderTabela: function (dados) {
        try {
            const box = document.getElementById('cgTabela');
            if (!box) return;

            if (!dados || dados.length === 0) {
                box.innerHTML = '<p class="text-muted small">Nenhum livro encontrado com os filtros selecionados.</p>';
                return;
            }

            this._dadosCompletos = dados;
            this._pagina = 0;

            const thSt = 'padding:6px 10px;text-align:left;border-bottom:2px solid #6a2bbf;'
                       + 'font-size:0.82rem;background:rgba(106,43,191,0.07);position:sticky;top:0;z-index:1;'
                       + 'white-space:nowrap;cursor:pointer;user-select:none;color:#6a2bbf';
            const thC  = 'text-align:center;';
            const self = this;

            function th(col, label, extra) {
                var ind = col === self._sortCol ? (self._sortDir === 'asc' ? ' ↑' : ' ↓') : '';
                return '<th id="cgTh_' + col + '" data-label="' + label + '" '
                     + 'style="' + thSt + (extra || '') + '" '
                     + 'onclick="consulta_geral_view._sortarPor(\'' + col + '\')" '
                     + 'title="Clique para ordenar">'
                     + label + ind + '</th>';
            }

            let html = '<div id="cgContador" style="margin-bottom:6px;font-size:0.82rem;color:#555">'
                     + dados.length + ' livro(s) encontrado(s)'
                     + '</div>'
                     + '<div id="cgScroll" style="max-height:540px;overflow-y:auto;overflow-x:auto;'
                     + 'border:1px solid #dee2e6;border-radius:4px">'
                     + '<table style="width:100%;border-collapse:collapse;table-layout:auto">'
                     + '<thead><tr>'
                     + th('id',          'ID',          thC)
                     + th('titulo',      'Titulo')
                     + th('autor',       'Autor')
                     + th('tipo_edicao', 'Tipo Edicao')
                     + th('status',      'Status')
                     + th('paginas',     'Paginas',     thC)
                     + th('avaliacao',   'Avaliacao',   thC)
                     + th('tema',        'Tema')
                     + th('natureza',    'Natureza')
                     + th('mes_leitura', 'Mes Leitura', thC)
                     + '</tr></thead>'
                     + '<tbody id="cgTbody"></tbody>'
                     + '</table></div>';

            box.innerHTML = html;

            this._carregarMais();

            const scroll = document.getElementById('cgScroll');
            if (scroll) {
                scroll.addEventListener('scroll', function () {
                    const threshold = 100;
                    if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - threshold) {
                        self._carregarMais();
                    }
                });
            }
        } catch (e) {
            console.error('[ConsultaGeral] Erro ao renderizar tabela:', e);
            const box = document.getElementById('cgTabela');
            if (box) box.innerHTML = '<div class="alert alert-danger">Erro ao renderizar tabela: ' + e.message + '</div>';
        }
    },

    _carregarMais: function () {
        const inicio = this._pagina * this._PAGE_SIZE;
        if (inicio >= this._dadosCompletos.length) return;

        const fim = Math.min(inicio + this._PAGE_SIZE, this._dadosCompletos.length);
        this._renderLinhas(inicio, fim);
        this._pagina++;

        const contador = document.getElementById('cgContador');
        if (contador) {
            const visiveis = Math.min(this._pagina * this._PAGE_SIZE, this._dadosCompletos.length);
            contador.textContent = this._dadosCompletos.length + ' livro(s) encontrado(s)'
                + (visiveis < this._dadosCompletos.length ? ' — exibindo ' + visiveis : '');
        }
    }
};

