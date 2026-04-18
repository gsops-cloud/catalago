# 📦 Catálogo de Produtos

App React com administrador para gerenciar catálogo, preços, imagens e carrinho de compras.

**Status**: ✅ Pronto para produção na Hostinger

---

## ⚡ Quick Start (Local)

### 1. Instalar dependências
```bash
npm install
```

### 2. Terminal 1 - Backend
```bash
npm run backend
```

### 3. Terminal 2 - Frontend
```bash
npm run dev
```

Acessa: `http://localhost:5173`

---

## 🚀 Deploy na Hostinger

Veja: [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)

**Resumo rápido:**
1. `npm run build` (cria `dist/`)
2. Upload para `/public_html` via FTP
3. Configura Node.js na Hostinger
4. Pronto!

---

## 👨‍💼 Admin Panel

- **Usuário**: `admin`
- **Senha**: `1234`

### Recursos
- ✏️ Editar preços
- 🖼️ Upload de imagens
- ➕ Adicionar produtos
- 💰 Configurar descontos por quantidade

---

## 📁 Estrutura do Projeto

```
catalago/
├── src/                     # Código React
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── Cart.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── services/
│   │   └── api.js           # Chamadas para backend
│   └── data/
│       └── products.js
├── server.js                # Backend Node.js
├── db.json                  # Banco de dados
├── uploads/                 # Imagens (criado automaticamente)
├── dist/                    # Build de produção (npm run build)
├── package.json
└── vite.config.js
```

---

## 🔌 API

### Produtos
- `GET /api/products` - lista todos
- `POST /api/products` - cria novo
- `PUT /api/products/:id` - atualiza
- `POST /api/upload` - faz upload de imagem

### Autenticação
- `POST /api/login` - faz login
- `GET /api/users` - lista usuários

---

## 🏗️ Como Funciona

### Localmente (desenvolvimento)
1. Frontend em `http://localhost:5173` (Vite dev server)
2. Backend em `http://localhost:4000` (Node.js)
3. Vite proxy: `/api` → `http://localhost:4000`

### Em Produção (Hostinger)
1. **Um único servidor Node.js** (`server.js`)
2. Serve `/` com arquivos estáticos de `dist/`
3. Fornece `/api/*` - backend
4. Armazena imagens em `/uploads/`

---

## 🖼️ Imagens

- Upload: base64 → servidor → arquivo em `/uploads/`
- Acesso: `/uploads/img-timestamp-random.jpg`
- Compartilhado: todos os dispositivos veem as mesmas imagens

---

## 📝 Scripts

```bash
npm run dev          # Dev local (Vite + React)
npm run backend      # Backend local (Node.js)
npm run build        # Build para produção
npm run preview      # Preview do build
```

---

## 🔒 Segurança

- Credenciais FTP em `.env` (não versionado)
- Senhas simples (admin/1234) - idealmente mudar em produção
- CORS habilitado - restrinja em produção se necessário

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Erro ao adicionar produto" | Verifica se backend está rodando |
| "Imagens não aparecem" | Verifica se `/uploads` tem permissão 755 |
| "Servidor retorna HTML" | Frontend não foi compilado - execute `npm run build` |
| "Port 4000 em uso" | Muda `PORT=5000 npm run backend` |

---

## 📖 Documentação Completa

- [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md) - Deploy passo a passo
- [FTP_UPLOAD_GUIDE.md](./FTP_UPLOAD_GUIDE.md) - Como usar FileZilla
- [DEBUG_CHECKLIST.md](./DEBUG_CHECKLIST.md) - Diagnosticar problemas
- [ERROR_DOCTYPE.md](./ERROR_DOCTYPE.md) - Erros de JSON

---

## ✨ Features

✅ Admin com autenticação  
✅ CRUD de produtos  
✅ Upload de imagens  
✅ Carrinho de compras  
✅ Descontos por quantidade  
✅ Compartilhado entre dispositivos  
✅ Pronto para Hostinger  

---

## 📞 Suporte

Verifique os arquivos de documentação listados acima. Qualquer dúvida específica, abra console (F12) e veja mensagens de erro exatas.
