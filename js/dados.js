/* =====================================================================
   dados.js — camada de dados do protótipo
   Guarda denúncias e administradores no localStorage do navegador,
   simulando o banco de dados do sistema.
   Usado por: denuncia.js, consulta.js e admin.js
   ===================================================================== */

var BD = (function () {
  "use strict";

  var CHAVE_DENUNCIAS = "sda_denuncias";
  var CHAVE_ADMINS = "sda_admins";
  var CHAVE_SESSAO = "sda_sessao";

  /* ---- Tabelas fixas do sistema ---- */
  var CATEGORIAS = {
    "Corrupção": ["Desvio de verba", "Propina", "Fraude em licitação", "Nepotismo"],
    "Tráfico de drogas": ["Ponto de venda", "Transporte", "Aliciamento de menores"],
    "Violência doméstica": ["Agressão física", "Ameaça", "Violência psicológica"],
    "Meio ambiente": ["Desmatamento", "Descarte irregular", "Poluição de rios", "Maus-tratos a animais"],
    "Crimes cibernéticos": ["Golpe financeiro", "Invasão de contas", "Fraude em compras"],
    "Perturbação da ordem": ["Som alto", "Vandalismo", "Aglomeração irregular"],
    "Outros": ["Não especificado"]
  };

  var STATUS = ["Recebida", "Em análise", "Em investigação", "Concluída", "Arquivada"];
  var URGENCIAS = ["Baixa", "Média", "Alta", "Emergencial"];

  /* ---- Leitura e gravação ---- */
  function ler(chave, padrao) {
    try {
      var bruto = localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) {
      return padrao;
    }
  }

  function gravar(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  /* ---- Códigos ---- */
  function gerarProtocolo() {
    var n = Math.floor(100000 + Math.random() * 900000);
    return "DEN-" + n;
  }

  function gerarChaveAcesso() {
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var codigo = "";
    for (var i = 0; i < 6; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    return codigo;
  }

  /* ---- Denúncias ---- */
  function listarDenuncias() {
    return ler(CHAVE_DENUNCIAS, []);
  }

  function salvarDenuncia(dados) {
    var lista = listarDenuncias();
    var registro = {
      protocolo: gerarProtocolo(),
      chaveAcesso: gerarChaveAcesso(),
      criadaEm: new Date().toISOString(),
      status: "Recebida",
      categoria: dados.categoria,
      subcategoria: dados.subcategoria || "-",
      dataOcorrencia: dados.dataOcorrencia,
      horario: dados.horario || "-",
      urgencia: dados.urgencia,
      local: dados.local,
      descricao: dados.descricao,
      envolvidos: dados.envolvidos || "-",
      complementares: dados.complementares || "-",
      anexos: dados.anexos || [],
      setor: "Triagem",
      historico: [{
        data: new Date().toISOString(),
        texto: "Denúncia registrada pelo canal anônimo e encaminhada à triagem."
      }]
    };
    lista.unshift(registro);
    gravar(CHAVE_DENUNCIAS, lista);
    return registro;
  }

  function buscarPorProtocolo(protocolo, chaveAcesso) {
    var lista = listarDenuncias();
    for (var i = 0; i < lista.length; i++) {
      var d = lista[i];
      if (d.protocolo.toUpperCase() === String(protocolo).trim().toUpperCase() &&
          d.chaveAcesso.toUpperCase() === String(chaveAcesso).trim().toUpperCase()) {
        return d;
      }
    }
    return null;
  }

  function atualizarDenuncia(protocolo, novoStatus, setor, observacao) {
    var lista = listarDenuncias();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].protocolo === protocolo) {
        if (novoStatus && novoStatus !== lista[i].status) {
          lista[i].historico.push({
            data: new Date().toISOString(),
            texto: "Status alterado para " + novoStatus + "."
          });
          lista[i].status = novoStatus;
        }
        if (setor) { lista[i].setor = setor; }
        if (observacao) {
          lista[i].historico.push({
            data: new Date().toISOString(),
            texto: observacao
          });
        }
        gravar(CHAVE_DENUNCIAS, lista);
        return lista[i];
      }
    }
    return null;
  }

  function resumo() {
    var lista = listarDenuncias();
    var r = { total: lista.length, porStatus: {}, porUrgencia: {}, porCategoria: {} };
    STATUS.forEach(function (s) { r.porStatus[s] = 0; });
    URGENCIAS.forEach(function (u) { r.porUrgencia[u] = 0; });
    lista.forEach(function (d) {
      r.porStatus[d.status] = (r.porStatus[d.status] || 0) + 1;
      r.porUrgencia[d.urgencia] = (r.porUrgencia[d.urgencia] || 0) + 1;
      r.porCategoria[d.categoria] = (r.porCategoria[d.categoria] || 0) + 1;
    });
    return r;
  }

  /* ---- Administradores ---- */
  function listarAdmins() {
    return ler(CHAVE_ADMINS, []);
  }

  function cadastrarAdmin(admin) {
    var lista = listarAdmins();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].login.toLowerCase() === admin.login.toLowerCase()) {
        return { ok: false, mensagem: "Este login já está cadastrado." };
      }
    }
    lista.push(admin);
    gravar(CHAVE_ADMINS, lista);
    return { ok: true, mensagem: "Agente cadastrado." };
  }

  function removerAdmin(login) {
    var lista = listarAdmins().filter(function (a) { return a.login !== login; });
    gravar(CHAVE_ADMINS, lista);
  }

  /* ---- Sessão ---- */
  function autenticar(login, senha) {
    var lista = listarAdmins();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].login === login && lista[i].senha === senha) {
        sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(lista[i]));
        return lista[i];
      }
    }
    return null;
  }

  function sessao() {
    try {
      var bruto = sessionStorage.getItem(CHAVE_SESSAO);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  }

  function encerrarSessao() {
    sessionStorage.removeItem(CHAVE_SESSAO);
  }

  /* ---- Carga inicial de exemplo (roda uma única vez) ---- */
  function iniciar() {
    if (!localStorage.getItem(CHAVE_ADMINS)) {
      gravar(CHAVE_ADMINS, [
        { nome: "Administrador Central", login: "admin", senha: "123456", setor: "Geral / Triagem", permissao: "Administrador Geral" },
        { nome: "Agente Carlos Eduardo", login: "carlos.agente", senha: "123456", setor: "Crimes Ambientais", permissao: "Agente Analista" }
      ]);
    }
    if (!localStorage.getItem(CHAVE_DENUNCIAS)) {
      gravar(CHAVE_DENUNCIAS, [
        {
          protocolo: "DEN-849201", chaveAcesso: "A1B2C3", criadaEm: "2026-02-15T09:20:00",
          status: "Em investigação", categoria: "Corrupção", subcategoria: "Fraude em licitação",
          dataOcorrencia: "2026-02-10", horario: "14:30", urgencia: "Alta",
          local: "Av. Central, nº 100 — Setor de Compras",
          descricao: "Suspeita de direcionamento de licitação para fornecedor específico.",
          envolvidos: "Dois servidores do setor de compras.", complementares: "-",
          anexos: ["edital.pdf"], setor: "Delegacia de Crimes Contra a Administração",
          historico: [
            { data: "2026-02-15T09:20:00", texto: "Denúncia registrada pelo canal anônimo e encaminhada à triagem." },
            { data: "2026-02-16T10:05:00", texto: "Status alterado para Em investigação." }
          ]
        },
        {
          protocolo: "DEN-302918", chaveAcesso: "X9Y8Z7", criadaEm: "2026-02-28T20:05:00",
          status: "Recebida", categoria: "Meio ambiente", subcategoria: "Descarte irregular",
          dataOcorrencia: "2026-02-27", horario: "22:00", urgencia: "Média",
          local: "Estrada do Rio Claro, km 8",
          descricao: "Caminhão descarregando resíduos às margens do córrego durante a madrugada.",
          envolvidos: "Caminhão branco, placa parcialmente visível.", complementares: "-",
          anexos: [], setor: "Triagem",
          historico: [
            { data: "2026-02-28T20:05:00", texto: "Denúncia registrada pelo canal anônimo e encaminhada à triagem." }
          ]
        }
      ]);
    }
  }

  /* ---- Utilitários de formatação ---- */
  function formatarData(iso) {
    if (!iso) { return "-"; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return iso; }
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function classeStatus(status) {
    var mapa = {
      "Recebida": "st-recebida", "Em análise": "st-analise",
      "Em investigação": "st-investigacao", "Concluída": "st-concluida",
      "Arquivada": "st-arquivada"
    };
    return mapa[status] || "st-recebida";
  }

  function classeUrgencia(urgencia) {
    var mapa = {
      "Baixa": "ur-baixa", "Média": "ur-media",
      "Alta": "ur-alta", "Emergencial": "ur-emergencial"
    };
    return mapa[urgencia] || "ur-media";
  }

  iniciar();

  return {
    CATEGORIAS: CATEGORIAS, STATUS: STATUS, URGENCIAS: URGENCIAS,
    listarDenuncias: listarDenuncias, salvarDenuncia: salvarDenuncia,
    buscarPorProtocolo: buscarPorProtocolo, atualizarDenuncia: atualizarDenuncia,
    resumo: resumo,
    listarAdmins: listarAdmins, cadastrarAdmin: cadastrarAdmin, removerAdmin: removerAdmin,
    autenticar: autenticar, sessao: sessao, encerrarSessao: encerrarSessao,
    formatarData: formatarData, classeStatus: classeStatus, classeUrgencia: classeUrgencia
  };
})();
