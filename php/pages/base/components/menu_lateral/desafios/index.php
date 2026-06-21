
<script src="/php/pages/base/components/menu_lateral/desafios/index.js"></script>

<!-- =============================================
     Modal: Novo Desafio
     ============================================= -->
<div class="modal fade" id="modalNovoDesafio" tabindex="-1" role="dialog"
     aria-labelledby="modalNovoDesafioLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalNovoDesafioLabel">Novo Desafio</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Identificação</legend>

          <div class="form-group">
            <label>Temática <span class="text-danger">*</span></label>
            <input type="text" id="nd_tematica" class="form-control"
                   placeholder="Ex: 50 Livros Antes dos 50, Desafio Primavera 2025...">
            <small class="text-muted">Este nome será usado para vincular leituras ao desafio.</small>
          </div>

          <div class="form-group mb-0">
            <label>Descrição</label>
            <textarea id="nd_descricao" class="form-control" rows="3"
                      placeholder="Descreva o objetivo do desafio..."></textarea>
          </div>
        </fieldset>

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Metas e Situação</legend>

          <div class="row">
            <div class="col-md-4 form-group">
              <label>Ano</label>
              <input type="number" id="nd_ano" class="form-control"
                     placeholder="Ex: 2025" min="2000" max="2099">
            </div>
            <div class="col-md-4 form-group">
              <label>Meta de Livros</label>
              <input type="number" id="nd_meta_livros" class="form-control"
                     placeholder="Ex: 50" min="1">
            </div>
            <div class="col-md-4 form-group">
              <label>Situação</label>
              <select id="nd_situacao" class="form-control">
                <option value="Em andamento">Em andamento</option>
                <option value="Pausado">Pausado</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div class="row mb-0">
            <div class="col-md-6 form-group mb-0">
              <label>Data de Início</label>
              <input type="date" id="nd_data_inicio" class="form-control">
            </div>
            <div class="col-md-6 form-group mb-0">
              <label>Data de Fim (prevista)</label>
              <input type="date" id="nd_data_fim" class="form-control">
            </div>
          </div>
        </fieldset>

        <div id="nd_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="desafios.salvarNovo()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<!-- =============================================
     Modal: Editar Desafio
     ============================================= -->
<div class="modal fade" id="modalEditarDesafio" tabindex="-1" role="dialog"
     aria-labelledby="modalEditarDesafioLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalEditarDesafioLabel">Editar Desafio</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <input type="hidden" id="ed_id">

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Identificação</legend>

          <div class="form-group">
            <label>Temática <span class="text-danger">*</span></label>
            <input type="text" id="ed_tematica" class="form-control">
            <small class="text-muted">Alterar a temática atualiza o vínculo com leituras existentes.</small>
          </div>

          <div class="form-group mb-0">
            <label>Descrição</label>
            <textarea id="ed_descricao" class="form-control" rows="3"></textarea>
          </div>
        </fieldset>

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Metas e Situação</legend>

          <div class="row">
            <div class="col-md-4 form-group">
              <label>Ano</label>
              <input type="number" id="ed_ano" class="form-control" min="2000" max="2099">
            </div>
            <div class="col-md-4 form-group">
              <label>Meta de Livros</label>
              <input type="number" id="ed_meta_livros" class="form-control" min="1">
            </div>
            <div class="col-md-4 form-group">
              <label>Situação</label>
              <select id="ed_situacao" class="form-control">
                <option value="Em andamento">Em andamento</option>
                <option value="Pausado">Pausado</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div class="row mb-0">
            <div class="col-md-6 form-group mb-0">
              <label>Data de Início</label>
              <input type="date" id="ed_data_inicio" class="form-control">
            </div>
            <div class="col-md-6 form-group mb-0">
              <label>Data de Fim (prevista)</label>
              <input type="date" id="ed_data_fim" class="form-control">
            </div>
          </div>
        </fieldset>

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Status do Registro</legend>
          <div class="form-group mb-0">
            <label>Ativo</label>
            <select id="ed_bAtivo" class="form-control">
              <option value="1">Ativa</option>
              <option value="0">Inativa</option>
            </select>
            <small class="text-muted">Registros inativos não aparecem no painel de acompanhamento.</small>
          </div>
        </fieldset>

        <div id="ed_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="desafios.salvarEdicao()">Atualizar</button>
      </div>

    </div>
  </div>
</div>

<!-- =============================================
     Modal: Incluir Livro no Desafio
     ============================================= -->
<div class="modal fade" id="modalLivroDesafio" tabindex="-1" role="dialog"
     aria-labelledby="modalLivroDesafioLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalLivroDesafioLabel">Incluir Livro no Desafio</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Selecionar Livro</legend>

          <div class="row">
            <div class="col-md-5 form-group">
              <label>Local de Leitura <span class="text-danger">*</span></label>
              <select id="ld_local" class="form-control" onchange="desafios.carregarLivrosPorLocal()">
                <option value="">— Selecione —</option>
                <option value="Biblioteca">Biblioteca</option>
                <option value="Skeelo">Skeelo</option>
                <option value="Kindle_Unlimited">Kindle Unlimited</option>
                <option value="Audible">Audible</option>
                <option value="Biblion">Biblion</option>
                <option value="MEC_Livros">MEC Livros</option>
              </select>
            </div>
            <div class="col-md-7 form-group">
              <label>Livro <span class="text-danger">*</span></label>
              <select id="ld_livro" class="form-control" onchange="desafios.preencherDadosLivro()" disabled>
                <option value="">— Selecione o local primeiro —</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset class="border rounded p-3 mb-3" id="ld_painel_dados" style="display:none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Dados do Livro</legend>

          <div class="row">
            <div class="col-md-6 form-group">
              <label>Autor</label>
              <input type="text" id="ld_autor" class="form-control" readonly>
            </div>
            <div class="col-md-3 form-group">
              <label>Sexo</label>
              <input type="text" id="ld_sexo" class="form-control" readonly>
            </div>
            <div class="col-md-3 form-group">
              <label>Páginas</label>
              <input type="text" id="ld_paginas" class="form-control" readonly>
            </div>
          </div>

          <div class="row mb-0">
            <div class="col-md-5 form-group mb-0">
              <label>Nacionalidade</label>
              <input type="text" id="ld_nacionalidade" class="form-control" readonly>
            </div>
            <div class="col-md-4 form-group mb-0">
              <label>Tema</label>
              <input type="text" id="ld_tema" class="form-control" readonly>
            </div>
            <div class="col-md-3 form-group mb-0">
              <label>Mês de Leitura</label>
              <input type="text" id="ld_mes" class="form-control" readonly>
            </div>
          </div>
        </fieldset>

        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Dados do Desafio</legend>

          <div class="row">
            <div class="col-md-6 form-group">
              <label>Nome do Desafio <span class="text-danger">*</span></label>
              <select id="ld_nome_desafio" class="form-control">
                <option value="">— Selecione —</option>
              </select>
            </div>
            <div class="col-md-2 form-group">
              <label>Sequência <span class="text-danger">*</span></label>
              <select id="ld_sequencia" class="form-control">
                <option value="">—</option>
              </select>
            </div>
            <div class="col-md-4 form-group">
              <label>Natureza Desafio</label>
              <input type="text" id="ld_natureza" class="form-control" placeholder="Ex: Releitura, Maratona...">
            </div>
          </div>
        </fieldset>

        <div id="ld_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="desafios.salvarLivroDesafio()">Incluir</button>
      </div>

    </div>
  </div>
</div>
