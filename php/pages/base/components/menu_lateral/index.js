let menuLateral = {

    init: function () {
    },  

    abrirModalNovoLivro: async function () {
        $('#modalNovoLivro').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalNovoLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                        // Autocomplete no campo Autor do novo livro
                        if (window.biblioteca && typeof biblioteca._initAutocompleteAutor === 'function') {
                            biblioteca._initAutocompleteAutor('#livro_autor', function (autor) {
                                if (autor.sexo)          $('#livro_sexo_autor').val(autor.sexo);
                                if (autor.raca)          $('#livro_raca').val(autor.raca);
                                if (autor.nacionalidade) $('#livro_nacionalidade').val(autor.nacionalidade);
                            });
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
        $('#modalAtualizarLivro').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalAtualizarLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                        // Autocomplete no campo Autor do modal de atualização
                        if (window.biblioteca && typeof biblioteca._initAutocompleteAutor === 'function') {
                            biblioteca._initAutocompleteAutor('#autor_atualizar', function (autor) {
                                if (autor.sexo)          $('#sexo_autor_atualizar').val(autor.sexo);
                                if (autor.raca)          $('#raça_atualizar').val(autor.raca);
                                if (autor.nacionalidade) $('#nacionalidade_atualizar').val(autor.nacionalidade);
                                $('#autorAtualizarInfo').remove();
                            });
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

    abrirModalConsultarLivro: async function () {
        $('#modalConsultarLivro').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalConsultarLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                        // Autocomplete no campo Autor do modal de consulta
                        if (window.biblioteca && typeof biblioteca._initAutocompleteAutor === 'function') {
                            biblioteca._initAutocompleteAutor('#autor_atualizar', function (autor) {
                                if (autor.sexo)          $('#sexo_autor_atualizar').val(autor.sexo);
                                if (autor.raca)          $('#raça_atualizar').val(autor.raca);
                                if (autor.nacionalidade) $('#nacionalidade_atualizar').val(autor.nacionalidade);
                                $('#autorAtualizarInfo').remove();
                            });
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal Biblioteca - Consulta.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal de consulta.');
            }
        });
    },

    abrirModalCadastroAutor: function () {
        $('#modalCadastroAutor, #modalListaEscritores').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalCadastroAutor').modal('show');
                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .fail(function () {
                        console.error('Erro ao carregar script Biblioteca - Cadastro Autor.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Cadastro de Autor.');
            }
        });
    },

    abrirModalListaEscritores: function () {
        $('#modalCadastroAutor, #modalListaEscritores').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalListaEscritores').modal('show');
                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.listarEscritores === 'function') {
                            biblioteca.listarEscritores();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script Biblioteca - Lista Escritores.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Lista de Escritores.');
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
    
    abrirModalNovaCronogramaLC: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/leituras_coletivas/index.php',
            method: 'GET',
            success: function (html) {
                $('#modalNovaCronogramaLC').remove();
                $('body').append(html);
                $('#modalNovaCronogramaLC').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/leituras_coletivas/index.js')
                    .done(function () {
                        if (window.leitura_coletiva && typeof leitura_coletiva.iniciarModalNovaCronogramaLC === 'function') {
                            leitura_coletiva.iniciarModalNovaCronogramaLC();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script Nova LC Cronograma.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Nova LC Cronograma.');
            }
        });
    },

    _carregarMinhasLeituras: function (modalId, initFn) {
        $('#modalComecarLivro, #modalAtualizandoLeitura, #modalMinhasImpressoes, #modalFraseFavorita, #modalAtualizarLeituras').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/minhas_leituras/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                const modalEl = document.getElementById(modalId);
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
                $.getScript('/php/pages/base/components/menu_lateral/minhas_leituras/index.js')
                    .done(function () {
                        if (window.minhas_leituras && typeof minhas_leituras[initFn] === 'function') {
                            minhas_leituras[initFn]();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script Minhas Leituras.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Minhas Leituras.');
            }
        });
    },

    abrirModalComecarLivro: function () {
        this._carregarMinhasLeituras('modalComecarLivro', 'iniciar');
    },

    abrirModalAtualizandoLeitura: function () {
        this._carregarMinhasLeituras('modalAtualizandoLeitura', 'iniciarAtualizacao');
    },

    abrirModalMinhasImpressoes: function () {
        this._carregarMinhasLeituras('modalMinhasImpressoes', 'iniciarImpressoes');
    },

    abrirModalFraseFavorita: function () {
        this._carregarMinhasLeituras('modalFraseFavorita', 'iniciarFraseFavorita');
    },

    abrirModalAtualizarLeituras: function () {
        this._carregarMinhasLeituras('modalAtualizarLeituras', 'iniciarAtualizarLeituras');
    },

    abrirModalResenha: function (mesFiltro) {
        $('#modalMinhasResenhas').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/minhas_resenhas/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalMinhasResenhas').modal('show');
                $.getScript('/php/pages/base/components/menu_lateral/minhas_resenhas/index.js')
                    .done(function () {
                        if (window.minhas_resenhas) {
                            minhas_resenhas.iniciar(mesFiltro || null);
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script Minhas Resenhas.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Minhas Resenhas.');
            }
        });
    },

    abrirModalTBRMensal: function () {
        $('#modalTBRMensal').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/tbr_mensal/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalTBRMensal').modal('show');
                $.getScript('/php/pages/base/components/menu_lateral/tbr_mensal/index.js')
                    .done(function () {
                        if (window.tbr_mensal) tbr_mensal.iniciar();
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script TBR Mensal.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal TBR Mensal.');
            }
        });
    },

    abrirModalQueroLerLogo: function () {
        $('#modalQueroLerLogo').remove();
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/quero_ler/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html);
                $('#modalQueroLerLogo').modal('show');
                $.getScript('/php/pages/base/components/menu_lateral/quero_ler/index.js')
                    .done(function () {
                        if (window.quero_ler) quero_ler.iniciar();
                    })
                    .fail(function () {
                        console.error('Erro ao carregar script Quero Ler Logo.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar modal Quero Ler Logo.');
            }
        });
    },

    _carregarCSSCronograma: function () {
        if ($('link[href="/public/assets/css/cronograma.css"]').length === 0) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/public/assets/css/cronograma.css';
            document.head.appendChild(link);
        }
    },

    abrirLeiturasAndamento: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="leiturasAndamentoContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Leituras em Andamento</h3>
                <div id="leiturasAndamentoTabela"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Leituras/index.js')
            .done(function () {
                if (window.leituras_view) leituras_view.carregarAndamento();
            })
            .fail(function () {
                console.error('Erro ao carregar script Leituras.');
            });
    },

    abrirLeiturasAno: function () {
        this._carregarCSSCronograma();
        const anoAtual = new Date().getFullYear();
        $('#mainConteudo').html(`
            <div id="leiturasAnoContainer" class="container-fluid mt-4">
                <h3 class="mb-3 d-flex justify-content-between align-items-center flex-wrap" style="gap:8px">
                    Leituras do Ano
                    <div class="d-flex flex-wrap" style="gap:6px">
                        <span id="leiturasAnoTotal"
                              style="background:#343a40;color:#fff;font-size:0.82rem;padding:3px 12px;border-radius:6px;font-weight:normal">
                            —
                        </span>
                        <span id="leiturasAnoEbook"
                              style="background:#17a2b8;color:#fff;font-size:0.82rem;padding:3px 12px;border-radius:6px;font-weight:normal">
                            —
                        </span>
                        <span id="leiturasAnoTag"
                              style="background:#6f42c1;color:#fff;font-size:0.82rem;padding:3px 12px;border-radius:6px;font-weight:normal">
                            —
                        </span>
                        <span id="leiturasAnoFisico"
                              style="background:#28a745;color:#fff;font-size:0.82rem;padding:3px 12px;border-radius:6px;font-weight:normal">
                            —
                        </span>
                    </div>
                </h3>
                <div class="mb-3 d-flex align-items-center flex-wrap" style="gap:10px">
                    <label class="mb-0 font-weight-bold">Ano:</label>
                    <input type="number" id="leiturasAnoFiltro" class="form-control"
                           style="width:110px" value="${anoAtual}" min="2015" max="${anoAtual + 1}"
                           onchange="leituras_view.carregarAno(this.value)">
                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="menuLateral.sincronizarLeituras()"
                            id="btnSincronizar"
                            title="Atualiza Leituras com livros concluídos e marca Livros como Lido">
                        🔄 Sincronizar Leituras
                    </button>
                    <span id="sincronizarMsg" style="font-size:0.85rem"></span>
                </div>
                <div id="leiturasAnoTabela"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Leituras/index.js')
            .done(function () {
                if (window.leituras_view) leituras_view.carregarAno(anoAtual);
            })
            .fail(function () {
                console.error('Erro ao carregar script Leituras.');
            });
    },

    abrirLeiturasMes: function () {
        this._carregarCSSCronograma();
        const hoje    = new Date();
        const mesISO  = hoje.toISOString().slice(0, 7); // "YYYY-MM"
        $('#mainConteudo').html(`
            <div id="leiturasMesContainer" class="container-fluid mt-4">
                <h3 class="mb-3 d-flex justify-content-between align-items-center">
                    Leituras do Mês
                    <span id="leiturasMesBadge"
                          style="background:#28a745;color:#fff;font-size:0.85rem;padding:4px 14px;border-radius:6px;font-weight:normal;">
                        0 livros
                    </span>
                </h3>
                <div class="mb-3 d-flex align-items-center flex-wrap" style="gap:10px">
                    <label class="mb-0 font-weight-bold">Mês:</label>
                    <input type="month" id="leiturasMesFiltro" class="form-control"
                           style="width:190px" value="${mesISO}" min="2020-01"
                           onchange="leituras_view.carregarMes(this.value)">
                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="menuLateral.sincronizarLeituras()"
                            id="btnSincronizar"
                            title="Atualiza Leituras com livros concluídos e marca Livros como Lido">
                        🔄 Sincronizar Leituras
                    </button>
                    <span id="sincronizarMsg" style="font-size:0.85rem"></span>
                </div>
                <div id="leiturasMesTabela"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Leituras/index.js')
            .done(function () {
                if (window.leituras_view) leituras_view.carregarMes(mesISO);
            })
            .fail(function () {
                console.error('Erro ao carregar script Leituras.');
            });
    },

    // ─── Livros por Nacionalidade ────────────────────────────────
    abrirNacionalidade: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="livrosAgrupContainer" class="container-fluid mt-4">
                <h3 class="mb-4">Livros por Nacionalidade</h3>
                <div id="livrosAgrupTabela"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Leituras/index.js')
            .done(function () {
                if (window.leituras_view) leituras_view.carregarNacionalidade();
            })
            .fail(function () { console.error('Erro ao carregar script.'); });
    },

    // ─── Livros por Raça ─────────────────────────────────────────
    abrirRaca: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="livrosAgrupContainer" class="container-fluid mt-4">
                <h3 class="mb-4">Livros por Raça</h3>
                <div id="livrosAgrupTabela"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Leituras/index.js')
            .done(function () {
                if (window.leituras_view) leituras_view.carregarRaca();
            })
            .fail(function () { console.error('Erro ao carregar script.'); });
    },

    // ─── Minhas Impressões (Consulta) ────────────────────────────
    abrirConsultaImpressoes: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="impressoesContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Minhas Impressões</h3>
                <div class="mb-3 d-flex flex-wrap align-items-end" style="gap:8px">
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Título / Autor</label>
                        <input type="text" id="impBuscaTitulo" class="form-control form-control-sm"
                               style="width:240px" placeholder="Título ou autor..."
                               onkeydown="if(event.key==='Enter') impressoes_view.buscar()">
                    </div>
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Impressão</label>
                        <input type="text" id="impBuscaTexto" class="form-control form-control-sm"
                               style="width:240px" placeholder="Texto da impressão..."
                               onkeydown="if(event.key==='Enter') impressoes_view.buscar()">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="impressoes_view.buscar()">
                        Buscar
                    </button>
                </div>
                <div id="impressoesTabela">
                    <p class="text-muted small">Use os filtros acima para pesquisar impressões, ou clique em Buscar para ver todas.</p>
                </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Impressoes/index.js')
            .done(function () {
                if (window.impressoes_view) impressoes_view.buscar();
            })
            .fail(function () {
                console.error('Erro ao carregar script Impressões.');
            });
    },

    // ─── Minhas Citações Favoritas (Consulta) ────────────────────
    abrirConsultaCitacoes: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="citacoesContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Minhas Citações Favoritas</h3>
                <div class="mb-3 d-flex flex-wrap align-items-end" style="gap:8px">
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Título / Autor</label>
                        <input type="text" id="citBuscaTitulo" class="form-control form-control-sm"
                               style="width:240px" placeholder="Título ou autor..."
                               onkeydown="if(event.key==='Enter') citacoes_view.buscar()">
                    </div>
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Citação</label>
                        <input type="text" id="citBuscaTexto" class="form-control form-control-sm"
                               style="width:240px" placeholder="Texto da citação..."
                               onkeydown="if(event.key==='Enter') citacoes_view.buscar()">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="citacoes_view.buscar()">
                        Buscar
                    </button>
                </div>
                <div id="citacoesTabela">
                    <p class="text-muted small">Use os filtros acima para pesquisar citações, ou clique em Buscar para ver todas.</p>
                </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Citacoes/index.js')
            .done(function () {
                if (window.citacoes_view) citacoes_view.buscar();
            })
            .fail(function () {
                console.error('Erro ao carregar script Citações.');
            });
    },

    // ─── Minhas Resenhas (Consulta) ──────────────────────────────
    abrirConsultaResenhas: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="resenhasContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Minhas Resenhas</h3>
                <div class="mb-3 d-flex flex-wrap align-items-end" style="gap:8px">
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Mês de leitura</label>
                        <select id="resenhasMesFiltro" class="form-control form-control-sm" style="width:180px"
                                onchange="resenhas_view.buscar()">
                            <option value="">Carregando...</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Título / Autor</label>
                        <input type="text" id="resenhasBuscaTitulo" class="form-control form-control-sm"
                               style="width:240px" placeholder="Título ou autor..."
                               onkeydown="if(event.key==='Enter') resenhas_view.buscar()">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="resenhas_view.buscar()">
                        Buscar
                    </button>
                </div>
                <div id="resenhasTabela">
                    <p class="text-muted small">Carregando...</p>
                </div>
            </div>

            <!-- Modal: Ver Resenha Completa -->
            <div class="modal fade" id="modalVerResenha" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                  <div class="modal-header" style="background:#343a40;color:#fff;padding:12px 16px">
                    <h5 class="modal-title" id="modalResenhaLivro" style="font-size:1rem;font-weight:700"></h5>
                    <button type="button" class="close" style="color:#fff;opacity:1" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3" style="font-size:0.88rem;color:#555;display:flex;gap:20px;flex-wrap:wrap">
                        <span><strong>Autor:</strong> <span id="modalResenhaAutor"></span></span>
                        <span><strong>Mês:</strong> <span id="modalResenhaMes"></span></span>
                        <span><strong>Avaliação:</strong> <span id="modalResenhaAvaliacao"></span></span>
                    </div>
                    <hr style="margin:12px 0">
                    <p id="modalResenhaTexto" style="font-size:0.88rem;line-height:1.8;white-space:pre-wrap;word-break:break-word"></p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-outline-dark btn-sm" onclick="resenhas_view.gerarPDF()">
                        📄 Gerar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/Resenhas/index.js')
            .done(function () {
                if (window.resenhas_view) {
                    resenhas_view.init().then(function () {
                        resenhas_view.buscar();
                    });
                }
            })
            .fail(function () {
                console.error('Erro ao carregar script Resenhas.');
            });
    },

    // ─── Minha TBR (Consulta) ────────────────────────────────────
    abrirMinhaTBR: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="tbrConsultaContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Minha TBR</h3>
                <div class="mb-3 d-flex align-items-center flex-wrap" style="gap:10px">
                    <label class="mb-0 font-weight-bold" style="font-size:0.9rem">Mês:</label>
                    <select id="tbrMesFiltro" class="form-control" style="width:180px"
                            onchange="tbr_view.carregarTBR(this.value)">
                        <option value="">Carregando...</option>
                    </select>
                </div>
                <div id="tbrTabela">
                    <p class="text-muted small">Carregando...</p>
                </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/TBR/index.js')
            .done(function () {
                if (window.tbr_view) tbr_view.init();
            })
            .fail(function () {
                console.error('Erro ao carregar script TBR.');
            });
    },

    sincronizarLeituras: async function () {
        const btn = $('#btnSincronizar');
        const msg = $('#sincronizarMsg');

        btn.prop('disabled', true).text('⏳ Sincronizando...');
        msg.text('').css('color', '');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/sincronizar_leituras.php', {
                method: 'POST'
            });
            const json = await resp.json();

            if (!json.status) {
                msg.text('Erro: ' + (json.error || 'falha na sincronização.')).css('color', '#dc3545');
                return;
            }

            msg.text(json.data.message).css('color', json.data.sincronizados > 0 ? '#28a745' : '#6c757d');

            // Atualiza os cards do header se houve livros finalizados
            if (json.data.sincronizados > 0 && typeof window.atualizarHeaderContadores === 'function') {
                window.atualizarHeaderContadores();
            }

            // Recarrega a tabela do mês ou do ano, dependendo da view aberta
            const mesAtual = $('#leiturasMesFiltro').val();
            const anoAtual = $('#leiturasAnoFiltro').val();
            if (window.leituras_view && mesAtual) {
                leituras_view.carregarMes(mesAtual);
            } else if (window.leituras_view && anoAtual) {
                leituras_view.carregarAno(anoAtual);
            }
        } catch (e) {
            console.error('Erro ao sincronizar:', e);
            msg.text('Erro inesperado ao sincronizar.').css('color', '#dc3545');
        } finally {
            btn.prop('disabled', false).html('🔄 Sincronizar Leituras');
        }
    },

   abrirCronogramaLC: function () {
        this._carregarCSSCronograma();

        // Limpa o conteúdo atual do main e injeta container do cronograma
        $('#menu_lateral').css('width', '250px');
        $('#menu_lateral').addClass('oculto');
        $('#mainConteudo').html(`
            <div id="cronogramaLCContainer" class="container-fluid mt-4">
                <h3 class="mb-3 d-flex justify-content-between align-items-center">
                    Cronograma das Leituras Coletivas
                    <span style="background:#ff9800; color:#fff; font-size:0.85rem; padding:4px 12px; border-radius:6px; font-weight:normal;">
                        ${new Date().toLocaleDateString('pt-BR')}
                    </span>
                </h3>
                <div id="tabelaCronogramaLC"></div>
            </div>
        `);

        // Injeta o HTML dos modais (editar, nova LC) no DOM, sem abrir nenhum deles
        if ($('#modalEditarCronogramaLC').length === 0) {
            $.ajax({
                url: '/php/pages/base/components/menu_lateral/leituras_coletivas/index.php',
                method: 'GET',
                success: function (html) {
                    $('body').append(html);
                }
            });
        }

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
    },

    // ─── Desafios ─────────────────────────────────────────────────

    _carregarDesafiosScript: function (callback) {
        const carregarScript = function () {
            $.getScript('/php/pages/base/components/menu_lateral/desafios/index.js')
                .done(callback)
                .fail(function () { console.error('Erro ao carregar script Desafios.'); });
        };

        if ($('#modalNovoDesafio').length === 0) {
            $.ajax({
                url: '/php/pages/base/components/menu_lateral/desafios/index.php',
                method: 'GET',
                success: function (html) {
                    $('body').append(html);
                    carregarScript();
                },
                error: function () { console.error('Erro ao carregar HTML Desafios.'); }
            });
        } else {
            carregarScript();
        }
    },

    abrirModalNovoDesafio: function () {
        this._carregarDesafiosScript(function () {
            if (window.desafios) {
                desafios.iniciarNovoDesafio();
                $('#modalNovoDesafio').modal('show');
            }
        });
    },

    abrirAcompanhamentoDesafios: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="desafiosAcompContainer" class="container-fluid mt-4">
                <h3 class="mb-3 d-flex justify-content-between align-items-center">
                    Acompanhamento de Desafios
                    <button class="btn btn-sm btn-success"
                            style="font-size:0.85rem"
                            onclick="menuLateral.abrirModalNovoDesafio()">
                        + Novo Desafio
                    </button>
                </h3>
                <div id="desafiosContainer"></div>
            </div>
        `);

        // Injeta modais no DOM se ainda não existirem
        if ($('#modalEditarDesafio').length === 0) {
            $.ajax({
                url: '/php/pages/base/components/menu_lateral/desafios/index.php',
                method: 'GET',
                success: function (html) { $('body').append(html); }
            });
        }

        $.getScript('/php/pages/base/components/menu_lateral/desafios/index.js')
            .done(function () {
                if (window.desafios) desafios.carregarAcompanhamento();
            })
            .fail(function () {
                console.error('Erro ao carregar script Desafios.');
                $('#desafiosContainer').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
            });
    },

    // ─── Gráficos de Leituras ─────────────────────────────────────
    abrirGraficos: function () {
        this._carregarCSSCronograma();

        $('#mainConteudo').html(`
            <div class="container-fluid mt-4 pb-4" id="graficosContainer">
                <h3 class="mb-4">Gráficos de Leituras</h3>

                <!-- Linha 1: TBR vs Leituras Concluídas -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px">
                            <h6 style="font-size:0.88rem;font-weight:700;margin-bottom:12px;color:#333">
                                TBR Planejado vs Leituras Concluídas por Mês
                            </h6>
                            <div style="position:relative;height:280px">
                                <canvas id="graf-tbr-vs-leituras"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Linha 2: Gráficos de mês -->
                <div class="row mb-4">

                    <div class="col-md-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px">
                            <h6 style="font-size:0.88rem;font-weight:700;margin-bottom:12px;color:#333">
                                Total de Leituras Concluídas por Mês
                            </h6>
                            <div style="position:relative;height:260px">
                                <canvas id="graf-mes-total"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px">
                            <h6 style="font-size:0.88rem;font-weight:700;margin-bottom:12px;color:#333">
                                Concluídas vs Em Andamento por Mês
                            </h6>
                            <div style="position:relative;height:260px">
                                <canvas id="graf-mes-andamento"></canvas>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Linha 2: Roscas do acervo -->
                <h5 class="mb-3" style="font-size:0.95rem;font-weight:700">Acervo — Lidos vs Não Lidos</h5>
                <div class="row">

                    <div class="col-md-3 col-sm-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:14px;text-align:center">
                            <h6 style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Livros Físicos</h6>
                            <small class="text-muted d-block" id="graf-fisicos-total" style="margin-bottom:10px">—</small>
                            <div style="position:relative;height:210px">
                                <canvas id="graf-fisicos"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 col-sm-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:14px;text-align:center">
                            <h6 style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Tag</h6>
                            <small class="text-muted d-block" id="graf-tag-total" style="margin-bottom:10px">—</small>
                            <div style="position:relative;height:210px">
                                <canvas id="graf-tag"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 col-sm-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:14px;text-align:center">
                            <h6 style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Ebooks / Kindle</h6>
                            <small class="text-muted d-block" id="graf-ebooks-total" style="margin-bottom:10px">—</small>
                            <div style="position:relative;height:210px">
                                <canvas id="graf-ebooks"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 col-sm-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:14px;text-align:center">
                            <h6 style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Acervo Geral</h6>
                            <small class="text-muted d-block" id="graf-geral-total" style="margin-bottom:10px">—</small>
                            <div style="position:relative;height:210px">
                                <canvas id="graf-geral"></canvas>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `);

        // Carrega Chart.js CDN se ainda não estiver no DOM
        function _loadChartJS(callback) {
            if (window.Chart) { callback(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
            s.onload = callback;
            s.onerror = () => console.error('Falha ao carregar Chart.js');
            document.head.appendChild(s);
        }

        _loadChartJS(function () {
            $.getScript('/php/pages/base/components/main/graficos.js?v=' + Date.now())
                .done(function () {
                    if (window.graficos) graficos.init();
                })
                .fail(function () {
                    console.error('Erro ao carregar graficos.js');
                    $('#graficosContainer').html(
                        '<div class="alert alert-danger">Não foi possível carregar o módulo de gráficos.</div>'
                    );
                });
        });
    },

    // ─── Estatísticas de Livros e Ebooks ─────────────────────────
    abrirEstatisticasLivros: async function () {
        this._carregarCSSCronograma();

        $('#mainConteudo').html(`
            <div class="container-fluid mt-4">
                <h3 class="mb-4">Estatísticas — Livros e Ebooks</h3>
                <div id="statsContainer">
                    <p class="text-muted small">Carregando...</p>
                </div>
            </div>
        `);

        try {
            const resp = await fetch('/php/api/base/main/livros/listar_estatisticas.php');
            const json = await resp.json();

            if (!json.status) {
                $('#statsContainer').html(`<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`);
                return;
            }

            const { total_geral, geral, por_tipo } = json.data;

            // ── Mapa status → contagem geral ─────────────────────
            const mapGeral = {};
            geral.forEach(r => { mapGeral[r.status] = parseInt(r.total) || 0; });

            const lidos    = mapGeral['Lido']  || 0;
            const lendo    = mapGeral['Lendo'] || 0;
            const naoLido  = Object.entries(mapGeral)
                .filter(([s]) => s !== 'Lido' && s !== 'Lendo')
                .reduce((acc, [, v]) => acc + v, 0);
            const pctLidos = total_geral > 0 ? ((lidos / total_geral) * 100).toFixed(1) : '0.0';

            // ── Card geral ───────────────────────────────────────
            let html = `
                <div class="row mb-4">
                    <div class="col-12">
                        <div style="border:1px solid #dee2e6;border-radius:8px;padding:20px;background:#f8f9fa">
                            <h5 class="mb-3" style="font-size:1rem;font-weight:700;color:#333">
                                Resumo Geral
                                <span style="font-size:0.82rem;font-weight:400;color:#888;margin-left:10px">
                                    ${total_geral} livros no acervo
                                </span>
                            </h5>
                            <div class="row text-center">
                                <div class="col-md-3 col-6 mb-3">
                                    <div style="font-size:2rem;font-weight:700;color:#28a745">${lidos}</div>
                                    <div style="font-size:0.82rem;color:#555">Lidos</div>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <div style="font-size:2rem;font-weight:700;color:#fd7e14">${lendo}</div>
                                    <div style="font-size:0.82rem;color:#555">Lendo</div>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <div style="font-size:2rem;font-weight:700;color:#6c757d">${naoLido}</div>
                                    <div style="font-size:0.82rem;color:#555">Não lidos</div>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <div style="font-size:2rem;font-weight:700;color:#4e79a7">${pctLidos}%</div>
                                    <div style="font-size:0.82rem;color:#555">% lidos</div>
                                </div>
                            </div>
                            <div style="background:#e9ecef;border-radius:6px;height:12px;overflow:hidden;margin-top:4px">
                                <div style="width:${pctLidos}%;background:#28a745;height:100%;border-radius:6px;
                                            transition:width .4s ease"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // ── Classificação: tipo_edicao → grupo fixo ──────────
            function classGrupo(tipoEdicao) {
                const t = (tipoEdicao || '').toLowerCase().trim();
                if (t === 'bolso' || t.startsWith('brochura') || t === 'capa dura' || t === 'presente')
                    return 'Livro Físico';
                if (t === 'epub' || t === 'ebook' || t === 'e-book')
                    return 'Ebook';
                if (t === 'tag')
                    return 'Tag';
                return 'Outros';
            }

            const ORDEM_GRUPOS = ['Livro Físico', 'Ebook', 'Tag', 'Outros'];
            const grupos = {};
            ORDEM_GRUPOS.forEach(g => { grupos[g] = { total: 0, lidos: 0, lendo: 0, naoLido: 0 }; });

            por_tipo.forEach(r => {
                const g  = classGrupo(r.tipo_edicao);
                const qt = parseInt(r.total) || 0;
                grupos[g].total += qt;
                if      (r.status === 'Lido')  grupos[g].lidos  += qt;
                else if (r.status === 'Lendo') grupos[g].lendo  += qt;
                else                           grupos[g].naoLido += qt;
            });

            // ── Cards por grupo ──────────────────────────────────
            html += '<div class="row">';

            ORDEM_GRUPOS.forEach(nome => {
                const v = grupos[nome];
                if (v.total === 0) return;
                const pct = ((v.lidos / v.total) * 100).toFixed(1);

                html += `
                    <div class="col-md-4 col-sm-6 mb-3">
                        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;height:100%">
                            <h6 style="font-size:0.9rem;font-weight:700;margin-bottom:12px;
                                       border-bottom:2px solid #dee2e6;padding-bottom:6px;color:#333">
                                ${nome}
                                <span style="font-size:0.78rem;font-weight:400;color:#888;float:right">${v.total} total</span>
                            </h6>
                            <div class="d-flex justify-content-between mb-1" style="font-size:0.85rem">
                                <span style="color:#28a745">✔ Lidos</span>
                                <strong>${v.lidos}</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-1" style="font-size:0.85rem">
                                <span style="color:#fd7e14">⟳ Lendo</span>
                                <strong>${v.lendo}</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2" style="font-size:0.85rem">
                                <span style="color:#6c757d">○ Não lidos</span>
                                <strong>${v.naoLido}</strong>
                            </div>
                            <div style="background:#e9ecef;border-radius:4px;height:8px;overflow:hidden;margin-bottom:4px">
                                <div style="width:${pct}%;background:#28a745;height:100%;border-radius:4px"></div>
                            </div>
                            <div style="font-size:0.78rem;color:#555;text-align:right">${pct}% lidos</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';

            // ── Tabela status × grupos ────────────────────────────
            const todosStatus   = [...new Set(por_tipo.map(r => r.status))].sort();
            const gruposAtivos  = ORDEM_GRUPOS.filter(g => grupos[g].total > 0);

            if (todosStatus.length > 0 && gruposAtivos.length > 1) {
                html += `
                    <h5 class="mt-2 mb-3" style="font-size:0.95rem;font-weight:700">Detalhamento por Tipo e Status</h5>
                    <div style="overflow-x:auto;margin-bottom:30px">
                    <table style="width:100%;border-collapse:collapse;font-size:0.83rem">
                        <thead style="background:#f8f9fa">
                            <tr>
                                <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">Status</th>
                `;
                gruposAtivos.forEach(g => {
                    html += `<th style="padding:7px 10px;border:1px solid #dee2e6;text-align:center">${g}</th>`;
                });
                html += `<th style="padding:7px 10px;border:1px solid #dee2e6;text-align:center;font-weight:700">Total</th></tr></thead><tbody>`;

                todosStatus.forEach(st => {
                    let rowTotal = 0;
                    let row = `<tr><td style="padding:6px 10px;border:1px solid #dee2e6;font-weight:500">${st}</td>`;
                    gruposAtivos.forEach(g => {
                        const qt = por_tipo
                            .filter(r => classGrupo(r.tipo_edicao) === g && r.status === st)
                            .reduce((acc, r) => acc + (parseInt(r.total) || 0), 0);
                        rowTotal += qt;
                        row += `<td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">${qt || '—'}</td>`;
                    });
                    row += `<td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center;font-weight:700">${rowTotal}</td></tr>`;
                    html += row;
                });

                html += `<tr style="background:#f8f9fa;font-weight:700"><td style="padding:6px 10px;border:1px solid #dee2e6">Total</td>`;
                let gt = 0;
                gruposAtivos.forEach(g => {
                    const t = grupos[g].total;
                    gt += t;
                    html += `<td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">${t}</td>`;
                });
                html += `<td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">${gt}</td></tr>`;
                html += '</tbody></table></div>';
            }

            $('#statsContainer').html(html);

        } catch (e) {
            console.error('Erro ao carregar estatísticas:', e);
            $('#statsContainer').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    // ─── Lista por Autor ─────────────────────────────────────────
    _autorState: {
        dados:      [],
        colunas:    [],
        statusCol:  null,
        chave:      '',
        pagina:     1,
        sortCol:    '',
        sortDir:    1,
    },

    // Configuração de cada coluna: label pt-BR, peso para largura proporcional, tipo de dado
    _autorColCfg: {
        // colunas comuns (tabelas específicas)
        autor:            { label: 'Autor',              peso: 3, tipo: 'texto' },
        titulo:           { label: 'Título',             peso: 5, tipo: 'texto' },
        status:           { label: 'Status',             peso: 2, tipo: 'texto' },
        situacao:         { label: 'Situação',           peso: 2, tipo: 'texto' },
        serie:            { label: 'Série',              peso: 3, tipo: 'texto' },
        seq:              { label: 'Seq.',               peso: 1, tipo: 'num'   },
        data_lancamento:  { label: 'Lançamento',         peso: 2, tipo: 'data'  },
        data_registro:    { label: 'Registrado',         peso: 2, tipo: 'data'  },
        created_at:       { label: 'Cadastrado',         peso: 2, tipo: 'data'  },
        // colunas da tabela LivrosAutor (aliases normalizados)
        titulo_portugues: { label: 'Título em PT',       peso: 4, tipo: 'texto' },
        volume:           { label: 'Volume',             peso: 1, tipo: 'num'   },
        genero:           { label: 'Gênero',             peso: 2, tipo: 'texto' },
        tema:             { label: 'Tema',               peso: 2, tipo: 'texto' },
        paginas:          { label: 'Páginas',            peso: 1, tipo: 'num'   },
        pais:             { label: 'País',               peso: 2, tipo: 'texto' },
        data_publicacao:  { label: 'Publicação',         peso: 2, tipo: 'data'  },
    },

    _importDados: [],

    abrirListaPorAutor: async function () {
        this._carregarCSSCronograma();

        const badgesColunas = [
            ['Titulo',          'obrigatório', '#dc3545'],
            ['TituloPortugues', 'opcional',    '#6c757d'],
            ['Autor',           'opcional',    '#6c757d'],
            ['Serie',           'opcional',    '#6c757d'],
            ['Volume',          'opcional',    '#6c757d'],
            ['Genero',          'opcional',    '#6c757d'],
            ['Tema',            'opcional',    '#6c757d'],
            ['Paginas',         'opcional',    '#6c757d'],
            ['Status',          'opcional',    '#6c757d'],
            ['Pais',            'opcional',    '#6c757d'],
            ['DataPublicacao',  'opcional',    '#6c757d'],
        ];

        const badgesHtml = badgesColunas.map(function (b) {
            return '<span style="display:inline-block;background:' + b[2] + ';color:#fff;' +
                   'padding:3px 8px;border-radius:4px;font-size:0.78rem;margin:2px">' +
                   b[0] + ' <em style="font-size:0.7rem;opacity:0.85">(' + b[1] + ')</em></span>';
        }).join('');

        $('#mainConteudo').html(`
            <div class="container-fluid mt-4" style="max-width:1400px">
                <div class="d-flex justify-content-between align-items-start mb-4">
                    <h4 style="font-weight:700;margin:0">Lista por Autor</h4>
                    <button class="btn btn-success btn-sm"
                            onclick="menuLateral._abrirModalImportar()"
                            style="font-size:0.85rem">
                        + Cadastrar Livros do Autor
                    </button>
                </div>

                <div class="mb-4" style="max-width:400px">
                    <label style="font-size:0.9rem;font-weight:600;display:block;margin-bottom:6px">
                        Selecione o escritor / lista
                    </label>
                    <select id="autorSelect" class="form-control">
                        <option value="">— escolha um autor —</option>
                    </select>
                </div>

                <div id="autorContainer">
                    <p class="text-muted" style="font-size:0.88rem">Selecione um autor para ver os livros.</p>
                </div>
            </div>

            <!-- Modal: Cadastrar Livros do Autor via Excel -->
            <div class="modal fade" id="modalImportarLivros" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
                <div class="modal-content">

                  <div class="modal-header" style="background:#343a40;color:#fff;padding:12px 16px">
                    <h5 class="modal-title" style="font-size:1rem;font-weight:700">Cadastrar Livros do Autor</h5>
                    <button type="button" class="close" style="color:#fff;opacity:1" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>

                  <div class="modal-body">

                    <div class="alert alert-info py-2 mb-3" style="font-size:0.87rem">
                      <strong>Como importar do Excel:</strong>
                      <ol class="mb-1 mt-1 pl-3">
                        <li>Organize sua planilha com o <strong>cabeçalho na primeira linha</strong></li>
                        <li>Os nomes das colunas devem corresponder às indicadas abaixo</li>
                        <li>Selecione as células (cabeçalho + dados) e copie <kbd>Ctrl+C</kbd></li>
                        <li>Cole no campo abaixo <kbd>Ctrl+V</kbd> e clique em <strong>Pré-visualizar</strong></li>
                      </ol>
                    </div>

                    <div class="mb-3">
                      <strong style="font-size:0.87rem;display:block;margin-bottom:6px">Colunas da tabela <code>LivrosAutor</code>:</strong>
                      <div>${badgesHtml}</div>
                    </div>

                    <div class="form-group">
                      <label style="font-size:0.87rem;font-weight:600">Cole os dados do Excel aqui:</label>
                      <textarea id="importPasteArea" class="form-control" rows="7"
                                style="font-size:0.82rem;font-family:monospace"
                                placeholder="Cole os dados copiados do Excel (com cabeçalho)..."></textarea>
                    </div>

                    <div id="importPreview"></div>

                  </div>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary btn-sm"
                            onclick="menuLateral._parsearImportacao()">
                        Pré-visualizar
                    </button>
                    <button type="button" class="btn btn-success btn-sm"
                            id="btnConfirmarImport" style="display:none"
                            onclick="menuLateral._confirmarImportacao()">
                        ✔ Confirmar Importação
                    </button>
                  </div>

                </div>
              </div>
            </div>
        `);

        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_autor.php?acao=autores');
            const json = await resp.json();
            if (!json.status || !json.data) return;

            const sel = document.getElementById('autorSelect');
            json.data.forEach(function (a) {
                const opt = document.createElement('option');
                opt.value       = a.chave;
                opt.textContent = a.label;
                sel.appendChild(opt);
            });

            // Bind via jQuery para garantir disparo correto (evita problema com onchange inline)
            const self = this;
            $('#autorSelect').on('change', function () {
                self._autorSelecionado(this.value);
            });
        } catch (e) {
            console.error('Erro ao carregar autores:', e);
        }
    },

    _abrirModalImportar: function () {
        const area = document.getElementById('importPasteArea');
        if (area) area.value = '';
        const prev = document.getElementById('importPreview');
        if (prev) prev.innerHTML = '';
        const btn = document.getElementById('btnConfirmarImport');
        if (btn) btn.style.display = 'none';
        this._importDados = [];
        $('#modalImportarLivros').modal('show');
    },

    _parsearImportacao: function () {
        const texto = (document.getElementById('importPasteArea').value || '').trim();
        const prev  = document.getElementById('importPreview');

        if (!texto) {
            prev.innerHTML = '<div class="alert alert-warning py-2">Cole os dados do Excel antes de pré-visualizar.</div>';
            return;
        }

        const linhas = texto.split(/\r?\n/).map(function (l) { return l.split('\t'); });

        if (linhas.length < 2) {
            prev.innerHTML = '<div class="alert alert-warning py-2">Dados insuficientes — inclua o cabeçalho e pelo menos uma linha de dados.</div>';
            return;
        }

        // Normaliza header: remove acentos, lowercase, trim
        const normalizar = function (h) {
            return h.trim().toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '');
        };

        // Mapa de variações aceitas → nome canônico da coluna PHP/DB
        const MAPA = {
            'titulo': 'Titulo', 'title': 'Titulo',
            'tituloportugues': 'TituloPortugues', 'titulo portugues': 'TituloPortugues',
            'titulo em portugues': 'TituloPortugues', 'title pt': 'TituloPortugues',
            'titulo pt': 'TituloPortugues',
            'autor': 'Autor', 'author': 'Autor', 'autora': 'Autor',
            'serie': 'Serie', 'series': 'Serie', 'colecao': 'Serie',
            'volume': 'Volume', 'vol': 'Volume',
            'genero': 'Genero', 'genre': 'Genero',
            'tema': 'Tema', 'theme': 'Tema',
            'paginas': 'Paginas', 'pages': 'Paginas', 'pags': 'Paginas', 'num paginas': 'Paginas',
            'status': 'Status', 'situacao': 'Status',
            'pais': 'Pais', 'country': 'Pais', 'nacionalidade': 'Pais',
            'datapublicacao': 'DataPublicacao', 'data publicacao': 'DataPublicacao',
            'data de publicacao': 'DataPublicacao', 'data lancamento': 'DataPublicacao',
            'ano': 'DataPublicacao', 'year': 'DataPublicacao', 'published': 'DataPublicacao',
            'ano publicacao': 'DataPublicacao',
        };

        const headers      = linhas[0].map(normalizar);
        const colsMapeadas = headers.map(function (h) { return MAPA[h] || null; });
        const reconhecidas = colsMapeadas.filter(Boolean);

        if (!reconhecidas.includes('Titulo')) {
            prev.innerHTML = '<div class="alert alert-danger py-2">Coluna <strong>Titulo</strong> não encontrada no cabeçalho. Verifique os nomes das colunas.</div>';
            document.getElementById('btnConfirmarImport').style.display = 'none';
            return;
        }

        // Parse linhas de dados
        const dados = linhas.slice(1)
            .filter(function (l) { return l.some(function (c) { return c.trim(); }); })
            .map(function (linha) {
                const obj = {};
                colsMapeadas.forEach(function (col, i) {
                    if (col) obj[col] = (linha[i] || '').trim() || null;
                });
                return obj;
            });

        this._importDados = dados;

        // Ordem de exibição no preview
        const COLS_ORDEM = ['Titulo','TituloPortugues','Autor','Serie','Volume','Genero','Tema','Paginas','Status','Pais','DataPublicacao'];
        const colsVisiveis = COLS_ORDEM.filter(function (c) { return reconhecidas.includes(c); });

        let html = '<div class="alert alert-success py-2 mb-3" style="font-size:0.87rem">' +
            '<strong>' + dados.length + '</strong> linha(s) — ' +
            '<strong>' + colsVisiveis.length + '</strong> coluna(s) reconhecida(s): ' +
            colsVisiveis.join(', ') + '</div>';

        // Aviso colunas não reconhecidas
        const naoReconhecidas = linhas[0]
            .map(function (h, i) { return colsMapeadas[i] ? null : h.trim(); })
            .filter(Boolean);
        if (naoReconhecidas.length) {
            html += '<div class="alert alert-warning py-2 mb-3" style="font-size:0.82rem">' +
                'Colunas ignoradas (não reconhecidas): <em>' + naoReconhecidas.join(', ') + '</em></div>';
        }

        // Tabela preview (max 10 linhas)
        const preview = dados.slice(0, 10);
        html += '<div style="overflow-x:auto"><table class="table table-sm table-bordered" style="font-size:0.8rem">' +
            '<thead class="thead-dark"><tr>';
        colsVisiveis.forEach(function (c) { html += '<th>' + c + '</th>'; });
        html += '</tr></thead><tbody>';
        preview.forEach(function (row) {
            html += '<tr>';
            colsVisiveis.forEach(function (c) {
                html += '<td>' + (row[c] != null ? row[c] : '<em class="text-muted">—</em>') + '</td>';
            });
            html += '</tr>';
        });
        if (dados.length > 10) {
            html += '<tr><td colspan="' + colsVisiveis.length + '" class="text-center text-muted py-2">' +
                '... e mais ' + (dados.length - 10) + ' linha(s)</td></tr>';
        }
        html += '</tbody></table></div>';

        prev.innerHTML = html;
        document.getElementById('btnConfirmarImport').style.display = '';
    },

    _confirmarImportacao: async function () {
        if (!this._importDados || !this._importDados.length) return;

        const btn = document.getElementById('btnConfirmarImport');
        btn.disabled    = true;
        btn.textContent = 'Importando...';

        try {
            const resp = await fetch('/php/api/base/main/livros/cadastrar_livros_autor.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ dados: this._importDados }),
            });
            const json = await resp.json();

            if (!json.status) {
                document.getElementById('importPreview').innerHTML +=
                    '<div class="alert alert-danger mt-2">' + json.error + '</div>';
                return;
            }

            $('#modalImportarLivros').modal('hide');

            let texto = json.inseridos + ' livro(s) cadastrado(s) com sucesso.';
            if (json.erros && json.erros.length) {
                texto += ' (' + json.erros.length + ' linha(s) com erro ignorada(s))';
            }

            Swal.fire({
                title:              'Importação concluída!',
                text:               texto,
                icon:               'success',
                confirmButtonColor: '#28a745',
            });

            // Atualiza tabela se LivrosAutor estiver selecionado
            const sel = document.getElementById('autorSelect');
            if (sel && sel.value === 'livros_autor') {
                menuLateral._autorSelecionado('livros_autor');
            }

        } catch (e) {
            document.getElementById('importPreview').innerHTML +=
                '<div class="alert alert-danger mt-2">Erro ao importar. Tente novamente.</div>';
        } finally {
            btn.disabled    = false;
            btn.textContent = '✔ Confirmar Importação';
        }
    },

    _autorSelecionado: async function (chave) {
        const box = document.getElementById('autorContainer');
        if (!chave) {
            box.innerHTML = '<p class="text-muted" style="font-size:0.88rem">Selecione um autor para ver os livros.</p>';
            return;
        }

        box.innerHTML = '<p class="text-muted small">Carregando...</p>';

        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_autor.php?acao=livros&chave=' + chave);
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = '<div class="alert alert-danger py-2 mb-0" style="font-size:0.85rem">' + (json.error || 'Erro ao carregar dados.') + '</div>';
                return;
            }
            if (!json.data || json.data.length === 0) {
                box.innerHTML = '<p class="text-muted small">Nenhum livro encontrado para este autor.</p>';
                return;
            }

            this._autorState.dados      = json.data;
            this._autorState.colunas    = json.colunas;
            this._autorState.statusCol  = json.status_col || null;
            this._autorState.chave      = chave;
            this._autorState.pagina     = 1;
            this._autorState.sortCol    = json.colunas[0] || '';
            this._autorState.sortDir    = 1;

            this._renderAutor();
        } catch (e) {
            console.error('Erro ao carregar livros:', e);
            document.getElementById('autorContainer').innerHTML =
                '<div class="alert alert-danger">Erro ao carregar dados.</div>';
        }
    },

    _toggleStatusAutor: async function (chave, titulo, statusAtual) {
        const novoStatus = statusAtual.toLowerCase() === 'lido' ? '' : 'Lido';
        try {
            const body = new FormData();
            body.append('chave',  chave);
            body.append('titulo', titulo);
            body.append('status', novoStatus);
            const resp = await fetch('/php/api/base/main/livros/update_status_por_autor.php', { method: 'POST', body });
            const json = await resp.json();
            if (json.status) {
                // Atualiza dado local e re-renderiza
                const st = this._autorState;
                const idx = st.dados.findIndex(function (d) { return d[st.colunas[0]] === titulo || d.titulo === titulo; });
                if (idx !== -1 && st.statusCol) st.dados[idx][st.statusCol] = novoStatus;
                this._renderAutor();
            }
        } catch (e) {
            console.error('Erro ao atualizar status:', e);
        }
    },

    _ordenarAutor: function (col) {
        const st = this._autorState;
        st.sortDir = st.sortCol === col ? st.sortDir * -1 : 1;
        st.sortCol = col;
        st.pagina  = 1;
        this._renderAutor();
    },

    _paginarAutor: function (delta) {
        const perPag = 20;
        const total  = Math.ceil(this._autorState.dados.length / perPag) || 1;
        const nova   = this._autorState.pagina + delta;
        if (nova < 1 || nova > total) return;
        this._autorState.pagina = nova;
        this._renderAutor();
    },

    _renderAutor: function () {
        const st      = this._autorState;
        const cfg     = this._autorColCfg;
        const perPag  = 20;
        const statusCol = st.statusCol || null;
        const chave     = st.chave    || '';

        // Filtra as colunas a exibir (status/situacao é tratada separadamente como checkbox)
        const colunas = st.colunas.filter(function (c) { return c !== statusCol; });

        // Calcula larguras proporcionais (exclui coluna de status)
        const pesoTotal = colunas.reduce(function (acc, c) {
            return acc + ((cfg[c] && cfg[c].peso) || 2);
        }, 0);
        const pct = function (c) {
            return (((cfg[c] && cfg[c].peso) || 2) / pesoTotal * 100).toFixed(1);
        };

        // Ordena
        const col     = st.sortCol;
        const dir     = st.sortDir;
        const colTipo = (cfg[col] && cfg[col].tipo) || 'texto';

        const sorted = [...st.dados].sort(function (a, b) {
            let vA = a[col] != null ? a[col] : '';
            let vB = b[col] != null ? b[col] : '';
            if (colTipo === 'num') {
                return dir * ((parseFloat(vA) || 0) - (parseFloat(vB) || 0));
            }
            if (colTipo === 'data') {
                return dir * (new Date(vA || 0) - new Date(vB || 0));
            }
            return dir * String(vA).localeCompare(String(vB), 'pt-BR');
        });

        const total   = sorted.length;
        const totPag  = Math.ceil(total / perPag) || 1;
        const inicio  = (st.pagina - 1) * perPag;
        const pagina  = sorted.slice(inicio, inicio + perPag);

        const seta = function (c) { return c === col ? (dir === 1 ? ' ▲' : ' ▼') : ''; };
        const thSt = 'padding:5px 8px;border-bottom:2px solid #dee2e6;cursor:pointer;user-select:none;white-space:nowrap;font-size:0.82rem;background:#f8f9fa';
        const thChk = 'padding:5px 8px;border-bottom:2px solid #dee2e6;text-align:center;font-size:0.82rem;background:#f8f9fa;white-space:nowrap;width:60px';

        let html = '<div style="overflow-x:hidden">' +
            '<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:0.82rem">' +
            '<thead><tr>';

        // Coluna de checkbox se há statusCol
        if (statusCol) {
            html += '<th style="' + thChk + '">Lido</th>';
        }
        colunas.forEach(function (c) {
            html += '<th style="' + thSt + ';width:' + pct(c) + '%" ' +
                    'onclick="menuLateral._ordenarAutor(\'' + c + '\')">' +
                    (cfg[c] ? cfg[c].label : c) + seta(c) + '</th>';
        });
        html += '</tr></thead><tbody>';

        const fmtData = function (val) {
            if (!val) return '—';
            const s = String(val).split('T')[0].split('-');
            return s.length === 3 ? s[2] + '/' + s[1] + '/' + s[0] : val;
        };

        const tdTxt = 'padding:4px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid #f0f0f0';
        const tdCtr = 'padding:4px 8px;text-align:center;white-space:nowrap;border-bottom:1px solid #f0f0f0';
        const tdChk = 'padding:4px 8px;text-align:center;border-bottom:1px solid #f0f0f0';

        var _htmlAttr = function (s) {
            return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        };

        pagina.forEach(function (row) {
            const statusVal = statusCol ? (row[statusCol] || '') : '';
            const isLido    = statusVal.toLowerCase() === 'lido';

            html += '<tr style="' + (isLido ? 'background:#f0fff4' : '') + '">';

            if (statusCol) {
                const tituloVal = row.titulo || row[colunas[0]] || '';
                html += '<td style="' + tdChk + '">' +
                    '<input type="checkbox" class="chk-autor-status"' + (isLido ? ' checked' : '') +
                    ' data-chave="' + _htmlAttr(chave) + '"' +
                    ' data-titulo="' + _htmlAttr(tituloVal) + '"' +
                    ' data-status="' + _htmlAttr(statusVal) + '"' +
                    ' title="' + (isLido ? 'Marcar como não lido' : 'Marcar como lido') + '">' +
                    '</td>';
            }

            colunas.forEach(function (c) {
                const tipo = (cfg[c] && cfg[c].tipo) || 'texto';
                let val = row[c];
                if (val == null || val === '') val = '—';
                else if (tipo === 'data') val = fmtData(val);

                const estilo = (tipo === 'num' || tipo === 'data') ? tdCtr : tdTxt;
                const title  = tipo === 'texto' ? ' title="' + String(row[c] || '').replace(/"/g, '&quot;') + '"' : '';
                html += '<td style="' + estilo + '"' + title + '>' + val + '</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';

        // Paginação
        const btnSt  = 'padding:2px 10px;font-size:0.8rem;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer';
        const bAnt   = st.pagina <= 1
            ? '<button style="' + btnSt + ';opacity:0.4" disabled>‹ Anterior</button>'
            : '<button style="' + btnSt + '" onclick="menuLateral._paginarAutor(-1)">‹ Anterior</button>';
        const bProx  = st.pagina >= totPag
            ? '<button style="' + btnSt + ';opacity:0.4" disabled>Próximo ›</button>'
            : '<button style="' + btnSt + '" onclick="menuLateral._paginarAutor(1)">Próximo ›</button>';
        const fim    = Math.min(inicio + perPag, total);

        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:0.8rem;color:#555">' +
            '<span>' + total + ' livro' + (total !== 1 ? 's' : '') + ' — mostrando ' + (total > 0 ? inicio + 1 : 0) + '–' + fim + '</span>' +
            '<div style="display:flex;gap:8px">' + bAnt +
            '<span style="padding:2px 6px">Pág. ' + st.pagina + ' / ' + totPag + '</span>' +
            bProx + '</div></div>';

        // ── Estatísticas por autor ───────────────────────────────────
        if (statusCol && st.dados.length > 0) {
            // Agrupa por autor (campo "autor")
            const grupos = {};
            st.dados.forEach(function (row) {
                const nomeAutor = row.autor || '—';
                if (!grupos[nomeAutor]) grupos[nomeAutor] = { total: 0, lidos: 0 };
                grupos[nomeAutor].total++;
                if ((row[statusCol] || '').toLowerCase() === 'lido') grupos[nomeAutor].lidos++;
            });

            const autores = Object.keys(grupos).sort();
            const totalGeral = st.dados.length;
            const lidosGeral = st.dados.filter(function (r) { return (r[statusCol] || '').toLowerCase() === 'lido'; }).length;
            const faltamGeral = totalGeral - lidosGeral;
            const pctGeral = totalGeral > 0 ? ((lidosGeral / totalGeral) * 100).toFixed(1) : '0.0';

            html += '<div style="margin-top:16px;border-top:1px solid #dee2e6;padding-top:12px">' +
                '<strong style="font-size:0.87rem;display:block;margin-bottom:8px">Progresso de Leitura</strong>';

            if (autores.length > 1) {
                autores.forEach(function (nome) {
                    const g   = grupos[nome];
                    const f   = g.total - g.lidos;
                    const p   = g.total > 0 ? ((g.lidos / g.total) * 100).toFixed(1) : '0.0';
                    const cor = parseFloat(p) >= 100 ? '#155724' : parseFloat(p) >= 50 ? '#856404' : '#721c24';
                    const bg  = parseFloat(p) >= 100 ? '#d4edda' : parseFloat(p) >= 50 ? '#fff3cd' : '#f8d7da';
                    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:0.82rem">' +
                        '<span style="min-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + nome + '">' + nome + '</span>' +
                        '<span style="flex:1;background:#e9ecef;border-radius:4px;height:12px;overflow:hidden">' +
                        '<span style="display:block;width:' + p + '%;height:100%;background:' + (parseFloat(p) >= 100 ? '#28a745' : '#007bff') + '"></span>' +
                        '</span>' +
                        '<span style="min-width:90px;text-align:right">' +
                        '<span style="padding:1px 6px;border-radius:3px;background:' + bg + ';color:' + cor + ';font-weight:bold">' + p + '%</span>' +
                        '</span>' +
                        '<span style="color:#555;min-width:120px">' + g.lidos + ' lido(s) · ' + f + ' falt' + (f !== 1 ? 'am' : 'a') + ' de ' + g.total + '</span>' +
                        '</div>';
                });
                html += '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #dee2e6;font-size:0.82rem;font-weight:bold">' +
                    'Total: ' + lidosGeral + ' lido(s) · ' + faltamGeral + ' falt' + (faltamGeral !== 1 ? 'am' : 'a') + ' de ' + totalGeral + ' livros (' + pctGeral + '%)' +
                    '</div>';
            } else {
                const nome = autores[0] || '';
                const g    = grupos[nome] || { total: totalGeral, lidos: lidosGeral };
                const cor  = parseFloat(pctGeral) >= 100 ? '#155724' : parseFloat(pctGeral) >= 50 ? '#856404' : '#721c24';
                const bg   = parseFloat(pctGeral) >= 100 ? '#d4edda' : parseFloat(pctGeral) >= 50 ? '#fff3cd' : '#f8d7da';
                html += '<p style="font-size:0.85rem;margin:0">' +
                    'Temos <strong>' + totalGeral + '</strong> livro' + (totalGeral !== 1 ? 's' : '') +
                    (nome && nome !== '—' ? ' de <em>' + nome + '</em>' : '') +
                    ', já li <strong>' + lidosGeral + '</strong>' +
                    ', falt' + (faltamGeral !== 1 ? 'am' : 'a') + ' <strong>' + faltamGeral + '</strong>' +
                    ' — <span style="padding:2px 8px;border-radius:3px;background:' + bg + ';color:' + cor + ';font-weight:bold">' + pctGeral + '%</span>' +
                    '</p>';
            }

            html += '</div>';
        }

        document.getElementById('autorContainer').innerHTML = html;

        // Bind checkbox events via data attributes (evita problemas de escape com títulos especiais)
        document.querySelectorAll('#autorContainer .chk-autor-status').forEach(function (el) {
            el.addEventListener('change', function () {
                menuLateral._toggleStatusAutor(
                    el.getAttribute('data-chave'),
                    el.getAttribute('data-titulo'),
                    el.getAttribute('data-status')
                );
            });
        });
    },

    abrirLivrosDesafios: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div class="container-fluid mt-4">
                <h3 class="mb-3">Livros dos Desafios</h3>
                <div id="livrosDesafiosContainer"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/menu_lateral/desafios/index.js')
            .done(function () {
                if (window.desafios) desafios.carregarLivrosDesafios();
            })
            .fail(function () { console.error('Erro ao carregar script Desafios.'); });
    },

    abrirModalLivroDesafio: function () {
        this._carregarDesafiosScript(function () {
            if (window.desafios) {
                desafios.iniciarModalLivroDesafio();
                $('#modalLivroDesafio').modal('show');
            }
        });
    },

    abrirDesafiosAndamento: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div class="container-fluid mt-4">
                <h3 class="mb-3">Desafios em Andamento</h3>
                <div id="desafiosAndamentoContainer"></div>
            </div>
        `);
        $.getScript('/php/pages/base/components/menu_lateral/desafios/index.js')
            .done(function () {
                if (window.desafios) desafios.carregarAndamento();
            })
            .fail(function () { console.error('Erro ao carregar script Desafios.'); });
    },

    // ─── Consulta Geral de Livros ─────────────────────────────────
    abrirConsultaGeral: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="cgContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Consulta Geral de Livros</h3>

                <div class="mb-3 d-flex flex-wrap align-items-end" style="gap:8px">

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Titulo</label>
                        <input type="text" id="cgTitulo" class="form-control form-control-sm"
                               style="width:220px" placeholder="Digite o titulo..."
                               onkeydown="if(event.key==='Enter') consulta_geral_view.buscar()">
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Autor</label>
                        <input type="text" id="cgAutor" class="form-control form-control-sm"
                               style="width:180px" placeholder="Digite o autor..."
                               onkeydown="if(event.key==='Enter') consulta_geral_view.buscar()">
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Tipo de Edicao</label>
                        <select id="cgTipoEdicao" class="form-control form-control-sm" style="width:150px">
                            <option value="">Todos</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Status</label>
                        <select id="cgLido" class="form-control form-control-sm" style="width:140px">
                            <option value="">Todos</option>
                            <option value="sim">Lido</option>
                            <option value="nao">Nao lido</option>
                            <option value="lendo">Lendo</option>
                            <option value="abandonado">Abandonado</option>
                            <option value="interrompido">Interrompido</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Páginas</label>
                        <select id="cgPaginas" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todas</option>
                            <option value="ate100">Até 100</option>
                            <option value="101_200">101 a 200</option>
                            <option value="201_300">201 a 300</option>
                            <option value="301_400">301 a 400</option>
                            <option value="mais400">Mais de 400</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Natureza</label>
                        <select id="cgNatureza" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todas</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Sexo do Autor</label>
                        <select id="cgSexo" class="form-control form-control-sm" style="width:140px">
                            <option value="">Todos</option>
                            <option value="F">Feminino</option>
                            <option value="M">Masculino</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Raça</label>
                        <select id="cgRaca" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todas</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">País</label>
                        <select id="cgPais" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todos</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Mes de Leitura</label>
                        <input type="month" id="cgMes" class="form-control form-control-sm"
                               style="width:160px" min="2020-01">
                    </div>

                    <button class="btn btn-primary btn-sm" onclick="consulta_geral_view.buscar()">
                        Buscar
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="consulta_geral_view.limpar()">
                        Limpar
                    </button>
                </div>

                <div id="cgTabela">
                    <p class="text-muted small">Carregando...</p>
                </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/ConsultaGeral/index.js')
            .done(function () {
                if (window.consulta_geral_view) consulta_geral_view.init();
            })
            .fail(function () {
                console.error('Erro ao carregar script Consulta Geral.');
                $('#cgTabela').html('<div class="alert alert-danger">Erro ao carregar o modulo de consulta.</div>');
            });
    },

    // ─── Consulta Empréstimos Geral ───────────────────────────────
    abrirConsultaEmprestimos: function () {
        this._carregarCSSCronograma();
        $('#mainConteudo').html(`
            <div id="ceContainer" class="container-fluid mt-4">
                <h3 class="mb-3">Consulta Empréstimos Geral</h3>

                <div class="mb-3 d-flex flex-wrap align-items-end" style="gap:8px">

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Titulo</label>
                        <input type="text" id="ceTitulo" class="form-control form-control-sm"
                               style="width:220px" placeholder="Digite o titulo..."
                               onkeydown="if(event.key==='Enter') consulta_emprestimos_view.buscar()">
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Autor</label>
                        <input type="text" id="ceAutor" class="form-control form-control-sm"
                               style="width:180px" placeholder="Digite o autor..."
                               onkeydown="if(event.key==='Enter') consulta_emprestimos_view.buscar()">
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Status</label>
                        <select id="ceStatus" class="form-control form-control-sm" style="width:140px">
                            <option value="">Todos</option>
                            <option value="sim">Lido</option>
                            <option value="nao">Nao lido</option>
                            <option value="lendo">Lendo</option>
                            <option value="abandonado">Abandonado</option>
                            <option value="interrompido">Interrompido</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Origem</label>
                        <select id="ceOrigem" class="form-control form-control-sm" style="width:180px">
                            <option value="">Todas</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Sexo do Autor</label>
                        <select id="ceSexo" class="form-control form-control-sm" style="width:140px">
                            <option value="">Todos</option>
                            <option value="F">Feminino</option>
                            <option value="M">Masculino</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">Raça</label>
                        <select id="ceRaca" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todas</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 d-block" style="font-size:0.82rem;font-weight:600">País</label>
                        <select id="cePais" class="form-control form-control-sm" style="width:160px">
                            <option value="">Todos</option>
                        </select>
                    </div>

                    <button class="btn btn-primary btn-sm" onclick="consulta_emprestimos_view.buscar()">
                        Buscar
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="consulta_emprestimos_view.limpar()">
                        Limpar
                    </button>
                </div>

                <div id="ceTabela">
                    <p class="text-muted small">Carregando...</p>
                </div>
            </div>
        `);
        $.getScript('/php/pages/base/components/main/ConsultaEmprestimos/index.js')
            .done(function () {
                if (window.consulta_emprestimos_view) consulta_emprestimos_view.init();
            })
            .fail(function () {
                console.error('Erro ao carregar script Consulta Emprestimos.');
                $('#ceTabela').html('<div class="alert alert-danger">Erro ao carregar o modulo de consulta.</div>');
            });
    }

};

// Expor para escopo global
window.menuLateral = menuLateral;
