

<script src="/php/pages/base/components/menu_lateral/leituras_coletivas/index.js"></script>
<link rel="stylesheet" href="/public/assets/css/menu_lateral.css">
<link rel="stylesheet" href="/public/assets/css/cronograma.css">
<link rel="stylesheet" href="/public/assets/css/header.css">




<div class="modal fade" id="modalNovaLC" tabindex="-1" role="dialog" aria-labelledby="modalNovaLCLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalNovaLCLabel">Cadastro de Leitura Coletiva</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <form method="POST" id="formLeituraColetiva">

          <div class="grupo">
            <label>Nome da Leitura Coletiva</label>
            <input type="text" name="nome_lc" required>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Participando?</label>
              <select name="participando" required>
                <option value="">Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div class="grupo">
              <label>Natureza</label>
              <input type="text" name="natureza">
            </div>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Gênero</label>
              <input type="text" name="genero">
            </div>

            <div class="grupo">
              <label>Grupo</label>
              <input type="text" name="grupo">
            </div>
          </div>

        </form>

        <div id="mensagemLC" class="mt-3"></div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="leitura_coletiva.cadastrarLC()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- Modal Editar Cronograma LC -->
<div class="modal fade" id="modalEditarCronogramaLC" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title">Editar Leitura Coletiva</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <input type="hidden" id="editarLCId">

        <div class="grupo mb-3">
          <label>Título</label>
          <input type="text" id="editarLCTitulo" class="form-control">
        </div>

        <div class="grupo mb-3">
          <label>LC</label>
          <input type="text" id="editarLCNome" class="form-control" readonly>
        </div>

        <div class="grupo mb-3">
          <label>Data Final</label>
          <input type="date" id="editarLCDataFinal" class="form-control">
        </div>

        <div id="mensagemEditarLC" class="mt-2"></div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="leitura_coletiva.salvarEdicaoLC()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- =============================================
     Modal Nova LC (entrada no Cronograma)
     Fluxo: Grupo → Local → Buscar livro → Datas → Salvar
     ============================================= -->
<div class="modal fade" id="modalNovaCronogramaLC" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title">Nova LC — Adicionar ao Cronograma</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Grupo de LC -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Grupo de Leitura Coletiva</legend>

          <div class="form-group mb-2">
            <label>LC <span class="text-danger">*</span></label>
            <select id="nlc_grupo" class="form-control" onchange="leitura_coletiva.onGrupoLCChange()">
              <option value="">Carregando...</option>
            </select>
          </div>

          <!-- Info do grupo — aparece após seleção -->
          <div id="nlc_info_grupo" class="d-none">
            <div class="row">
              <div class="col-md-6">
                <label class="small text-muted">Participando</label>
                <p id="nlc_participando" class="mb-1 font-weight-bold"></p>
              </div>
              <div class="col-md-6">
                <label class="small text-muted">Natureza</label>
                <p id="nlc_natureza" class="mb-1 font-weight-bold"></p>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Local e busca do livro -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <div class="form-group mb-2">
            <label>Local de Leitura <span class="text-danger">*</span></label>
            <select id="nlc_local" class="form-control" onchange="leitura_coletiva.onLocalChange()">
              <option value="">Carregando...</option>
            </select>
          </div>

          <!-- Busca — aparece após selecionar local -->
          <div id="nlc_busca_wrapper" class="d-none">
            <div class="input-group mb-2">
              <input type="text" id="nlc_busca_titulo" class="form-control"
                     placeholder="Digite parte do título..."
                     onkeyup="leitura_coletiva.onBuscaKeyup(event)">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button"
                        onclick="leitura_coletiva.buscarLivroNaTabela()">Buscar</button>
              </div>
            </div>

            <!-- Resultados da busca -->
            <div id="nlc_resultados"></div>

            <!-- Aviso livro não encontrado -->
            <div id="nlc_nao_encontrado" class="d-none">
              <div class="alert alert-warning py-2 mb-2">
                Livro não encontrado nesta plataforma.
                <button class="btn btn-sm btn-primary ml-2"
                        onclick="leitura_coletiva.abrirCadastroLivro()">Cadastrar livro</button>
              </div>
            </div>
          </div>

          <!-- Livro selecionado — aparece após clicar na linha da tabela de resultados -->
          <div id="nlc_livro_selecionado" class="d-none">
            <div class="row align-items-center">
              <div class="col-md-8">
                <label class="small text-muted">Título selecionado</label>
                <p id="nlc_titulo_display" class="mb-0 font-weight-bold"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Páginas</label>
                <p id="nlc_paginas_display" class="mb-0 font-weight-bold"></p>
              </div>
              <div class="col-md-2 text-right">
                <button class="btn btn-sm btn-outline-secondary mt-3"
                        onclick="leitura_coletiva.limparLivroSelecionado()">Trocar</button>
              </div>
            </div>
            <!-- Campos ocultos com os valores -->
            <input type="hidden" id="nlc_titulo">
            <input type="hidden" id="nlc_paginas">
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Datas (aparece após selecionar o livro) -->
        <fieldset id="nlc_secao_datas" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Datas</legend>

          <div class="row">
            <div class="col-md-6 form-group">
              <label>Data Final <span class="text-danger">*</span></label>
              <input type="date" id="nlc_data_final" class="form-control"
                     onchange="leitura_coletiva.calcularAutomaticos()">
            </div>
            <div class="col-md-6 form-group">
              <label>Mês/Ano da LC <span class="text-danger">*</span></label>
              <input type="month" id="nlc_mes" class="form-control">
            </div>
          </div>

          <!-- Campos calculados — exibição apenas -->
          <div class="row">
            <div class="col-md-4">
              <label class="small text-muted">Situação</label>
              <p class="mb-0 font-weight-bold">A começar</p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Prazo (dias)</label>
              <p id="nlc_dias_prazo_display" class="mb-0 font-weight-bold">—</p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Média pág/dia</label>
              <p id="nlc_media_display" class="mb-0 font-weight-bold">—</p>
            </div>
          </div>
        </fieldset>

        <div id="nlc_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="leitura_coletiva.salvarNovaCronogramaLC()">Salvar</button>
      </div>

    </div>
  </div>
</div>
