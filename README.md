# Sistema Web de Denúncias Anônimas

Protótipo acadêmico de um canal de denúncias anônimas, desenvolvido em **HTML5, CSS3 e JavaScript puro**, com interface responsiva e dois perfis de acesso: **Usuário/Denunciante** e **Administrador da Delegacia**.

Os dados são gravados no `localStorage` do navegador, simulando o banco de dados — por isso o sistema funciona no GitHub Pages sem back-end.

---

## 1. Estrutura e organização dos arquivos

```
sistema-denuncias/
├── index.html          → Tela inicial (apresentação e acessos rápidos)
├── denuncia.html       → Formulário de registro da denúncia
├── consultar.html      → Consulta de andamento por protocolo + chave
├── delegacia.html      → Login restrito + painel administrativo
├── css/
│   └── estilo.css      → Estilo único: tokens, base, layout, componentes,
│                         páginas e regras responsivas
├── js/
│   ├── dados.js        → Camada de dados (localStorage), categorias,
│   │                     status, geração de protocolo/chave, estatísticas
│   ├── comum.js        → Menu responsivo, ano do rodapé, funções auxiliares
│   ├── denuncia.js     → Regras do formulário de denúncia
│   ├── consulta.js     → Regras da consulta pelo denunciante
│   └── admin.js        → Login, dashboard, gestão de denúncias e agentes
└── README.md
```

Separação adotada: **um arquivo CSS** para todo o sistema (evita repetição de estilo entre as páginas) e **um arquivo JS por tela**, todos apoiados no `dados.js`, que centraliza o acesso às informações.

---

## 2. Funcionalidades — perfil Usuário / Denunciante

- Registro de denúncia **sem qualquer dado pessoal** (sem nome, CPF ou e-mail).
- Categorias e **subcategorias dependentes** (a subcategoria só carrega após escolher a categoria).
- Campos de data e horário da ocorrência, com bloqueio de datas futuras.
- Classificação de **nível de urgência** (Baixa, Média, Alta, Emergencial).
- Local do fato, descrição detalhada e pessoas/veículos envolvidos.
- **Anexo de evidências** (PNG, JPG, PDF, MP3) com listagem dos arquivos selecionados.
- Validação antes do envio (categoria, data, local e descrição mínima de 30 caracteres).
- Geração automática de **protocolo (DEN-XXXXXX)** e **chave de acesso** de 6 caracteres, com botão para copiar.
- **Consulta do andamento** com protocolo + chave, exibindo status atual, setor responsável e histórico de tramitação.

## 3. Funcionalidades — perfil Administrador da Delegacia

- **Login restrito** com sessão mantida enquanto a aba estiver aberta (`sessionStorage`).
- **Dashboard** com indicadores por status (total, recebidas, em análise, em investigação, concluídas, arquivadas), gráfico de barras por urgência e ranking das categorias mais denunciadas.
- **Lista de denúncias** com filtros combinados por texto (protocolo/local), categoria, status e urgência, além de contador de resultados.
- **Gestão da denúncia** em janela modal: leitura completa do relato, alteração de status, definição do setor responsável e registro de observação no histórico.
- **Cadastro de agentes** com nome, login, setor e permissão (Administrador Geral ou Agente Analista), com remoção de acessos.
- **Controle de permissão**: a aba de administradores só aparece para o perfil Administrador Geral.

### Credenciais de teste

| Usuário | Senha | Permissão |
|---|---|---|
| `admin` | `123456` | Administrador Geral |
| `carlos.agente` | `123456` | Agente Analista |

Denúncia de exemplo para consulta: protocolo **DEN-849201**, chave **A1B2C3**.

---

## 4. Otimização de recursos

- CSS organizado por variáveis (`:root`), sem frameworks externos e sem requisições a bibliotecas.
- Nenhuma imagem pesada: ícones são caracteres Unicode, o que reduz o carregamento.
- `dados.js` reaproveitado pelas quatro páginas, evitando duplicação de lógica.
- Renderização das tabelas e gráficos feita em uma única escrita no DOM (`innerHTML` montado por `map/join`).
- Anexos guardam apenas o nome do arquivo, sem carregar o conteúdo na memória.
- Layout responsivo em três faixas (desktop, tablet e celular), com menu recolhível e tabelas com rolagem horizontal.
- Acessibilidade: foco visível no teclado, `aria-label` nos controles e respeito a `prefers-reduced-motion`.

---

## 5. Publicação no GitHub Pages

1. Crie um repositório no GitHub (ex.: `sistema-denuncias-anonimas`).
2. Envie todos os arquivos mantendo a estrutura de pastas, com o `index.html` na raiz.
3. No repositório, abra **Settings → Pages**.
4. Em *Source*, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`.
5. Salve e aguarde alguns instantes: o endereço `https://SEU-USUARIO.github.io/sistema-denuncias-anonimas/` ficará disponível.

Pelo terminal:

```bash
git init
git add .
git commit -m "Sistema Web de Denuncias Anonimas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sistema-denuncias-anonimas.git
git push -u origin main
```
