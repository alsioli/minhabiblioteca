
<script src="/php/pages/base/components/menu_lateral/biblioteca/index.js"></script>
<link rel="stylesheet" href="/public/assets/css/menu_lateral.css">
<link rel="stylesheet" href="/public/assets/css/header.css">


<!-- =============================================
     Modal Cadastro de Novo Livro
     Etapa 1: Seleciona o local de leitura
     Etapa 2: Formulário adaptado ao local
     ============================================= -->
<div class="modal fade" id="modalNovoLivro" tabindex="-1" role="dialog" aria-labelledby="modalNovoLivroLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalNovoLivroLabel">Cadastro de Novo Livro</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- ETAPA 1: Local de leitura (sempre visível) -->
        <div class="grupo mb-3">
          <label><strong>Local de Leitura <span class="text-danger">*</span></strong></label>
          <select id="select_local_cadastro" class="form-control"
                  onchange="biblioteca.onLocalCadastroChange()">
            <option value="">Selecione o local...</option>
          </select>
          <small class="text-muted">O formulário será exibido após a seleção.</small>
        </div>

        <!-- ETAPA 2: Formulário (oculto até selecionar o local) -->
        <form method="POST" id="formLivro" style="display:none">
          <input type="hidden" name="local_cadastro" id="local_cadastro_hidden">

          <!-- ── Campos comuns a todas as tabelas ──────────────────────── -->
          <div class="linha">
            <div class="grupo">
              <label>Título <span class="text-danger">*</span></label>
              <input type="text" name="titulo" id="livro_titulo" required>
            </div>
          </div>

          <div class="grupo">
            <label>Autor <span class="text-danger">*</span></label>
            <input type="text" name="autor" id="livro_autor" required>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Série</label>
              <input type="text" name="serie">
            </div>
            <div class="grupo">
              <label>Volume</label>
              <input type="number" name="volume">
            </div>
          </div>

          <div class="grupo">
            <label>Gênero</label>
            <input type="text" name="genero">
          </div>

          <div class="grupo">
            <label>Tema</label>
            <select id="select_tema" name="tema">
              <option value="">Selecione</option>
            </select>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Editora</label>
              <input type="text" name="editora">
            </div>
            <div class="grupo">
              <label>Páginas</label>
              <input type="number" name="paginas">
            </div>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Status</label>
              <select name="status">
                <option value="">Selecione</option>
                <option value="Lido">Lido</option>
                <option value="Não Lido">Não Lido</option>
                <option value="Lendo">Lendo</option>
                <option value="A começar">A começar</option>
              </select>
            </div>
            <div class="grupo">
              <label>Avaliação</label>
              <select name="avaliacao">
                <option value="">Selecione</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>
          </div>

          <!-- ── Empréstimo (KU / Biblion / MEC / Biblioteca) ──────────── -->
          <div id="secao_emprestimo" class="grupo" style="display:none">
            <label>Empréstimo</label>
            <select name="emprestimo">
              <option value="">Selecione</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>

          <!-- ── KindleUnlimited: ku_tipo ──────────────────────────────── -->
          <div id="secao_ku" style="display:none">
            <div class="grupo">
              <label>Tipo KU</label>
              <input type="text" name="ku_tipo" placeholder="Ex: Leitura, Audio...">
            </div>
          </div>

          <!-- ── Skeelo: skeelo_tipo + pais ───────────────────────────── -->
          <div id="secao_skeelo" style="display:none">
            <div class="linha">
              <div class="grupo">
                <label>Tipo Skeelo</label>
                <input type="text" name="skeelo_tipo">
              </div>
              <div class="grupo">
                <label>País</label>
                <input type="text" name="pais">
              </div>
            </div>
          </div>

          <!-- ── Audible: tipo_midia + favorito ───────────────────────── -->
          <div id="secao_audible" style="display:none">
            <div class="linha">
              <div class="grupo">
                <label>Tipo de Mídia</label>
                <input type="text" name="tipo_midia" placeholder="Ex: Audiobook, Podcast...">
              </div>
              <div class="grupo">
                <label>Favorito</label>
                <select name="favorito">
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ── Biblion: biblion_tipo ──────────────────────────────────── -->
          <div id="secao_biblion" style="display:none">
            <div class="grupo">
              <label>Tipo Biblion</label>
              <input type="text" name="biblion_tipo">
            </div>
          </div>

          <!-- ── Biblioteca (Livros): campos exclusivos ─────────────────── -->
          <div id="secao_biblioteca" style="display:none">
            <hr>
            <div class="linha">
              <div class="grupo">
                <label>Código <span class="text-danger">*</span></label>
                <input type="text" name="codigo" id="livro_codigo">
              </div>
              <div class="grupo">
                <label>Tipo de Código <span class="text-danger">*</span></label>
                <select name="tipo_codigo" id="livro_tipo_codigo">
                  <option value="">Selecione</option>
                  <option value="ASIN">ASIN</option>
                  <option value="ISBN-10">ISBN-10</option>
                  <option value="ISBN-13">ISBN-13</option>
                </select>
              </div>
            </div>

            <div class="linha">
              <div class="grupo">
                <label>Sexo do Autor</label>
                <select name="sexo_autor">
                  <option value="">Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
              <div class="grupo">
                <label>Nacionalidade</label>
                <input type="text" name="nacionalidade">
              </div>
              <div class="grupo">
                <label>Raça</label>
                <input type="text" name="raca">
              </div>
            </div>

            <div class="grupo">
              <label>Tipo de Edição</label>
              <select id="select_tipo_edicao" name="tipo_edicao">
                <option value="">Selecione</option>
              </select>
            </div>

            <div class="grupo">
              <label>Natureza</label>
              <select id="select_natureza" name="natureza">
                <option value="">Selecione</option>
              </select>
            </div>

            <div class="grupo">
              <label>Empréstimo</label>
              <select name="emprestimo">
                <option value="">Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div class="linha">
              <div class="grupo">
                <label>Data da Compra</label>
                <input type="date" name="data_compra">
              </div>
              <div class="grupo">
                <label>Valor da Compra</label>
                <input type="number" step="0.01" name="valor_compra">
              </div>
              <div class="grupo">
                <label>Local da Compra</label>
                <input type="text" name="local_compra">
              </div>
            </div>

            <div class="grupo">
              <label>Observações</label>
              <textarea name="observacoes" rows="3"></textarea>
            </div>
          </div>
          <!-- ── Fim campos exclusivos Biblioteca ──────────────────────── -->

        </form>

        <div id="cadastroMensagem" class="mt-3"></div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="biblioteca.cadastrarLivro()">Salvar</button>
      </div>

    </div>
  </div>
</div>


<!-- Modal Atualizar Livro (inalterado) -->
<div class="modal fade" id="modalAtualizarLivro" tabindex="-1" role="dialog" aria-labelledby="modalAtualizarLivroLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalAtualizarLivroLabel">Atualizar Cadastro de Livro</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <form method="POST" id="formLivroAtualizar">
            <input type="hidden" name="id_livro"     id="id_livro"     value="">
            <input type="hidden" name="local_leitura" id="local_leitura" value="Biblioteca">

            <div class="linha">
                <div class="grupo">
                    <label>Código</label>
                    <div style="display:flex; gap:5px;">
                        <input type="text" name="codigo" id="codigo_atualizar" required>
                        <button type="button" class="btn btn-info p-1" style="width:32px; height:32px;" onclick="biblioteca.buscarLivro('codigo')">
                            🔍
                        </button>
                    </div>
                </div>

                <div class="grupo">
                    <label>Tipo de Código</label>
                    <select name="tipo_codigo" id="tipo_codigo_atualizar" required>
                        <option value="">Selecione</option>
                        <option value="ASIN">ASIN</option>
                        <option value="ISBN-10">ISBN-10</option>
                        <option value="ISBN-13">ISBN-13</option>
                    </select>
                </div>
            </div>

            <div class="grupo">
                <label>Título</label>
                <div style="display:flex; gap:5px;">
                    <input type="text" name="titulo" id="titulo_atualizar" required>
                    <button type="button" class="btn btn-info p-1" style="width:32px; height:32px;" onclick="biblioteca.buscarLivro('titulo')">
                        🔍
                    </button>
                </div>
            </div>

            <div class="grupo">
                <label>Autor</label>
                <input type="text" name="autor" id="autor_atualizar" required>
            </div>

            <div class="linha">
                <div class="grupo">
                    <label>Sexo do Autor</label>
                    <select name="sexo_autor" id="sexo_autor_atualizar">
                        <option value="">Selecione</option>
                        <option value="F">Feminino</option>
                        <option value="M">Masculino</option>
                    </select>
                </div>
                <div class="grupo">
                    <label>Nacionalidade</label>
                    <input type="text" name="nacionalidade" id="nacionalidade_atualizar">
                </div>
                <div class="grupo">
                    <label>Raça</label>
                    <input type="text" name="raca" id="raça_atualizar">
                </div>
            </div>

            <div class="linha">
                <div class="grupo">
                    <label>Volume</label>
                    <input type="number" name="volume" id="volume_atualizar">
                </div>
                <div class="grupo">
                    <label>Série</label>
                    <input type="text" name="serie" id="serie_atualizar">
                </div>
            </div>

            <div class="grupo">
                <label>Gênero</label>
                <input type="text" name="genero" id="genero_atualizar">
            </div>

            <div class="grupo">
                <label>Tema</label>
                <select id="select_tema_atualizar" name="tema">
                    <option value="">Selecione</option>
                </select>
            </div>

            <div class="linha">
                <div class="grupo">
                    <label>Editora</label>
                    <input type="text" name="editora" id="editora_atualizar">
                </div>
                <div class="grupo">
                    <label>Tipo de Edição</label>
                    <select id="select_tipo_edicao_atualizar" name="tipo_edicao">
                        <option value="">Selecione</option>
                    </select>
                </div>
                <div class="grupo">
                    <label>Páginas</label>
                    <input type="number" name="paginas" id="paginas_atualizar">
                </div>
            </div>

            <div class="grupo">
                <label>Natureza</label>
                <select id="select_natureza_atualizar" name="natureza">
                    <option value="">Selecione</option>
                </select>
            </div>

            <div class="linha">
                <div class="grupo">
                    <label>Status</label>
                    <input type="text" name="status" id="status_atualizar">
                </div>
                <div class="grupo">
                    <label>Empréstimo</label>
                    <select name="emprestimo" id="emprestimo_atualizar">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                    </select>
                </div>
            </div>

            <div class="linha">
                <div class="grupo">
                    <label>Data da Compra</label>
                    <input type="date" name="data_compra" id="data_compra_atualizar">
                </div>
                <div class="grupo">
                    <label>Valor da Compra</label>
                    <input type="number" step="0.01" name="valor_compra" id="valor_compra_atualizar">
                </div>
                <div class="grupo">
                    <label>Local da Compra</label>
                    <input type="text" name="local_compra" id="local_compra_atualizar">
                </div>
            </div>

            <div class="grupo">
                <label>Observações</label>
                <textarea name="observacoes" id="observacoes_atualizar" rows="4"></textarea>
            </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="biblioteca.atualizar_dados()">Atualizar</button>
      </div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js"></script>
