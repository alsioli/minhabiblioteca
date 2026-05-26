let leitura_coletiva = {
    cadastrarLC: async function () {
       
        try {

            const $form = $('#formLeituraColetiva');

            if ($form.length === 0) {
                console.error('Formulário de LC não encontrado.');
                return;
            }

            const body = new FormData($form[0]);
            $('#mensagemLC').empty();

            $.ajax({
                url: '/php/api/base/menu_lateral/leiturasColetivas/create_leitura_coletiva.php',
                type: 'POST',
                data: body,
                processData: false,
                contentType: false,
                success: (response) => {
                    console.log('Resposta LC:', response);

                    if (typeof response === 'string') {
                        try { response = JSON.parse(response); } catch (e) {}
                    }

                    if (!response.status) {
                        $('#mensagemLC').html(`
                            <div class="alert alert-danger">${response.error}</div>
                        `);
                        return;
                    }

                    Swal.fire({
                        title: 'Leitura Coletiva Cadastrada!',
                        text: 'A nova LC foi adicionada com sucesso.',
                        icon: 'success',
                        confirmButtonColor: '#28a745'
                    });

                    $form.trigger('reset');
                    $('#modalNovaLC').modal('hide');
                },
                error: () => {
                    $('#mensagemLC').html(`
                        <div class="alert alert-danger">Erro ao cadastrar LC. Tente novamente.</div>
                    `);
                }
            });

        } catch (error) {
            console.error('Erro inesperado:', error);
            $('#mensagemLC').html(`
                <div class="alert alert-danger">Erro inesperado. Tente novamente.</div>
            `);
        }
    },

    carregarCronogramaLC: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_cronograma_lc.php');

            const text = await resp.text();

            let response;
            try {
                response = text ? JSON.parse(text) : null;
            } catch (e) {
                // Tenta recuperar JSON mesmo que haja mensagens antes/ depois
                try {
                    const start = text.indexOf('{');
                    const end = text.lastIndexOf('}');
                    if (start !== -1 && end !== -1 && end > start) {
                        const sub = text.substring(start, end + 1);
                        response = JSON.parse(sub);
                        console.warn('Resposta limpada de ruído antes do JSON.');
                    } else {
                        throw e;
                    }
                } catch (e2) {
                    console.error('Resposta inválida JSON ao carregar cronograma:', e, text);
                    $('#tabelaCronogramaLC').html(`
                        <div class="alert alert-danger">Erro ao carregar dados (resposta inválida).</div>
                    `);
                    return;
                }
            }

            if (!resp.ok) {
                console.error('Erro HTTP ao carregar cronograma:', resp.status, text);
                $('#tabelaCronogramaLC').html(`
                    <div class="alert alert-danger">Erro ao carregar dados (código ${resp.status}).</div>
                `);
                return;
            }

            if (!response || !response.status) {
                const errMsg = response && response.error ? response.error : 'Resposta vazia do servidor.';
                $('#tabelaCronogramaLC').html(`
                    <div class="alert alert-danger">${errMsg}</div>
                `);
                return;
            }

            this.montarTabelaCronograma(response.data || []);

        } catch (error) {
            console.error("Erro ao carregar cronograma:", error);
            $('#tabelaCronogramaLC').html(`
                <div class="alert alert-danger">Erro ao carregar dados.</div>
            `);
        }
    },

    montarTabelaCronograma: function (lista) {

        let html = `
            <table class="table table-striped table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>Título</th>
                        <th>LC</th>
                        <th>Data Cadastro</th>
                        <th>Data Final</th>
                        <th>Páginas</th>
                        <th>Mês</th>
                        <th>Situação</th>
                        <th>Dias p/ Prazo</th>
                        <th>Média Páginas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        lista.forEach(item => {

            // Cálculo dos dias para o prazo
            let hoje = new Date();
            let dataFinal = new Date(item.data_final);
            let diff = Math.ceil((dataFinal - hoje) / (1000 * 60 * 60 * 24));

            // Cálculo da média de páginas
            let media = 0;
            if (item.paginas && item.dias_para_prazo > 0) {
                media = Math.ceil(item.paginas / item.dias_para_prazo);
            }

            html += `
                <tr>
                    <td style="white-space: nowrap;">${item.titulo}</td>
                    <td>${item.lc}</td>
                    <td>${this.formatarDataBR(item.data_cadastro)}</td>
                    <td>${this.formatarDataBR(item.data_final)}</td>
                    <td>${item.paginas}</td>
                    <td>${item.mes}</td>
                    <td>${item.situacao}</td>
                    <td>${diff} dias</td>
                    <td>${media} pág/dia</td>
                    <td>
                        <button class="btn btn-sm btn-warning text-dark fw-bold" 
                                style="background-color:#ff9800; border-color:#e68900;"
                                onclick="biblioteca.abrirModalEditarLC(${item.id})">
                            ✏️ Editar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += "</tbody></table>";

        $('#tabelaCronogramaLC').html(html);
    },

    formatarDataBR: function (dataISO) {
        const d = new Date(dataISO);
        if (isNaN(d)) return dataISO;
        return d.toLocaleDateString('pt-BR');
    },    
};

if (typeof window !== 'undefined') {
    window.leitura_coletiva = leitura_coletiva;
}
