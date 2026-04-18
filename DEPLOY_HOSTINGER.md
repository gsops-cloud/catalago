# 🚀 Deploy na Hostinger (VM com Node.js)

URL do seu site: `https://mediumaquamarine-barracuda-131448.hostingersite.com/`

---

## 📋 Como funciona agora

Um **único servidor Node.js** faz tudo:
- Serve o frontend React (arquivos estáticos)
- Fornece as APIs (`/api/products`, `/api/upload`, etc.)
- Armazena imagens em `uploads/`

---

## ✅ Passos para Deploy

### 1. Compilar o Frontend

No seu computador local (na pasta do projeto):

```bash
npm run build
```

Isso cria uma pasta `dist/` com todos os arquivos compilados.

### 2. Transferir para Hostinger

Usando FileZilla ou outro cliente FTP:

1. Conecta no FTP com suas credenciais:
   - Host: `ftp://62.72.62.191`
   - Usuário: `u876547810.mediumaquamarine-barracuda-131448.hostingersite.com`
   - Porta: 21
   - Senha: `J~RyyPm8tm=*=:3h`

2. Navega até `/public_html`

3. Faz upload dos arquivos do seu projeto:
   ```
   ✅ server.js
   ✅ package.json
   ✅ db.json (ou deixa vazio)
   ✅ dist/ (toda a pasta)
   ✅ uploads/ (pasta para imagens)
   ```

### 3. Configurar Node.js na Hostinger

1. Acessa o painel Hostinger
2. Vai até **Advanced** → **Node.js**
3. Clica **Create Application**
4. Configura:
   - **Application root**: `/public_html`
   - **Application startup file**: `server.js`
   - **Node.js version**: 18+ (ou mais recente disponível)
5. Clica **Create** ou **Deploy**

### 4. Testar

Acessa seu domínio:
```
https://mediumaquamarine-barracuda-131448.hostingersite.com/
```

Você deve ver:
- ✅ A página do catálogo carregando
- ✅ Botão "Administrador" funciona
- ✅ Adicionar produtos com imagem funciona
- ✅ Imagens aparecem em outro navegador/dispositivo

---

## 🔧 Desenvolvimento Local

Para testar tudo funcionando junto antes de fazer deploy:

### Terminal 1: Backend
```bash
npm run backend
```

Deve mostrar:
```
✅ Servidor rodando em http://localhost:4000
```

### Terminal 2: Frontend (desenvolvimento)
```bash
npm run dev
```

Deve mostrar:
```
➜  Local:   http://localhost:5173/
```

Agora acessa `http://localhost:5173` e testa tudo!

---

## 📁 Estrutura de Arquivos na Hostinger

```
/public_html/
├── server.js          ← Backend
├── package.json       ← Dependências
├── db.json            ← Banco de dados (produtos/usuários)
├── dist/              ← Frontend compilado
│   ├── index.html
│   ├── assets/
│   └── ...
└── uploads/           ← Imagens dos produtos
    ├── img-123.jpg
    ├── img-456.png
    └── ...
```

---

## ✨ O que acontece agora

1. **Usuário acessa**: `https://mediumaquamarine-barracuda-131448.hostingersite.com/`
2. **Servidor retorna**: `dist/index.html` (React app)
3. **React carrega** e faz requisições para `/api/products`, `/api/upload`, etc.
4. **Server.js processa** essas requisições
5. **Imagens são salvas** em `uploads/` e servidas em `/uploads/`
6. **Tudo funciona** em qualquer dispositivo!

---

## 🆘 Se der erro na Hostinger

### "Cannot GET /"
- Significa que `dist/` não foi uploadado
- Verifica se a pasta `dist/` está em `/public_html/dist`

### "Erro ao adicionar produto"
- Console (F12) deve mostrar erro exato
- Verifica se `server.js` está ativo

### "Imagens não aparecem"
- Verifica se `/uploads` está em `/public_html/uploads`
- Verifica se tem permissão de escrita (755)

### "Node.js não está rodando"
- Volta ao painel → Advanced → Node.js
- Verifica se aplicação está ativa
- Clica em "Restart" se necessário

---

## 📝 Checklist de Deploy

- [ ] Executou `npm run build` localmente
- [ ] Uploadou `server.js`, `package.json`, `db.json`
- [ ] Uploadou pasta `dist/` inteira
- [ ] Criou pasta `uploads/` vazia
- [ ] Configurou Node.js na Hostinger
- [ ] Testou acessando seu domínio
- [ ] Testou login admin (admin / 1234)
- [ ] Testou adicionar produto com imagem
- [ ] Testou acessar em outro navegador/dispositivo

---

## 💡 Dicas

- Faz backup do `db.json` periodicamente
- Se mudar os produtos, só refaz deploy de `db.json` (não precisa recompilar)
- Imagens ficam em `uploads/` - faz backup junto
- Não compartilha suas credenciais FTP

---

## 🎯 Pronto!

Seu app está completo e pronto para produção. É um servidor Node.js único que:
- Serve React
- Fornece APIs
- Armazena imagens
- Tudo no mesmo lugar!

Qualquer dúvida, verifica os logs da Hostinger ou console do navegador (F12).
