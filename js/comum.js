/* =====================================================================
   comum.js — comportamentos usados em todas as páginas
   (menu responsivo, ano do rodapé e atalhos curtos de seleção)
   ===================================================================== */

function sel(seletor) { return document.querySelector(seletor); }
function todos(seletor) { return Array.prototype.slice.call(document.querySelectorAll(seletor)); }

function escapar(texto) {
  return String(texto === undefined || texto === null ? "" : texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", function () {
  var botao = sel(".abre-menu");
  var menu = sel(".menu");

  if (botao && menu) {
    botao.addEventListener("click", function () {
      menu.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", menu.classList.contains("aberto"));
    });
  }

  var ano = sel("#ano");
  if (ano) { ano.textContent = new Date().getFullYear(); }
});
