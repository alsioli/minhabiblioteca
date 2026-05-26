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

    init: function () {
        this.carregarSelects();
    },    


    carregarSelects: async function () {
        try {
            let response = await http.GET('/php/api/base/menu_lateral/biblioteca/selects_cadastro.php');
            console.log('Resposta da API:', response);

            if (!response.status) {
                console.error('Erro ao carregar selects:', response.error);
                return;
            }

            console.log('Dados recebidos:', response.data);

            this.tema = response.data?.tema || [];
            this.tipo_edicao = response.data?.tipo_edicao || [];
            this.natureza = response.data?.natureza || [];

            this.select_tema(this.tema, '#select_tema');
            this.select_tipo_edicao(this.tipo_edicao, '#select_tipo_edicao');
            this.select_natureza(this.natureza, '#select_natureza');
            this.select_tema(this.tema, '#select_tema_atualizar');
            this.select_tipo_edicao(this.tipo_edicao, '#select_tipo_edicao_atualizar');
            this.select_natureza(this.natureza, '#select_natureza_atualizar');
        } catch (error) {
            console.error('Falha ao carregar selects:', error);
        }
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

                // Reset do formulário
                $form.trigger('reset');
                $('#select_tema').val('');
                $('#select_tipo_edicao').val('');
                $('#select_natureza').val('');
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
            <thead style="font-size: 0.85rem">
                <tr>
                    <th style="padding: 0.25rem">Título</th>
                    <th style="padding: 0.25rem">Autor</th>
                    <th style="padding: 0.25rem">Editora</th>
                    <th style="padding: 0.25rem">Tipo Edição</th>
                </tr>
            </thead>
            <tbody style="font-size: 0.85rem">
    `;

    lista.forEach(livro => {
        tabela += `
            <tr onclick="biblioteca.selecionarLivro(${livro.id})" style="cursor:pointer">
                <td style="padding: 0.25rem">${livro.titulo}</td>
                <td style="padding: 0.25rem">${livro.autor}</td>
                <td style="padding: 0.25rem">${livro.editora}</td>
                <td style="padding: 0.25rem">${livro.tipo_edicao}</td>
            </tr>
        `;
    });

        tabela += "</tbody></table>";

        $("#titulo_atualizar").after(tabela);

    },

    selecionarLivro: async function(id){

        try {
            const body = new FormData();
            body.append("id", id);

            const livro = await http.POST('/php/api/base/menu_lateral/biblioteca/buscar_livro.php', body);

            this.preencherFormulario(livro.data || livro);
            $("#tabelaResultados").remove();

        } catch (e) {
            console.error("Erro ao selecionar livro:", e);
        }
    },

    mostrarMensagemErro: function(selector, mensagem) {
        const elemento = $(selector);
        const msgDiv = $(`<div id="msgErro" class="alert alert-danger mt-2">${mensagem}</div>`);
        elemento.after(msgDiv);
    },

    preencherFormulario: function(livro){
        
        $("#id_livro").val(livro.id);
        $("#codigo_atualizar").val(livro.codigo);
        $("#tipo_codigo_atualizar").val(livro.tipo_codigo);
        $("#titulo_atualizar").val(livro.titulo);
        $("#autor_atualizar").val(livro.autor);
        $("#sexo_autor_atualizar").val(livro.sexo_autor);
        $("#nacionalidade_atualizar").val(livro.nacionalidade);
        $("#raça_atualizar").val(livro.raça);
        $("#volume_atualizar").val(livro.volume);
        $("#serie_atualizar").val(livro.serie);
        $("#genero_atualizar").val(livro.genero);
        $("#select_tema_atualizar").val(livro.tema);
        $("#editora_atualizar").val(livro.editora);
        $("#select_tipo_edicao_atualizar").val(livro.tipo_edicao);
        $("#paginas_atualizar").val(livro.paginas);
        $("#select_natureza_atualizar").val(livro.natureza);
        $("#status_atualizar").val(livro.status);
        $("#emprestimo_atualizar").val(livro.emprestimo);
        $("#data_compra_atualizar").val(livro.data_compra);
        $("#valor_compra_atualizar").val(livro.valor_compra);
        $("#local_compra_atualizar").val(livro.local_compra);
        $("#observacoes_atualizar").val(livro.observacoes);
    },
    limparFormCadastro: function() {
        const form = document.getElementById('formLivro');
        if (form) {
            form.reset();
        }
        $('#msgErro').remove();
        $('#tabelaResultados').remove();
        $('#select_tema').val('');
        $('#select_tipo_edicao').val('');
        $('#select_natureza').val('');
    },

    limparFormAtualizacao: function() {
        const form = document.getElementById('formLivroAtualizar');
        if (form) {
            form.reset();
        }
        $('#msgErro').remove();
        $('#tabelaResultados').remove();
        $('#select_tema_atualizar').val('');
        $('#select_tipo_edicao_atualizar').val('');
        $('#select_natureza_atualizar').val('');
    },

    atualizar_dados: async function () {
        try {
            const form = document.getElementById('formLivroAtualizar');
            const body = new FormData(form);

            let response = await http.POST('/php/api/base/menu_lateral/biblioteca/update_cadastro.php', body);
            console.log('Resposta da atualização:', response);

            if (!response.status) {
                console.error('Erro ao atualizar dados:', response.error);
                return;
            }

            $('#modalAtualizarLivro').modal('hide');
            
            Swal.fire({
                title: 'Atualizado!',
                text: 'Os dados do livro foram atualizados com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (error) {
            console.error('Falha ao atualizar dados:', error);
        }
    }

};

$(document).ready(function () {
    biblioteca.init();

    $('#modalNovoLivro').on('hidden.bs.modal', function () {
        biblioteca.limparFormCadastro();
    });

    $('#modalAtualizarLivro').on('hidden.bs.modal', function () {
        biblioteca.limparFormAtualizacao();
    });
});
