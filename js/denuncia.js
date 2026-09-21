/* =====================================================================
   denuncia.js — perfil Usuário/Denunciante
   Controla o formulário de registro: categorias dependentes, validação,
   anexos e geração do protocolo + chave de acesso.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var form = sel("#form-denuncia");
  if (!form) { return; }

  var categoria = sel("#categoria");
  var subcategoria = sel("#subcategoria");
  var urgencia = sel("#urgencia");
  var entradaArquivo = sel("#arquivos");
  var listaArquivos = sel("#lista-arquivos");
  var aviso = sel("#aviso-form");
  var blocoFormulario = sel("#bloco-formulario");
  var blocoSucesso = sel("#bloco-sucesso");

  /* Preenche as listas a partir da camada de dados */
  Object.keys(BD.CATEGORIAS).forEach(function (nome) {
    categoria.insertAdjacentHTML("beforeend", '<option value="' + escapar(nome) + '">' + escapar(nome) + "</option>");
  });

  BD.URGENCIAS.forEach(function (nivel) {
    var selecionado = nivel === "Média" ? " selected" : "";
    urgencia.insertAdjacentHTML("beforeend", '<option value="' + nivel + '"' + selecionado + ">" + nivel + "</option>");
  });

  /* Subcategoria depende da categoria escolhida */
  categoria.addEventListener("change", function () {
    subcategoria.innerHTML = '<option value="">Selecione uma subcategoria...</option>';
    var itens = BD.CATEGORIAS[categoria.value] || [];
    itens.forEach(function (item) {
      subcategoria.insertAdjacentHTML("beforeend", '<option value="' + escapar(item) + '">' + escapar(item) + "</option>");
    });
    subcategoria.disabled = itens.length === 0;
  });

  /* Anexos: guardamos apenas o nome dos arquivos (protótipo, sem servidor) */
  var anexos = [];

  entradaArquivo.addEventListener("change", function () {
    anexos = Array.prototype.map.call(entradaArquivo.files, function (f) { return f.name; });
    listaArquivos.innerHTML = anexos.map(function (nome) {
      return "<li>" + escapar(nome) + "</li>";
    }).join("");
  });

  /* Limite de data: não aceita ocorrência no futuro */
  var campoData = sel("#data-ocorrencia");
  campoData.max = new Date().toISOString().slice(0, 10);

  function mostrarErro(mensagem, campo) {
    aviso.className = "aviso aviso-erro";
    aviso.textContent = mensagem;
    aviso.classList.remove("oculto");
    if (campo) { campo.focus(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aviso.classList.add("oculto");

    var descricao = sel("#descricao").value.trim();
    var local = sel("#local").value.trim();

    if (!categoria.value) { return mostrarErro("Escolha a categoria da denúncia.", categoria); }
    if (!campoData.value) { return mostrarErro("Informe a data da ocorrência.", campoData); }
    if (local.length < 5) { return mostrarErro("Descreva o local do fato com mais detalhes.", sel("#local")); }
    if (descricao.length < 30) {
      return mostrarErro("A descrição precisa ter ao menos 30 caracteres para permitir a apuração.", sel("#descricao"));
    }

    var registro = BD.salvarDenuncia({
      categoria: categoria.value,
      subcategoria: subcategoria.value,
      dataOcorrencia: campoData.value,
      horario: sel("#horario").value,
      urgencia: urgencia.value,
      local: local,
      descricao: descricao,
      envolvidos: sel("#envolvidos").value.trim(),
      complementares: sel("#complementares").value.trim(),
      anexos: anexos
    });

    sel("#protocolo-gerado").textContent = registro.protocolo;
    sel("#chave-gerada").textContent = registro.chaveAcesso;
    blocoFormulario.classList.add("oculto");
    blocoSucesso.classList.remove("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Copiar os códigos para a área de transferência */
  var botaoCopiar = sel("#copiar-codigos");
  if (botaoCopiar) {
    botaoCopiar.addEventListener("click", function () {
      var texto = "Protocolo: " + sel("#protocolo-gerado").textContent +
                  " | Chave de acesso: " + sel("#chave-gerada").textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function () {
          botaoCopiar.textContent = "Códigos copiados";
        });
      }
    });
  }

  sel("#cancelar").addEventListener("click", function () {
    if (confirm("Os dados preenchidos serão descartados. Deseja continuar?")) {
      window.location.href = "index.html";
    }
  });
});
