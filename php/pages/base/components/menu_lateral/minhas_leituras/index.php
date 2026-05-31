
<script src="/php/pages/base/components/menu_lateral/minhas_leituras/index.js"></script>
<link rel="stylesheet" href="/public/assets/css/menu_lateral.css">

<!-- Modal: Minhas Impressões -->
<div class="modal fade" id="modalMinhasImpressoes" tabindex="-1" role="dialog" aria-labelledby="modalMinhasImpressoesLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalMinhasImpressoesLabel">Minhas Impressões</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Selecionar leitura -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Leitura</legend>

          <div class="form-group mb-2">
            <label>Filtrar por título</label>
            <input type="text" id="imp_filtro" class="form-control"
                   placeholder="Digite para filtrar..."
                   oninput="minhas_leituras.filtrarSelectImpressoes()">
          </div>

          <div class="form-group mb-0">
            <label>Livro <span class="text-danger">*</span></label>
            <select id="imp_leitura" class="form-control" onchange="minhas_leituras.onLeituraImpressaoChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Dados do livro selecionado (oculto até selecionar) -->
        <fieldset id="imp_secao_livro" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro Selecionado</legend>

          <div class="row">
            <div class="col-md-8">
              <label class="small text-muted">Título</label>
              <p id="imp_titulo_display" class="mb-0 font-weight-bold"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Autor</label>
              <p id="imp_autor_display" class="mb-0"></p>
            </div>
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Observações -->
        <fieldset id="imp_secao_obs" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Observações</legend>

          <div class="row">
            <div class="col-md-4 form-group">
              <label>Capítulo</label>
              <input type="text" id="imp_capitulo" class="form-control form-control-sm"
                     placeholder="Ex: 5 ou Cap. 5">
            </div>
            <div class="col-md-4 form-group">
              <label>Página ou Percentual</label>
              <input type="text" id="imp_pagina_percentual" class="form-control form-control-sm"
                     placeholder="Ex: 120 ou 45%">
            </div>
          </div>

          <div class="form-group mb-0">
            <label>O que você quer registrar sobre este livro? <span class="text-danger">*</span></label>
            <textarea id="imp_observacoes" class="form-control" rows="4"
                      placeholder="Anotações, reflexões, trechos marcantes, críticas..."></textarea>
          </div>
        </fieldset>

        <input type="hidden" id="imp_id_leitura">
        <div id="imp_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="minhas_leituras.salvarImpressao()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- Modal: Atualizando a Leitura Atual -->
<div class="modal fade" id="modalAtualizandoLeitura" tabindex="-1" role="dialog" aria-labelledby="modalAtualizandoLeituraLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalAtualizandoLeituraLabel">Atualizando a Leitura Atual</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Selecionar leitura em andamento -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Leitura em Andamento</legend>

          <div class="form-group mb-0">
            <label>Livro <span class="text-danger">*</span></label>
            <select id="al_leitura" class="form-control" onchange="minhas_leituras.onLeituraAndamentoChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Detalhes + Progresso (oculto até selecionar) -->
        <fieldset id="al_secao_progresso" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Progresso</legend>

          <!-- Dados do livro (read-only) -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="small text-muted">Título</label>
              <p id="al_titulo_display" class="mb-0 font-weight-bold"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Autor</label>
              <p id="al_autor_display" class="mb-0"></p>
            </div>
            <div class="col-md-2">
              <label class="small text-muted">Páginas</label>
              <p id="al_paginas_display" class="mb-0 font-weight-bold"></p>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="small text-muted">Tipo de Mídia</label>
              <p id="al_tipomidia_display" class="mb-0"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Data de Início</label>
              <p id="al_datainicio_display" class="mb-0"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Tempo de Leitura</label>
              <p id="al_tempo_display" class="mb-0 font-weight-bold"></p>
            </div>
          </div>

          <!-- Tipo de input -->
          <div class="form-group">
            <label>Registrar por <span class="text-danger">*</span></label>
            <select id="al_tipo_input" class="form-control" onchange="minhas_leituras.onTipoInputChange()">
              <option value="">Selecione</option>
              <option value="percentual">Percentual (%)</option>
              <option value="pagina">Página atual</option>
            </select>
          </div>

          <!-- Input Percentual -->
          <div id="al_wrapper_percentual" class="d-none">
            <div class="row align-items-end">
              <div class="col-md-5 form-group mb-0">
                <label>Percentual lido (%) <span class="text-danger">*</span></label>
                <input type="number" id="al_percentual" class="form-control"
                       min="0" max="100" step="0.1" placeholder="Ex: 45.5"
                       oninput="minhas_leituras.calcularProgresso()">
              </div>
              <div class="col-md-5 form-group mb-0">
                <label class="small text-muted d-block">Página correspondente</label>
                <p id="al_pagina_calc_display" class="mb-0 font-weight-bold" style="font-size:1.1rem">—</p>
              </div>
            </div>
          </div>

          <!-- Input Página -->
          <div id="al_wrapper_pagina" class="d-none">
            <div class="row align-items-end">
              <div class="col-md-5 form-group mb-0">
                <label>Página atual <span class="text-danger">*</span></label>
                <input type="number" id="al_pagina_atual" class="form-control"
                       min="0" step="1" placeholder="Ex: 150"
                       oninput="minhas_leituras.calcularProgresso()">
              </div>
              <div class="col-md-5 form-group mb-0">
                <label class="small text-muted d-block">Percentual correspondente</label>
                <p id="al_percentual_calc_display" class="mb-0 font-weight-bold" style="font-size:1.1rem">—</p>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Impressões -->
        <fieldset id="al_secao_impressoes" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Impressões</legend>

          <div class="form-group mb-0">
            <label>O que chamou sua atenção até aqui?</label>
            <textarea id="al_impressoes" class="form-control" rows="3"
                      placeholder="Anote reflexões, trechos marcantes, curiosidades..."></textarea>
          </div>
        </fieldset>

        <!-- SEÇÃO 4: Avaliação (aparece só com 100% / última página) -->
        <fieldset id="al_secao_avaliacao" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Avaliação do Livro</legend>

          <div class="form-group mb-0">
            <label>Avaliação</label>
            <select id="al_avaliacao" class="form-control">
              <option value="">Selecione</option>
              <option value="1">⭐ 1</option>
              <option value="2">⭐⭐ 2</option>
              <option value="3">⭐⭐⭐ 3</option>
              <option value="4">⭐⭐⭐⭐ 4</option>
              <option value="5">⭐⭐⭐⭐⭐ 5</option>
            </select>
          </div>
        </fieldset>

        <!-- Campos hidden -->
        <input type="hidden" id="al_id_leitura">
        <input type="hidden" id="al_paginas_total">
        <input type="hidden" id="al_data_inicio_hidden">

        <div id="al_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="minhas_leituras.salvarAtualizacao()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- Modal: Começando um Novo Livro -->
<div class="modal fade" id="modalComecarLivro" tabindex="-1" role="dialog" aria-labelledby="modalComecarLivroLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalComecarLivroLabel">Começando um Novo Livro</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Local de Leitura -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Local de Leitura</legend>

          <div class="form-group mb-0">
            <label>Local <span class="text-danger">*</span></label>
            <select id="cl_local" class="form-control" onchange="minhas_leituras.onLocalChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Busca do Livro (oculta até selecionar local) -->
        <fieldset id="cl_secao_livro" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <!-- Campo de busca -->
          <div id="cl_busca_wrapper">
            <div class="input-group mb-2">
              <input type="text" id="cl_busca_titulo" class="form-control"
                     placeholder="Digite parte do título..."
                     onkeyup="minhas_leituras.onBuscaKeyup(event)">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button"
                        onclick="minhas_leituras.buscarLivro()">Buscar</button>
              </div>
            </div>

            <!-- Resultados -->
            <div id="cl_resultados"></div>

            <!-- Não encontrado -->
            <div id="cl_nao_encontrado" class="d-none">
              <div class="alert alert-warning py-2 mb-2">
                Livro não encontrado nesta plataforma.
                <button class="btn btn-sm btn-primary ml-2"
                        onclick="minhas_leituras.abrirCadastroLivro()">Cadastrar livro</button>
              </div>
            </div>
          </div>

          <!-- Livro selecionado -->
          <div id="cl_livro_selecionado" class="d-none">
            <div class="row align-items-center">
              <div class="col-md-7">
                <label class="small text-muted">Título</label>
                <p id="cl_titulo_display" class="mb-0 font-weight-bold"></p>
              </div>
              <div class="col-md-3">
                <label class="small text-muted">Autor</label>
                <p id="cl_autor_display" class="mb-0"></p>
              </div>
              <div class="col-md-2 text-right">
                <button class="btn btn-sm btn-outline-secondary mt-3"
                        onclick="minhas_leituras.limparLivroSelecionado()">Trocar</button>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-3">
                <label class="small text-muted">Páginas</label>
                <p id="cl_paginas_display" class="mb-0"></p>
              </div>
              <div class="col-md-3">
                <label class="small text-muted">Tema</label>
                <p id="cl_tema_display" class="mb-0"></p>
              </div>
            </div>
            <!-- Campos ocultos com dados do livro -->
            <input type="hidden" id="cl_livro_id">
            <input type="hidden" id="cl_livro_local">
            <input type="hidden" id="cl_livro_titulo">
            <input type="hidden" id="cl_livro_autor">
            <input type="hidden" id="cl_livro_paginas">
            <input type="hidden" id="cl_livro_sexo_autor">
            <input type="hidden" id="cl_livro_pais">
            <input type="hidden" id="cl_livro_raca">
            <input type="hidden" id="cl_livro_tema">
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Dados da Leitura (oculta até selecionar livro) -->
        <fieldset id="cl_secao_dados" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Dados da Leitura</legend>

          <div class="row">
            <div class="col-md-6 form-group">
              <label>Tipo de Mídia</label>
              <select id="cl_tipo_midia" class="form-control">
                <option value="">Selecione</option>
              </select>
            </div>
            <div class="col-md-6 form-group">
              <label>Data de Início <span class="text-danger">*</span></label>
              <input type="date" id="cl_data_inicio" class="form-control"
                     onchange="minhas_leituras.onDataInicioChange()">
            </div>
          </div>

          <div class="form-group">
            <label>Natureza</label>
            <select id="cl_natureza" class="form-control" onchange="minhas_leituras.onNaturezaChange()">
              <option value="">Selecione</option>
              <option value="Leitura Pessoal">Leitura Pessoal</option>
              <option value="LC">LC (Leitura Coletiva)</option>
              <option value="Desafio">Desafio</option>
              <option value="Maratona">Maratona</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <!-- Sub-select LC -->
          <div id="cl_sub_lc" class="form-group d-none">
            <label>Grupo de LC <span class="text-danger">*</span></label>
            <select id="cl_lc_grupo" class="form-control">
              <option value="">Selecione a LC...</option>
            </select>
          </div>

          <!-- Sub-select Desafio -->
          <div id="cl_sub_desafio" class="form-group d-none">
            <label>Desafio <span class="text-danger">*</span></label>
            <select id="cl_desafio" class="form-control">
              <option value="">Selecione o desafio...</option>
            </select>
          </div>

          <div class="row">
            <div class="col-md-6 form-group">
              <label>Avaliação</label>
              <select id="cl_avaliacao" class="form-control">
                <option value="">Selecione</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>
            <div class="col-md-6 form-group">
              <label class="small text-muted d-block">Mês (calculado)</label>
              <p id="cl_mes_display" class="mb-0 font-weight-bold mt-1">—</p>
            </div>
          </div>
        </fieldset>

        <div id="cl_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="minhas_leituras.salvarLeitura()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- Modal: Frase Favorita -->
<div class="modal fade" id="modalFraseFavorita" tabindex="-1" role="dialog"
     aria-labelledby="modalFraseFavoritaLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalFraseFavoritaLabel">Cadastrar Frase Favorita</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Livro em andamento -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <div class="form-group mb-0">
            <label>Leitura em Andamento <span class="text-danger">*</span></label>
            <select id="ff_leitura" class="form-control"
                    onchange="minhas_leituras.onLeituraFraseChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Info do livro (aparece após selecionar) -->
        <fieldset id="ff_secao_info" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro Selecionado</legend>

          <div class="row">
            <div class="col-md-8">
              <label class="small text-muted">Título</label>
              <p id="ff_titulo_display" class="mb-0 font-weight-bold"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Autor</label>
              <p id="ff_autor_display" class="mb-0"></p>
            </div>
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Localização na leitura -->
        <fieldset id="ff_secao_frase" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Citação</legend>

          <div class="row mb-2">
            <div class="col-md-3 form-group mb-2">
              <label class="small">Capítulo</label>
              <input type="text" id="ff_capitulo" class="form-control form-control-sm"
                     placeholder="Ex: 5">
            </div>
            <div class="col-md-3 form-group mb-2">
              <label class="small">Página ou Percentual</label>
              <input type="text" id="ff_pagina_percentual" class="form-control form-control-sm"
                     placeholder="Ex: 120 ou 45%">
            </div>
            <div class="col-md-3 form-group mb-2">
              <label class="small">Avaliação da frase</label>
              <select id="ff_avaliacao_frase" class="form-control form-control-sm">
                <option value="">—</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>
            <div class="col-md-3 form-group mb-2">
              <label class="small">Tema</label>
              <input type="text" id="ff_tema_display" class="form-control form-control-sm"
                     readonly style="background:#f8f9fa">
            </div>
          </div>

          <div class="form-group mb-0">
            <label>Escreva a frase <span class="text-danger">*</span></label>
            <textarea id="ff_frase" class="form-control" rows="4"
                      placeholder="Digite ou cole a citação aqui..."></textarea>
          </div>
        </fieldset>

        <!-- Campos ocultos -->
        <input type="hidden" id="ff_id_leitura">
        <input type="hidden" id="ff_titulo">
        <input type="hidden" id="ff_autor">
        <input type="hidden" id="ff_tema">
        <input type="hidden" id="ff_mes">

        <div id="ff_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary btn-sm"
                onclick="minhas_leituras.salvarFraseFavorita()">Salvar</button>
      </div>

    </div>
  </div>
</div>
