/* =====================================================================
   consulta.js — perfil Usuário/Denunciante
   Consulta o andamento da denúncia pelo protocolo + chave de acesso.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var form = sel("#form-consulta");
  if (!form) { return; }

  var aviso = sel("#aviso-consulta");
  var resultado = sel("#resultado");

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aviso.classList.add("oculto");
    resultado.classList.add("oculto");

    var protocolo = sel("#protocolo").value.trim();
    var chave = sel("#chave").value.trim();

    if (!protocolo || !chave) {
      aviso.className = "aviso aviso-erro";
      aviso.textContent = "Informe o protocolo e a chave de acesso recebidos no envio.";
      aviso.classList.remove("oculto");
      return;
    }

    var denuncia = BD.buscarPorProtocolo(protocolo, chave);

    if (!denuncia) {
      aviso.className = "aviso aviso-erro";
      aviso.textContent = "Nenhuma denúncia encontrada com esse protocolo e chave. Confira os códigos e tente de novo.";
      aviso.classList.remove("oculto");
      return;
    }

    resultado.innerHTML =
      '<div class="modal-topo">' +
        "<div><h2>" + escapar(denuncia.protocolo) + "</h2>" +
        '<p class="pequeno texto-suave">Registrada em ' + BD.formatarData(denuncia.criadaEm) + "</p></div>" +
        '<span class="etiqueta ' + BD.classeStatus(denuncia.status) + '">' + escapar(denuncia.status) + "</span>" +
      "</div>" +
      '<div class="grade-2">' +
        "<p><strong>Categoria:</strong> " + escapar(denuncia.categoria) + " / " + escapar(denuncia.subcategoria) + "</p>" +
        "<p><strong>Urgência:</strong> " + escapar(denuncia.urgencia) + "</p>" +
        "<p><strong>Data do fato:</strong> " + escapar(denuncia.dataOcorrencia) + " às " + escapar(denuncia.horario) + "</p>" +
        "<p><strong>Setor responsável:</strong> " + escapar(denuncia.setor) + "</p>" +
      "</div>" +
      "<p><strong>Local:</strong> " + escapar(denuncia.local) + "</p>" +
      "<p><strong>Relato:</strong> " + escapar(denuncia.descricao) + "</p>" +
      "<h3>Andamento</h3>" +
      '<ul class="historico">' +
        denuncia.historico.map(function (h) {
          return "<li><strong>" + BD.formatarData(h.data) + "</strong><br>" + escapar(h.texto) + "</li>";
        }).join("") +
      "</ul>";

    resultado.classList.remove("oculto");
  });
});
