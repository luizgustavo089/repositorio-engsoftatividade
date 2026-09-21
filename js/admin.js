/* =====================================================================
   admin.js — perfil Administrador da Delegacia
   Login restrito, dashboard, gestão de denúncias e cadastro de agentes.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var telaLogin = sel("#tela-login");
  if (!telaLogin) { return; }

  var telaPainel = sel("#tela-painel");
  var formLogin = sel("#form-login");
  var avisoLogin = sel("#aviso-login");
  var avisoPainel = sel("#aviso-painel");

  /* ---------------- Login ---------------- */
  formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var agente = BD.autenticar(sel("#usuario").value.trim(), sel("#senha").value);

    if (!agente) {
      avisoLogin.className = "aviso aviso-erro";
      avisoLogin.textContent = "Usuário ou senha inválidos. Verifique as credenciais de teste.";
      avisoLogin.classList.remove("oculto");
      return;
    }
    abrirPainel(agente);
  });

  sel("#sair").addEventListener("click", function () {
    BD.encerrarSessao();
    telaPainel.classList.add("oculto");
    telaLogin.classList.remove("oculto");
    formLogin.reset();
  });

  function abrirPainel(agente) {
    telaLogin.classList.add("oculto");
    telaPainel.classList.remove("oculto");
    avisoPainel.className = "aviso aviso-ok";
    avisoPainel.textContent = "Bem-vindo, " + agente.nome + "!";
    avisoPainel.classList.remove("oculto");
    sel("#identidade-agente").textContent =
      "Agente logado: " + agente.nome + " | Setor: " + agente.setor;

    // Cadastro de agentes é exclusivo do Administrador Geral
    var abaAgentes = sel('[data-aba="agentes"]');
    if (agente.permissao !== "Administrador Geral") {
      abaAgentes.classList.add("oculto");
    } else {
      abaAgentes.classList.remove("oculto");
    }

    trocarAba("dashboard");
    desenharDashboard();
    desenharDenuncias();
    desenharAgentes();
  }

  /* ---------------- Abas ---------------- */
  todos(".aba").forEach(function (botao) {
    botao.addEventListener("click", function () { trocarAba(botao.dataset.aba); });
  });

  function trocarAba(nome) {
    todos(".aba").forEach(function (b) { b.classList.toggle("ativa", b.dataset.aba === nome); });
    todos(".secao-aba").forEach(function (s) { s.classList.toggle("oculto", s.id !== "aba-" + nome); });
  }

  /* ---------------- Dashboard ---------------- */
  function desenharDashboard() {
    var r = BD.resumo();
    sel("#total-geral").textContent = r.total;
    sel("#total-recebida").textContent = r.porStatus["Recebida"];
    sel("#total-analise").textContent = r.porStatus["Em análise"];
    sel("#total-investigacao").textContent = r.porStatus["Em investigação"];
    sel("#total-concluida").textContent = r.porStatus["Concluída"];
    sel("#total-arquivada").textContent = r.porStatus["Arquivada"];

    var classes = { "Baixa": "", "Média": "b-media", "Alta": "b-alta", "Emergencial": "b-emergencial" };
    sel("#grafico-urgencia").innerHTML = BD.URGENCIAS.map(function (nivel) {
      var qtd = r.porUrgencia[nivel] || 0;
      var pct = r.total ? Math.round((qtd / r.total) * 100) : 0;
      return '<div class="barra-item">' +
        '<div class="barra-topo"><span>' + nivel + "</span><span>" + qtd + " (" + pct + "%)</span></div>" +
        '<div class="barra ' + classes[nivel] + '"><span style="width:' + pct + '%"></span></div>' +
      "</div>";
    }).join("");

    var categorias = Object.keys(r.porCategoria).sort(function (a, b) {
      return r.porCategoria[b] - r.porCategoria[a];
    }).slice(0, 5);

    sel("#grafico-categorias").innerHTML = categorias.length
      ? categorias.map(function (nome) {
          var qtd = r.porCategoria[nome];
          var pct = r.total ? Math.round((qtd / r.total) * 100) : 0;
          return '<div class="barra-item">' +
            '<div class="barra-topo"><span>' + escapar(nome) + "</span><span>" + qtd + " (" + pct + "%)</span></div>" +
            '<div class="barra"><span style="width:' + pct + '%"></span></div>' +
          "</div>";
        }).join("")
      : '<p class="vazio">Nenhuma denúncia registrada até o momento.</p>';
  }

  /* ---------------- Lista de denúncias ---------------- */
  var filtroTexto = sel("#filtro-texto");
  var filtroCategoria = sel("#filtro-categoria");
  var filtroStatus = sel("#filtro-status");
  var filtroUrgencia = sel("#filtro-urgencia");

  Object.keys(BD.CATEGORIAS).forEach(function (nome) {
    filtroCategoria.insertAdjacentHTML("beforeend", '<option>' + escapar(nome) + "</option>");
  });
  BD.STATUS.forEach(function (s) { filtroStatus.insertAdjacentHTML("beforeend", "<option>" + s + "</option>"); });
  BD.URGENCIAS.forEach(function (u) { filtroUrgencia.insertAdjacentHTML("beforeend", "<option>" + u + "</option>"); });

  [filtroTexto, filtroCategoria, filtroStatus, filtroUrgencia].forEach(function (campo) {
    campo.addEventListener("input", desenharDenuncias);
    campo.addEventListener("change", desenharDenuncias);
  });

  sel("#limpar-filtros").addEventListener("click", function () {
    filtroTexto.value = "";
    filtroCategoria.value = "";
    filtroStatus.value = "";
    filtroUrgencia.value = "";
    desenharDenuncias();
  });

  function desenharDenuncias() {
    var termo = filtroTexto.value.trim().toLowerCase();
    var lista = BD.listarDenuncias().filter(function (d) {
      if (termo && d.protocolo.toLowerCase().indexOf(termo) === -1 &&
          d.local.toLowerCase().indexOf(termo) === -1) { return false; }
      if (filtroCategoria.value && d.categoria !== filtroCategoria.value) { return false; }
      if (filtroStatus.value && d.status !== filtroStatus.value) { return false; }
      if (filtroUrgencia.value && d.urgencia !== filtroUrgencia.value) { return false; }
      return true;
    });

    sel("#contador-denuncias").textContent = lista.length + " denúncia(s) encontrada(s)";

    var corpo = sel("#corpo-denuncias");
    if (!lista.length) {
      corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma denúncia corresponde aos filtros aplicados.</td></tr>';
      return;
    }

    corpo.innerHTML = lista.map(function (d) {
      return "<tr>" +
        "<td><strong>" + escapar(d.protocolo) + "</strong></td>" +
        "<td>" + BD.formatarData(d.criadaEm) + "</td>" +
        "<td>" + escapar(d.categoria) + "</td>" +
        '<td><span class="etiqueta ' + BD.classeUrgencia(d.urgencia) + '">' + escapar(d.urgencia) + "</span></td>" +
        '<td><span class="etiqueta ' + BD.classeStatus(d.status) + '">' + escapar(d.status) + "</span></td>" +
        '<td><button class="botao botao-escuro pequeno" data-gerenciar="' + escapar(d.protocolo) + '">Gerenciar</button></td>' +
      "</tr>";
    }).join("");

    todos("[data-gerenciar]").forEach(function (botao) {
      botao.addEventListener("click", function () { abrirModal(botao.dataset.gerenciar); });
    });
  }

  /* ---------------- Modal de gestão ---------------- */
  var modal = sel("#modal");
  var conteudoModal = sel("#conteudo-modal");

  function abrirModal(protocolo) {
    var d = BD.listarDenuncias().filter(function (x) { return x.protocolo === protocolo; })[0];
    if (!d) { return; }

    conteudoModal.innerHTML =
      '<div class="modal-topo">' +
        "<div><h2>" + escapar(d.protocolo) + "</h2>" +
        '<p class="pequeno texto-suave">Registrada em ' + BD.formatarData(d.criadaEm) + "</p></div>" +
        '<button class="fechar" id="fechar-modal" aria-label="Fechar">&times;</button>' +
      "</div>" +
      '<div class="grade-2">' +
        "<p><strong>Categoria:</strong> " + escapar(d.categoria) + " / " + escapar(d.subcategoria) + "</p>" +
        "<p><strong>Urgência:</strong> " + escapar(d.urgencia) + "</p>" +
        "<p><strong>Data do fato:</strong> " + escapar(d.dataOcorrencia) + " às " + escapar(d.horario) + "</p>" +
        "<p><strong>Anexos:</strong> " + (d.anexos.length ? escapar(d.anexos.join(", ")) : "nenhum") + "</p>" +
      "</div>" +
      "<p><strong>Local:</strong> " + escapar(d.local) + "</p>" +
      "<p><strong>Relato:</strong> " + escapar(d.descricao) + "</p>" +
      "<p><strong>Envolvidos:</strong> " + escapar(d.envolvidos) + "</p>" +
      "<h3>Atualizar tramitação</h3>" +
      '<div class="linha-campos-2">' +
        '<div class="campo"><label for="novo-status">Status</label><select id="novo-status">' +
          BD.STATUS.map(function (s) {
            return "<option" + (s === d.status ? " selected" : "") + ">" + s + "</option>";
          }).join("") +
        "</select></div>" +
        '<div class="campo"><label for="novo-setor">Setor responsável</label>' +
        '<input id="novo-setor" value="' + escapar(d.setor) + '"></div>' +
      "</div>" +
      '<div class="campo"><label for="observacao">Observação para o histórico</label>' +
      '<textarea id="observacao" placeholder="Ex.: Equipe deslocada ao local para verificação."></textarea></div>' +
      '<div class="acoes-form">' +
        '<button class="botao botao-neutro" id="cancelar-modal">Fechar</button>' +
        '<button class="botao botao-azul" id="salvar-modal">Salvar alterações</button>' +
      "</div>" +
      "<h3>Histórico</h3>" +
      '<ul class="historico">' +
        d.historico.map(function (h) {
          return "<li><strong>" + BD.formatarData(h.data) + "</strong><br>" + escapar(h.texto) + "</li>";
        }).join("") +
      "</ul>";

    modal.classList.remove("oculto");

    sel("#fechar-modal").addEventListener("click", fecharModal);
    sel("#cancelar-modal").addEventListener("click", fecharModal);
    sel("#salvar-modal").addEventListener("click", function () {
      BD.atualizarDenuncia(protocolo, sel("#novo-status").value, sel("#novo-setor").value.trim(), sel("#observacao").value.trim());
      fecharModal();
      desenharDenuncias();
      desenharDashboard();
      avisoPainel.className = "aviso aviso-ok";
      avisoPainel.textContent = "Denúncia " + protocolo + " atualizada.";
      avisoPainel.classList.remove("oculto");
    });
  }

  function fecharModal() { modal.classList.add("oculto"); }

  modal.addEventListener("click", function (e) { if (e.target === modal) { fecharModal(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { fecharModal(); } });

  /* ---------------- Agentes ---------------- */
  var formAgente = sel("#form-agente");

  formAgente.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var resposta = BD.cadastrarAdmin({
      nome: sel("#agente-nome").value.trim(),
      login: sel("#agente-login").value.trim(),
      senha: "123456",
      setor: sel("#agente-setor").value.trim() || "Geral",
      permissao: sel("#agente-permissao").value
    });

    avisoPainel.className = resposta.ok ? "aviso aviso-ok" : "aviso aviso-erro";
    avisoPainel.textContent = resposta.ok ? "Agente cadastrado com a senha padrão 123456." : resposta.mensagem;
    avisoPainel.classList.remove("oculto");

    if (resposta.ok) {
      formAgente.reset();
      desenharAgentes();
    }
  });

  function desenharAgentes() {
    var atual = BD.sessao();
    sel("#corpo-agentes").innerHTML = BD.listarAdmins().map(function (a) {
      var podeRemover = a.login !== "admin" && (!atual || a.login !== atual.login);
      return "<tr>" +
        "<td>" + escapar(a.nome) + "</td>" +
        "<td>" + escapar(a.login) + "</td>" +
        "<td>" + escapar(a.setor) + "</td>" +
        '<td><span class="etiqueta ' +
          (a.permissao === "Administrador Geral" ? "st-analise" : "st-recebida") + '">' +
          escapar(a.permissao) + "</span></td>" +
        "<td>" + (podeRemover
          ? '<button class="botao botao-vermelho pequeno" data-remover="' + escapar(a.login) + '">Remover</button>'
          : '<span class="pequeno texto-suave">—</span>') + "</td>" +
      "</tr>";
    }).join("");

    todos("[data-remover]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        if (confirm("Remover o acesso de " + botao.dataset.remover + "?")) {
          BD.removerAdmin(botao.dataset.remover);
          desenharAgentes();
        }
      });
    });
  }

  /* Mantém o agente logado ao recarregar a página */
  var sessaoAtiva = BD.sessao();
  if (sessaoAtiva) { abrirPainel(sessaoAtiva); }
});
