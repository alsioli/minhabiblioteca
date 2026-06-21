window.consulta_emprestimos_view = {

    _carregarSelects: async function () {
        try {
            // Origens vêm da própria view
            const respO = await fetch('/php/api/base/main/livros/consulta_emprestimos.php?origens=1');
            const jsonO = await respO.json();
            if (jsonO.status && Array.isArray(jsonO.data)) {
                const sel = document.getElementById('ceOrigem');
                if (sel) {
                    jsonO.data.filter(Boolean).forEach(function (v) {
                        const opt = document.createElement('option');
                        opt.value = opt.textContent = v;
                        sel.appendChild(opt);
                    });
                }
            }

            // Raça e País vêm do mesmo endpoint da Consulta Geral (tabela Livros)
            const respS = await fetch('/php/api/base/menu_lateral/biblioteca/selects_cadastro.php');
            const jsonS = await respS.json();
            if (jsonS.status && jsonS.data) {
                const selRaca = document.getElementById('ceRaca');
                if (selRaca) {
                    (jsonS.data.raca || []).filter(Boolean).forEach(function (v) {
                        const opt = document.createElement('option');
                        opt.value = opt.textContent = v;
                        selRaca.appendChild(opt);
                    });
                }
                const selPais = document.getElementById('cePais');
                if (selPais) {
                    (jsonS.data.nacionalidade || []).filter(Boolean).forEach(function (v) {
                        const opt = document.createElement('option');
                        opt.value = opt.textContent = v;
                        selPais.appendChild(opt);
                    });
                }
            }
        } catch (e) {
            console.error('[ConsultaEmprestimos] Erro ao carregar selects:', e);
        }
    },

    init: async function () {
        await this._carregarSelects();
        await this.buscar();
    },

    buscar: async function () {
        const titulo = (document.getElementById('ceTitulo') || {}).value || '';
        const autor  = (document.getElementById('ceAutor')  || {}).value || '';
        const status = (document.getElementById('ceStatus') || {}).value || '';
        const origem = (document.getElementById('ceOrigem') || {}).value || '';
        const sexo   = (document.getElementById('ceSexo')   || {}).value || '';
        const raca   = (document.getElementById('ceRaca')   || {}).value || '';
        const pais   = (document.getElementById('cePais')   || {}).value || '';

        const box = document.getElementById('ceTabela');
        if (!box) return;

        box.innerHTML = '<p class="text-muted small">Carregando...</p>';

        const params = new URLSearchParams();
        if (titulo.trim()) params.set('titulo', titulo.trim());
        if (autor.trim())  params.set('autor',  autor.trim());
        if (status)        params.set('status', status);
        if (origem)        params.set('origem', origem);
        if (sexo)          params.set('sexo',   sexo);
        if (raca)          params.set('raca',   raca);
        if (pais)          params.set('pais',   pais);

        try {
            const resp = await fetch('/php/api/base/main/livros/consulta_emprestimos.php?' + params.toString());
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = '<div class="alert alert-warning">' + (json.error || 'Erro ao consultar.') + '</div>';
                return;
            }

            this._renderTabela(json.data || []);
        } catch (e) {
            console.error('[ConsultaEmprestimos] Erro ao buscar:', e);
            const box2 = document.getElementById('ceTabela');
            if (box2) box2.innerHTML = '<div class="alert alert-danger">Erro ao carregar: ' + e.message + '</div>';
        }
    },

    limpar: function () {
        ['ceTitulo', 'ceAutor', 'ceStatus', 'ceOrigem', 'ceSexo', 'ceRaca', 'cePais'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        this.buscar();
    },

    _statusStyle: function (s) {
        if (!s) return '';
        var map = {
            'Lido':  'background:#d4edda;color:#155724',
            'Lendo': 'background:#cce5ff;color:#004085',
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
        const dir = this._sortDir === 'asc' ? 1 : -1;
        this._dadosCompletos.sort(function (a, b) {
            const va = String(a[col] || '').toLowerCase();
            const vb = String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._pagina = 0;
        const tbody = document.getElementById('ceTbody');
        if (tbody) tbody.innerHTML = '';
        this._carregarMais();
        this._atualizarHeadersSort();
    },

    _atualizarHeadersSort: function () {
        var cols = ['titulo', 'autor', 'serie', 'tema', 'status', 'avaliacao', 'origem'];
        var self = this;
        cols.forEach(function (col) {
            var th = document.getElementById('ceTh_' + col);
            if (!th) return;
            var label = th.getAttribute('data-label');
            th.innerHTML = label + (col === self._sortCol ? (self._sortDir === 'asc' ? ' ↑' : ' ↓') : '');
        });
    },

    _renderLinhas: function (inicio, fim) {
        const self  = this;
        const tbody = document.getElementById('ceTbody');
        if (!tbody) return;

        const tdSt = 'padding:5px 10px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;vertical-align:middle';
        let html = '';

        for (let i = inicio; i < fim; i++) {
            const row = this._dadosCompletos[i];
            const sc  = self._statusStyle(row.status);
            const tit = (row.titulo || '-').replace(/"/g, '&quot;');
            const aut = (row.autor  || '-').replace(/"/g, '&quot;');

            html += '<tr onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'\'">';
            html += '<td style="' + tdSt + ';font-weight:500;max-width:260px;overflow:hidden;'
                  + 'text-overflow:ellipsis;white-space:nowrap" title="' + tit + '">'
                  + (row.titulo || '-') + '</td>';
            html += '<td style="' + tdSt + ';max-width:180px;overflow:hidden;'
                  + 'text-overflow:ellipsis;white-space:nowrap" title="' + aut + '">'
                  + (row.autor || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">' + (row.serie || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">' + (row.tema  || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">'
                  + '<span style="padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:600;' + sc + '">'
                  + (row.status || '-') + '</span></td>';
            html += '<td style="' + tdSt + ';text-align:center;white-space:nowrap">'
                  + (row.avaliacao || '-') + '</td>';
            html += '<td style="' + tdSt + ';white-space:nowrap">'
                  + '<span style="padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:600;'
                  + 'background:rgba(8,145,178,0.1);color:#0891b2">'
                  + (row.origem || '-') + '</span></td>';
            html += '</tr>';
        }

        tbody.insertAdjacentHTML('beforeend', html);
    },

    _renderTabela: function (dados) {
        const box = document.getElementById('ceTabela');
        if (!box) return;

        if (!dados || dados.length === 0) {
            box.innerHTML = '<p class="text-muted small">Nenhum livro encontrado com os filtros selecionados.</p>';
            return;
        }

        this._dadosCompletos = dados;
        this._pagina = 0;

        const thSt = 'padding:6px 10px;text-align:left;border-bottom:2px solid #0891b2;'
                   + 'font-size:0.82rem;background:rgba(8,145,178,0.07);position:sticky;top:0;z-index:1;'
                   + 'white-space:nowrap;cursor:pointer;user-select:none;color:#0891b2';
        const thC  = 'text-align:center;';
        const self = this;

        function th(col, label, extra) {
            var ind = col === self._sortCol ? (self._sortDir === 'asc' ? ' ↑' : ' ↓') : '';
            return '<th id="ceTh_' + col + '" data-label="' + label + '" '
                 + 'style="' + thSt + (extra || '') + '" '
                 + 'onclick="consulta_emprestimos_view._sortarPor(\'' + col + '\')" '
                 + 'title="Clique para ordenar">'
                 + label + ind + '</th>';
        }

        let html = '<div id="ceContador" style="margin-bottom:6px;font-size:0.82rem;color:#555">'
                 + dados.length + ' livro(s) encontrado(s)</div>'
                 + '<div id="ceScroll" style="max-height:540px;overflow-y:auto;overflow-x:auto;'
                 + 'border:1px solid #dee2e6;border-radius:4px">'
                 + '<table style="width:100%;border-collapse:collapse;table-layout:auto">'
                 + '<thead><tr>'
                 + th('titulo',    'Titulo')
                 + th('autor',     'Autor')
                 + th('serie',     'Serie')
                 + th('tema',      'Tema')
                 + th('status',    'Status')
                 + th('avaliacao', 'Avaliacao', thC)
                 + th('origem',    'Origem')
                 + '</tr></thead>'
                 + '<tbody id="ceTbody"></tbody>'
                 + '</table></div>';

        box.innerHTML = html;
        this._carregarMais();

        const scroll = document.getElementById('ceScroll');
        if (scroll) {
            scroll.addEventListener('scroll', function () {
                if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 100) {
                    self._carregarMais();
                }
            });
        }
    },

    _carregarMais: function () {
        const inicio = this._pagina * this._PAGE_SIZE;
        if (inicio >= this._dadosCompletos.length) return;
        const fim = Math.min(inicio + this._PAGE_SIZE, this._dadosCompletos.length);
        this._renderLinhas(inicio, fim);
        this._pagina++;
        const contador = document.getElementById('ceContador');
        if (contador) {
            const visiveis = Math.min(this._pagina * this._PAGE_SIZE, this._dadosCompletos.length);
            contador.textContent = this._dadosCompletos.length + ' livro(s) encontrado(s)'
                + (visiveis < this._dadosCompletos.length ? ' — exibindo ' + visiveis : '');
        }
    }
};
