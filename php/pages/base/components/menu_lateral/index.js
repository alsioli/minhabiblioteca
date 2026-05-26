let menuLateral = {

    init: function () {
    },  

    abrirModalNovoLivro: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html); // injeta o modal no DOM
                $('#modalNovoLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal Biblioteca - Novo.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal.');
            }
        });
    
    },

    abrirModalAtualizarLivro: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html); // injeta o modal no DOM
                $('#modalAtualizarLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal Biblioteca - Alterar.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal.');
            }
        });
    },

    abrirModalNovaLC: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/leituras_coletivas/index.php',
            method: 'GET',
            success: function (html) {

                // Remove modal anterior se já existir (evita duplicação)
                $('#modalNovaLC').remove();

                // Injeta o modal no DOM
                $('body').append(html);

                // Abre o modal
                $('#modalNovaLC').modal('show');

                // Carrega o JS do módulo (caso ainda não esteja carregado)
                $.getScript('/php/pages/base/components/menu_lateral/leituras_coletivas/index.js')
                    .done(function () {
                        console.log('Script LC carregado com sucesso.');

                        // Se quiser carregar selects ou algo específico:
                        if (window.biblioteca && typeof biblioteca.initLC === 'function') {
                            biblioteca.initLC();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal LC.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal de Leitura Coletiva.');
            }
        });
    },
    
   abrirCronogramaLC: function () {

        // Garante que o CSS do cronograma está carregado (evita múltiplos includes)
        if ($('link[data-href="/public/assets/css/cronograma.css"]').length === 0 && $('link[href="/public/assets/css/cronograma.css"]').length === 0) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/public/assets/css/cronograma.css';
            link.setAttribute('data-href', '/public/assets/css/cronograma.css');
            document.head.appendChild(link);
        }

        // Limpa o conteúdo atual do main e injeta container do cronograma
        $('#menu_lateral').css('width', '250px');
        $('#mainConteudo').html(`
            <div id="cronogramaLCContainer" class="container mt-4">
                <h3 class="mb-3">Cronograma das Leituras Coletivas</h3>
                <div id="tabelaCronogramaLC"></div>
            </div>
        `);

        // Carrega o script antes de chamar a função
        $.getScript('/php/pages/base/components/menu_lateral/leituras_coletivas/index.js')
            .done(function () {
                if (window.leitura_coletiva && typeof leitura_coletiva.carregarCronogramaLC === 'function') {
                    leitura_coletiva.carregarCronogramaLC();
                }
            })
            .fail(function () {
                console.error('Erro ao carregar o script de Leitura Coletiva.');
                $('#tabelaCronogramaLC').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
            });
    }

};

// Expor para escopo global
window.menuLateral = menuLateral;
