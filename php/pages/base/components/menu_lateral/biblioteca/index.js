const http = {
    GET: async function (url) {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    },

    POST: async function (url, body) {
        const response = await fetch(url, {
            method: 'POST',
            body,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }
};

let biblioteca = {
    
    tipo_edicao: [],
    natureza: [],
    tema: [],
    genero: [],
    editora: [],

    init: function () {
        this.carregarSelects();
    },    


    carregarSelects: async function () {
        try {
            let response = await http.GET('/php/api/base/menu_lateral/biblioteca/selects_cadastro.php');

            if (!response.status) {
                console.error('Erro ao carregar selects:', response.error);
                return;
            }

            this.tema       = response.data?.tema       || [];
            this.tipo_edicao= response.data?.tipo_edicao|| [];
            this.natureza   = response.data?.natureza   || [];
            this.genero     = response.data?.genero     || [];
            this.editora    = response.data?.editora    || [];

            this._popularDatalist(this.tema,    'datalist_tema');
            this._popularDatalist(this.genero,  'datalist_genero');
            this._popularDatalist(this.editora, 'datalist_editora');
            this.select_tipo_edicao(this.tipo_edicao, '#select_tipo_edicao');
            this.select_natureza(this.natureza, '#select_natureza');
            this.select_tipo_edicao(this.tipo_edicao, '#select_tipo_edicao_atualizar');
            this.select_natureza(this.natureza, '#select_natureza_atualizar');

            // Carrega o select de local de cadastro e a lista de autores
            await this.carregarLocalCadastro();
            await this.carregarAutores();
        } catch (error) {
            console.error('Falha ao carregar selects:', error);
        }
    },

    carregarLocalCadastro: async function () {
        try {
            const resp = await http.GET('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            if (!resp.status) return;

            const sel = $('#select_local_cadastro');
            if (!sel.length) return;

            sel.empty().append('<option value="">Selecione o local...</option>');
            resp.data.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar local de cadastro:', e);
        }
    },

    carregarAutores: async function () {
        try {
            var resp = await http.GET('/php/api/base/menu_lateral/biblioteca/listar_autores.php?busca=');
            if (resp.status && Array.isArray(resp.data)) {
                var nomes = resp.data.map(function (a) { return a.nome; }).filter(Boolean);
                this._popularDatalist(nomes, 'datalist_autor');
                this._listaAutores = nomes;
                this._autoresData  = resp.data; // cache {nome, sexo, raca, nacionalidade}
            }
        } catch (e) { /* silencioso */ }
    },

    preencherDadosAutor: async function (nome, modo) {
        if (!nome || nome.trim().length < 2) return;
        var nomeTrim = nome.trim();
        try {
            var d = null;

            // Tenta cache local primeiro (carregado junto com o datalist no init)
            var low    = nomeTrim.toLowerCase();
            var cached = (this._autoresData || []).find(function (a) {
                return a.nome && a.nome.toLowerCase() === low;
            });
            if (cached && (cached.sexo || cached.raca || cached.nacionalidade)) {
                d = cached;
            } else {
                // Fallback: busca direta na API
                var resp = await fetch(
                    '/php/api/base/menu_lateral/biblioteca/buscar_dados_autor.php?autor=' +
                    encodeURIComponent(nomeTrim)
                );
                var json = await resp.json();
                if (json.status && json.data) d = json.data;
            }

            if (d) {
                if (modo === 'cadastro') {
                    if (d.sexo)          $('#livro_sexo_autor').val(d.sexo);
                    if (d.raca)          $('#livro_raca').val(d.raca);
                    if (d.nacionalidade) $('#livro_nacionalidade').val(d.nacionalidade);
                } else {
                    if (d.sexo)          $('#sexo_autor_atualizar').val(d.sexo);
                    if (d.raca)          $('#raça_atualizar').val(d.raca);
                    if (d.nacionalidade) $('#nacionalidade_atualizar').val(d.nacionalidade);
                    $('#autorAtualizarInfo').remove();
                }
            }

            var local = modo === 'cadastro'
                ? ($('#select_local_cadastro').val() || 'Biblioteca')
                : ($('#local_leitura').val() || 'Biblioteca');
            this._buscarSeries(nomeTrim, local);
        } catch (e) { /* silencioso */ }
    },

    // Preenche imediatamente se o autor estiver no cache; aguarda debounce caso contrário.
    _agendarPreencherAutor: function (nome, modo) {
        var self = this;
        clearTimeout(this._timerPreencherAutor);
        if (!nome || nome.length < 2) return;
        var low    = nome.toLowerCase();
        var cached = (this._autoresData || []).find(function (a) {
            return a.nome && a.nome.toLowerCase() === low;
        });
        if (cached) {
            this.preencherDadosAutor(nome, modo);
            return;
        }
        this._timerPreencherAutor = setTimeout(function () {
            self.preencherDadosAutor(nome, modo);
        }, 350);
    },

    // Chamada quando o local de leitura é selecionado — mostra o formulário adaptado
    onLocalCadastroChange: function () {
        const local = $('#select_local_cadastro').val();

        // Esconde o formulário e todas as seções específicas
        $('#formLivro').hide();
        $('#secao_biblioteca, #secao_ku, #secao_skeelo, #secao_audible, #secao_biblion, #secao_emprestimo')
            .hide();

        if (!local) return;

        // Propaga o valor para o campo hidden dentro do form
        $('#local_cadastro_hidden').val(local);

        // Mostra o formulário e as seções corretas
        $('#formLivro').show();

        const mapa = {
            'Biblioteca':        ['secao_biblioteca'],
            'Kindle_Unlimited':  ['secao_ku',         'secao_emprestimo'],
            'Skeelo':            ['secao_skeelo'],
            'Audible':           ['secao_audible'],
            'Biblion':           ['secao_biblion',    'secao_emprestimo'],
            'MEC_Livros':        ['secao_emprestimo'],
        };

        (mapa[local] || []).forEach(id => $('#' + id).show());

        // codigo e tipo_codigo só são required na Biblioteca
        const req = local === 'Biblioteca';
        $('#livro_codigo').prop('required', req);
        $('#livro_tipo_codigo').prop('required', req);
    },

    select_tipo_edicao: function (lista, selector = '#select_tipo_edicao') {
        let select = $(selector);
        select.empty().append('<option value="">Selecione</option>');

        lista.forEach(item => {
            select.append(`<option value="${item}">${item}</option>`);
        });
    },

    select_natureza: function (lista, selector = '#select_natureza') {
        let select = $(selector);
        select.empty().append('<option value="">Selecione</option>');

        lista.forEach(item => {
            select.append(`<option value="${item}">${item}</option>`);
        });
    },

    _popularDatalist: function (lista, datalistId) {
        var dl = document.getElementById(datalistId);
        if (!dl) return;
        dl.innerHTML = '';
        [...lista].filter(Boolean).sort().forEach(function (item) {
            var opt = document.createElement('option');
            opt.value = item;
            dl.appendChild(opt);
        });
    },

    _buscarSeries: async function (autor, local) {
        if (!autor) { this._popularDatalist([], 'datalist_serie'); return; }
        try {
            var resp = await http.GET(
                '/php/api/base/menu_lateral/biblioteca/listar_series.php?autor=' +
                encodeURIComponent(autor) + '&local=' + encodeURIComponent(local || 'Biblioteca')
            );
            if (resp.status) this._popularDatalist(resp.data, 'datalist_serie');
        } catch (e) { /* silencioso */ }
    },

    select_tema: function (lista, selector = '#select_tema') {
        let select = $(selector);
        select.empty().append('<option value="">Selecione</option>');

        lista.forEach(item => {
            select.append(`<option value="${item}">${item}</option>`);
        });
    },

    mostrarMensagemCadastro: function(type, message) {
        const container = $('#cadastroMensagem');
        if (!container.length) return;

        container.html(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <strong>${type === 'success' ? 'Sucesso!' : 'Ops!'}</strong> ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    },

    limparMensagemCadastro: function() {
        $('#cadastroMensagem').empty();
    },

cadastrarLivro: async function () {
    try {
        const $form = $('#formLivro');

        if ($form.length === 0) {
            console.error('Formulário de cadastro não encontrado.');
            return;
        }

        const body = new FormData($form[0]);
        this.limparMensagemCadastro();

        $.ajax({
            url: '/php/api/base/menu_lateral/biblioteca/create_cadastro.php',
            type: 'POST',
            data: body,
            processData: false,
            contentType: false,
            success: (response) => {
                console.log('Resposta do cadastro:', response);

                // Se a API retornar JSON como string, converter:
                if (typeof response === 'string') {
                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.error('Erro ao converter resposta JSON:', e);
                    }
                }

                // ❌ Se deu erro → mostra alerta Bootstrap
                if (!response.status) {
                    this.mostrarMensagemCadastro('danger', response.error || 'Erro ao cadastrar o livro.');
                    return;
                }

                // ✔️ Se deu certo → mostra SweetAlert bonito
                Swal.fire({
                    title: 'Livro cadastrado!',
                    text: 'O livro foi adicionado à biblioteca com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745'
                });

                // Captura dados do autor antes do reset (para inserção condicional)
                var _nomeAutor = ($('#livro_autor').val() || '').trim();
                var _sexoAutor = $('#livro_sexo_autor').val() || '';
                var _racaAutor = ($('#livro_raca').val() || '').trim();
                var _nacAutor  = ($('#livro_nacionalidade').val() || '').trim();

                // Atualiza tabelas relacionadas
                this._refreshPosSalvamento();

                // Insere autor na tabela Autor se for novo (nunca sobrescreve existente)
                if (_nomeAutor) {
                    var _bodyAutor = new FormData();
                    _bodyAutor.append('nome_autor',    _nomeAutor);
                    _bodyAutor.append('sexo_autor',    _sexoAutor);
                    _bodyAutor.append('raca',          _racaAutor);
                    _bodyAutor.append('nacionalidade', _nacAutor);
                    fetch('/php/api/base/menu_lateral/biblioteca/inserir_autor_se_novo.php', {
                        method: 'POST', body: _bodyAutor
                    }).catch(function () {});
                }

                // Reset do formulário
                $form.trigger('reset');
                $('#select_tipo_edicao').val('');
                $('#select_natureza').val('');
                $('#livro_autor').val(null).trigger('change');
                this._popularDatalist([], 'datalist_serie');
            },
            error: (xhr, status, error) => {
                console.error('Falha ao cadastrar livro:', error);

                // ❌ Erro de requisição → alerta Bootstrap
                this.mostrarMensagemCadastro('danger', 'Falha ao cadastrar livro. Tente novamente.');
            }
        });

    } catch (error) {
        console.error('Erro inesperado:', error);

        // ❌ Erro inesperado → alerta Bootstrap
        this.mostrarMensagemCadastro('danger', 'Erro inesperado. Tente novamente.');
    }
},

    buscarLivro: async function (tipo) {

        const msg = document.getElementById("msgErro");
        if (msg) msg.remove();
        $("#tabelaResultados").remove();

        let body = new FormData();

            if (tipo === "codigo") {
                let codigo = $("#codigo_atualizar").val().trim();

                if (codigo.length < 3) {
                    this.mostrarMensagemErro("#codigo_atualizar", "Digite pelo menos 3 caracteres");
                    return;
                }

                body.append("codigo", codigo);
            }

            if (tipo === "titulo") {
                let titulo = $("#titulo_atualizar").val().trim();

                if (titulo.length < 3) {
                    this.mostrarMensagemErro("#titulo_atualizar", "Digite pelo menos 3 caracteres");
                    return;
                }

                body.append("titulo", titulo);
            }

        try {
            let res = await http.POST('/php/api/base/menu_lateral/biblioteca/buscar_livro.php', body);

            if (!res.status) {
                this.mostrarMensagemErro(
                    tipo === "codigo" ? "#codigo_atualizar" : "#titulo_atualizar",
                    res.error || "Livro não encontrado"
                );
                return;
            }

            // Se for busca por título → lista
            if (tipo === "titulo" && Array.isArray(res.data)) {
                this.montarTabelaResultados(res.data);
                return;
            }

            // Se for código ou ID → único livro
            this.preencherFormulario(res.data);

        } catch (e) {
            console.error("Erro ao buscar livro:", e);
        }
    },

    montarTabelaResultados: function(lista){
        $("#tabelaResultados").remove();

        let tabela = `
            <table id="tabelaResultados" class="table table-sm table-hover mt-1 mb-1">
                <thead style="font-size:0.85rem">
                    <tr>
                        <th style="padding:0.25rem">Local</th>
                        <th style="padding:0.25rem">Título</th>
                        <th style="padding:0.25rem">Autor</th>
                        <th style="padding:0.25rem">Editora</th>
                    </tr>
                </thead>
                <tbody style="font-size:0.85rem">
        `;

        lista.forEach(livro => {
            const local = livro.local_leitura || 'Biblioteca';
            tabela += `
                <tr onclick="biblioteca.selecionarLivro(${livro.id}, '${local}')" style="cursor:pointer">
                    <td style="padding:0.25rem"><span class="badge badge-secondary">${local}</span></td>
                    <td style="padding:0.25rem">${livro.titulo || ''}</td>
                    <td style="padding:0.25rem">${livro.autor  || ''}</td>
                    <td style="padding:0.25rem">${livro.editora || ''}</td>
                </tr>
            `;
        });

        tabela += "</tbody></table>";
        $("#titulo_atualizar").after(tabela);
    },

    selecionarLivro: async function(id, local){
        local = local || 'Biblioteca';
        try {
            const body = new FormData();
            body.append("id",    id);
            body.append("local", local);

            const resp = await http.POST('/php/api/base/menu_lateral/biblioteca/buscar_livro.php', body);

            if (!resp.status) {
                this.mostrarMensagemErro("#titulo_atualizar", resp.error || "Erro ao carregar dados do livro.");
                return;
            }

            this.preencherFormulario(resp.data);
            $("#tabelaResultados").remove();

        } catch (e) {
            console.error("Erro ao selecionar livro:", e);
            this.mostrarMensagemErro("#titulo_atualizar", "Erro ao carregar dados do livro. Tente novamente.");
        }
    },

    mostrarMensagemErro: function(selector, mensagem) {
        const elemento = $(selector);
        const msgDiv = $(`<div id="msgErro" class="alert alert-danger mt-2">${mensagem}</div>`);
        elemento.after(msgDiv);
    },

    preencherFormulario: async function(livro){

        $("#id_livro").val(livro.id);
        $("#local_leitura").val(livro.local_leitura || 'Biblioteca');
        $("#codigo_atualizar").val(livro.codigo);
        $("#tipo_codigo_atualizar").val(livro.tipo_codigo);
        $("#titulo_atualizar").val(livro.titulo);

        $('#autor_atualizar').val(livro.autor || '');
        this._buscarSeries(livro.autor, livro.local_leitura || 'Biblioteca');
        $("#sexo_autor_atualizar").val(livro.sexo_autor  || '');
        $("#nacionalidade_atualizar").val(livro.nacionalidade || '');
        $("#raça_atualizar").val(livro.raça || '');
        $("#volume_atualizar").val(livro.volume);
        $("#serie_atualizar").val(livro.serie || '');
        $("#genero_atualizar").val(livro.genero || '');
        $("#tema_atualizar").val(livro.tema || '');
        $("#editora_atualizar").val(livro.editora);
        $("#select_tipo_edicao_atualizar").val(livro.tipo_edicao);
        $("#paginas_atualizar").val(livro.paginas);
        $("#select_natureza_atualizar").val(livro.natureza);
        $("#status_atualizar").val(livro.status);
        var mesAt = livro.mes_leitura || '';
        $("#mes_leitura_atualizar").val(mesAt);
        $("#grupo_mes_atualizar").css('display', livro.status === 'Lido' ? '' : 'none');
        $("#emprestimo_atualizar").val(livro.emprestimo);
        $("#data_compra_atualizar").val(livro.data_compra ? String(livro.data_compra).slice(0, 10) : '');
        $("#valor_compra_atualizar").val(livro.valor_compra);
        $("#local_compra_atualizar").val(livro.local_compra);
        $("#observacoes_atualizar").val(livro.observacoes);

        // Se os dados do autor estiverem vazios, busca na tabela Autores
        const semDadosAutor = !livro.sexo_autor && !livro.raça && !livro.nacionalidade;
        const nomeAutor     = (livro.autor || '').trim();

        $('#autorAtualizarInfo').remove();
        if (semDadosAutor && nomeAutor.length >= 2) {
            this.preencherDadosAutor(nomeAutor, 'atualizar');
        }
    },
    limparFormCadastro: function() {
        const form = document.getElementById('formLivro');
        if (form) form.reset();

        $('#select_local_cadastro').val('');
        $('#formLivro').hide();
        $('#secao_biblioteca, #secao_ku, #secao_skeelo, #secao_audible, #secao_biblion, #secao_emprestimo').hide();
        $('#msgErro').remove();
        $('#tabelaResultados').remove();
        $('#select_tipo_edicao').val('');
        $('#select_natureza').val('');
        this._popularDatalist([], 'datalist_serie');
    },

    limparFormAtualizacao: function() {
        const form = document.getElementById('formLivroAtualizar');
        if (form) {
            form.reset();
        }
        $('#msgErro').remove();
        $('#tabelaResultados').remove();
        $('#select_tipo_edicao_atualizar').val('');
        $('#select_natureza_atualizar').val('');
        this._popularDatalist([], 'datalist_serie');
    },

    _mostrarMensagemAtualizacao: function (tipo, texto) {
        const footer = document.querySelector('#modalAtualizarLivro .modal-footer');
        if (!footer) return;
        const existing = document.getElementById('atualizacaoMensagem');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.id = 'atualizacaoMensagem';
        div.className = 'alert alert-' + tipo + ' w-100 mb-0 mt-0';
        div.style.fontSize = '0.88rem';
        div.textContent = texto;
        footer.insertBefore(div, footer.firstChild);
    },

    _refreshPosSalvamento: function () {
        // Atualiza datalist de autores
        this.carregarAutores();
        // Atualiza tabela Escritores se estiver visível
        if (document.getElementById('tabelaEscritoresContainer')) {
            this.listarEscritores();
        }
        // Atualiza blocos do main se estiverem carregados
        if (window.dashboard && document.getElementById('bloco-adquiridos')) {
            dashboard.carregarAdquiridos();
            dashboard.carregarNaoLidosAntigos();
            dashboard.carregarFavoritos2025();
            dashboard.carregarTbrEmBreve();
            dashboard.carregarQueroLerLogo();
            dashboard.carregarGraficoTag();
        }
    },

    // ── Gestão de Autores ────────────────────────────────────────────────

    _escritores: [],
    _escritoresOrdem: { col: 'nome_autor', dir: 'asc' },
    _autorAtual: null,
    _listaAutores: [],
    _autoresData: [],
    _timerPreencherAutor: null,

    cadastrarAutor: async function () {
        const form = document.getElementById('formCadastroAutor');
        const msg  = document.getElementById('autorMensagem');
        if (!form) return;
        const body = new FormData(form);
        msg.innerHTML = '';
        try {
            const resp = await http.POST('/php/api/base/menu_lateral/biblioteca/create_autor.php', body);
            if (!resp.status) {
                msg.innerHTML = `<div class="alert alert-danger py-1">${resp.error || 'Erro ao salvar autor.'}</div>`;
                return;
            }
            msg.innerHTML = '<div class="alert alert-success py-1">Autor salvo com sucesso!</div>';
            form.reset();
            setTimeout(() => { msg.innerHTML = ''; }, 2500);
            this.carregarAutores();
            this.listarEscritores();
        } catch (e) {
            msg.innerHTML = '<div class="alert alert-danger py-1">Falha ao salvar. Tente novamente.</div>';
        }
    },

    listarEscritores: async function () {
        const container = document.getElementById('tabelaEscritoresContainer');
        if (!container) return;
        container.innerHTML = '<p class="text-muted text-center mt-3">Carregando...</p>';
        try {
            const resp = await http.GET('/php/api/base/menu_lateral/biblioteca/listar_escritores.php');
            if (!resp.status) {
                container.innerHTML = '<div class="alert alert-danger">Erro ao carregar escritores.</div>';
                return;
            }
            this._escritores = resp.data;
            this._escritoresOrdem = { col: 'nome_autor', dir: 'asc' };
            this._renderEscritores();
        } catch (e) {
            container.innerHTML = '<div class="alert alert-danger">Erro ao carregar escritores.</div>';
        }
    },

    _renderEscritores: function () {
        const container = document.getElementById('tabelaEscritoresContainer');
        if (!container) return;
        if (!this._escritores.length) {
            container.innerHTML = '<p class="text-muted text-center mt-3">Nenhum escritor cadastrado.</p>';
            return;
        }
        const { col, dir } = this._escritoresOrdem;
        const dados = [...this._escritores].sort((a, b) => {
            const va = (a[col] || '').toLowerCase();
            const vb = (b[col] || '').toLowerCase();
            return dir === 'asc' ? va.localeCompare(vb, 'pt') : vb.localeCompare(va, 'pt');
        });
        const seta = (c) => c === col ? (dir === 'asc' ? ' ▲' : ' ▼') : '';
        const th = (c, label) =>
            `<th style="cursor:pointer;white-space:nowrap;user-select:none;border-bottom:2px solid #6a2bbf;color:#6a2bbf"
                 onclick="biblioteca._sortEscritores('${c}')">${label}${seta(c)}</th>`;
        let html = `
            <div style="overflow-x:auto">
            <table class="table table-sm table-hover table-bordered mb-1" style="font-size:0.87rem">
                <thead style="background:rgba(106,43,191,0.07)">
                    <tr>
                        ${th('nome_autor','Nome')}
                        ${th('sexo_autor','Sexo')}
                        ${th('raca','Raça')}
                        ${th('nacionalidade','Nacionalidade')}
                        ${th('origem','Origem')}
                    </tr>
                </thead>
                <tbody>`;
        dados.forEach(a => {
            const sexo = a.sexo_autor === 'F' ? 'Feminino' : a.sexo_autor === 'M' ? 'Masculino' : '';
            html += `<tr id="autor-row-${a.id_autor}"
                        onclick="biblioteca.verAutor('${a.id_autor}')"
                        style="cursor:pointer">
                <td>${a.nome_autor || ''}</td>
                <td>${sexo}</td>
                <td>${a.raca || ''}</td>
                <td>${a.nacionalidade || ''}</td>
                <td>${a.origem || ''}</td>
            </tr>`;
        });
        html += `</tbody></table></div>
            <small class="text-muted">${dados.length} escritor(es) cadastrado(s) — clique em um nome para ver detalhes</small>
            <div id="detalheAutorPanel" style="display:none"></div>`;
        container.innerHTML = html;
    },

    _sortEscritores: function (col) {
        if (this._escritoresOrdem.col === col) {
            this._escritoresOrdem.dir = this._escritoresOrdem.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this._escritoresOrdem = { col, dir: 'asc' };
        }
        this._renderEscritores();
    },

    verAutor: function (id) {
        const autor = this._escritores.find(function (a) { return a.id_autor == id; });
        if (!autor) return;
        this._autorAtual = autor;
        // Destaca a linha selecionada
        document.querySelectorAll('[id^="autor-row-"]').forEach(function (tr) {
            tr.style.background = '';
        });
        var row = document.getElementById('autor-row-' + id);
        if (row) row.style.background = 'rgba(106,43,191,0.08)';
        this._renderDetalheAutor(autor, false);
        var panel = document.getElementById('detalheAutorPanel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    _renderDetalheAutor: function (autor, editavel) {
        var panel = document.getElementById('detalheAutorPanel');
        if (!panel) return;
        var dis  = editavel ? '' : 'readonly';
        var sexo = autor.sexo_autor || '';
        var opts = [['', 'Selecione'], ['F', 'Feminino'], ['M', 'Masculino']].map(function (o) {
            return '<option value="' + o[0] + '"' + (o[0] === sexo ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('');
        var botoes = editavel
            ? '<button onclick="biblioteca.salvarEdicaoAutor()" class="btn btn-sm btn-success" style="font-size:0.82rem;margin-right:6px">Salvar</button>' +
              '<button onclick="biblioteca.verAutor(\'' + autor.id_autor + '\')" class="btn btn-sm btn-outline-secondary" style="font-size:0.82rem">Cancelar</button>'
            : '<button onclick="biblioteca.habilitarEdicaoAutor()" class="btn btn-sm btn-outline-primary" style="font-size:0.82rem">Editar</button>';
        panel.style.display = 'block';
        panel.innerHTML = '<div style="border:1px solid #c7b8f0;border-left:4px solid #6a2bbf;border-radius:6px;padding:14px;background:#fdfbff;margin-top:14px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
                '<strong style="color:#6a2bbf;font-size:0.95rem">' + (autor.nome_autor || '') + '</strong>' +
                '<div>' + botoes + '</div>' +
            '</div>' +
            '<div id="detalheAutorMsg"></div>' +
            '<div class="linha">' +
                '<div class="grupo"><label style="font-size:0.82rem;color:#666">Sexo</label>' +
                '<select id="det_sexo"' + (editavel ? '' : ' disabled') + ' style="width:100%">' + opts + '</select></div>' +
                '<div class="grupo"><label style="font-size:0.82rem;color:#666">Raça</label>' +
                '<input type="text" id="det_raca" value="' + (autor.raca || '') + '" ' + dis + ' style="width:100%"></div>' +
            '</div>' +
            '<div class="linha">' +
                '<div class="grupo"><label style="font-size:0.82rem;color:#666">Nacionalidade</label>' +
                '<input type="text" id="det_nacionalidade" value="' + (autor.nacionalidade || '') + '" ' + dis + ' style="width:100%"></div>' +
                '<div class="grupo"><label style="font-size:0.82rem;color:#666">Origem</label>' +
                '<input type="text" id="det_origem" value="' + (autor.origem || '') + '" ' + dis + ' style="width:100%"></div>' +
            '</div>' +
            '<input type="hidden" id="det_id_autor" value="' + autor.id_autor + '">' +
        '</div>';
    },

    habilitarEdicaoAutor: function () {
        if (this._autorAtual) {
            this._renderDetalheAutor(this._autorAtual, true);
        }
    },

    salvarEdicaoAutor: async function () {
        var id   = (document.getElementById('det_id_autor')?.value || '');
        var sexo = (document.getElementById('det_sexo')?.value || '');
        var raca = (document.getElementById('det_raca')?.value || '');
        var nac  = (document.getElementById('det_nacionalidade')?.value || '');
        var orig = (document.getElementById('det_origem')?.value || '');
        var msg  = document.getElementById('detalheAutorMsg');
        if (msg) msg.innerHTML = '';
        try {
            var body = new FormData();
            body.append('id_autor', id);
            body.append('sexo_autor', sexo);
            body.append('raca', raca);
            body.append('nacionalidade', nac);
            body.append('origem', orig);
            var resp = await http.POST('/php/api/base/menu_lateral/biblioteca/update_autor.php', body);
            if (!resp.status) {
                if (msg) msg.innerHTML = '<div class="alert alert-danger py-1">' + (resp.error || 'Erro ao salvar.') + '</div>';
                return;
            }
            if (msg) msg.innerHTML = '<div class="alert alert-success py-1">Autor atualizado com sucesso!</div>';
            var idx = this._escritores.findIndex(function (a) { return a.id_autor == id; });
            if (idx >= 0) {
                this._escritores[idx].sexo_autor    = sexo;
                this._escritores[idx].raca          = raca;
                this._escritores[idx].nacionalidade = nac;
                this._escritores[idx].origem        = orig;
                this._autorAtual = this._escritores[idx];
            }
            var self = this;
            setTimeout(function () {
                self._renderEscritores();
                self._renderDetalheAutor(self._autorAtual, false);
                // Reaplica destaque
                var row = document.getElementById('autor-row-' + id);
                if (row) row.style.background = 'rgba(106,43,191,0.08)';
            }, 1200);
        } catch (e) {
            if (msg) msg.innerHTML = '<div class="alert alert-danger py-1">Erro ao salvar. Tente novamente.</div>';
        }
    },

    // ── Atualização de dados ─────────────────────────────────────────────

    atualizar_dados: async function () {
        try {
            const form = document.getElementById('formLivroAtualizar');
            const body = new FormData(form);

            let response = await http.POST('/php/api/base/menu_lateral/biblioteca/update_cadastro.php', body);

            if (!response.status) {
                this._mostrarMensagemAtualizacao('danger', response.error || 'Erro ao atualizar o livro.');
                return;
            }

            this._mostrarMensagemAtualizacao('success', 'Livro atualizado com sucesso!');
            this._refreshPosSalvamento();

            const self = this;
            setTimeout(function () {
                const msg = document.getElementById('atualizacaoMensagem');
                if (msg) msg.remove();
                self.limparFormAtualizacao();
            }, 2000);

        } catch (error) {
            console.error('Falha ao atualizar dados:', error);
            this._mostrarMensagemAtualizacao('danger', 'Falha ao atualizar. Tente novamente.');
        }
    },

    // Vincula auto-preenchimento demográfico a um campo de autor.
    // Usa evento 'input' (dispara imediatamente ao selecionar do datalist)
    // e 'change' como fallback (dispara ao sair do campo).
    _initAutocompleteAutor: function (selector, callback) {
        var self  = this;
        var $el   = $(selector);
        if (!$el.length) return;

        var timer;

        function _buscarEChamar(nome) {
            if (!nome || nome.trim().length < 2) return;
            fetch('/php/api/base/menu_lateral/biblioteca/buscar_dados_autor.php?autor=' +
                  encodeURIComponent(nome.trim()))
                .then(function (r) { return r.json(); })
                .then(function (json) { if (json.status && json.data) callback(json.data); })
                .catch(function () {});
        }

        // Remove handlers anteriores para evitar duplicatas em reaberturas do modal
        $el.off('input.autocAutor change.autocAutor');

        // 'input' dispara imediatamente quando o usuário seleciona uma opção do datalist
        $el.on('input.autocAutor', function () {
            var nome = $(this).val().trim();
            clearTimeout(timer);
            if (!nome) return;
            timer = setTimeout(function () {
                var lista = self._listaAutores || [];
                var low   = nome.toLowerCase();
                if (lista.some(function (n) { return n.toLowerCase() === low; })) {
                    _buscarEChamar(nome);
                }
            }, 200);
        });

        // 'change' dispara ao sair do campo (caso o usuário tenha digitado sem selecionar do datalist)
        $el.on('change.autocAutor', function () {
            clearTimeout(timer);
            var nome = $(this).val().trim();
            if (nome) _buscarEChamar(nome);
        });
    }

};

window.biblioteca = biblioteca;

$(document).ready(function () {
    biblioteca.init();

    // Delegação: funciona mesmo quando o modal é recriado no DOM
    $(document).off('change.bibcad', '#livro_autor')
               .on('change.bibcad', '#livro_autor', function () {
                   var nome = $(this).val().trim();
                   if (nome) biblioteca.preencherDadosAutor(nome, 'cadastro');
               });

    $(document).off('change.bibatualizacao', '#autor_atualizar')
               .on('change.bibatualizacao', '#autor_atualizar', function () {
                   var nome = $(this).val().trim();
                   if (nome) biblioteca.preencherDadosAutor(nome, 'atualizar');
               });

    $('#modalNovoLivro').on('hidden.bs.modal', function () {
        biblioteca.limparFormCadastro();
    });

    $('#modalAtualizarLivro').on('hidden.bs.modal', function () {
        biblioteca.limparFormAtualizacao();
    });

    $('#modalCadastroAutor').on('hidden.bs.modal', function () {
        const form = document.getElementById('formCadastroAutor');
        if (form) form.reset();
        document.getElementById('autorMensagem').innerHTML = '';
    });
});
