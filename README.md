# 📦 Catálogo de Produtos

App React com administrador para gerenciar catálogo, preços, imagens e carrinho de compras.

---

## ⚡ Rodar Localmente

### 1. Backend (Node.js)
```bash
npm run backend
```
Vai rodari em `http://localhost:4000`

### 2. Frontend (React + Vite)
Em outro terminal:
```bash
npm run dev
```
Vai rodar em `http://localhost:5173`

---

## 👨‍💼 Admin Panel

- **Usuário**: `admin`
- **Senha**: `1234`

### O que você pode fazer:
- Editar preços de produtos
- Fazer upload de novas imagens
- Adicionar novos produtos
- Configurar descontos por quantidade

---

## 🖼️ Armazenamento de Imagens

As imagens são salvas em `uploads/` e compartilhadas entre dispositivos via backend.

### Para usar na Hostinger:

1. **Publicar o frontend**: Faz build e upload para `/public_html`
2. **Publicar o backend**: Usa Node.js da Hostinger (ou roda local)
3. **Fazer upload das imagens**: Usa FTP para `public_html/uploads`

👉 **Veja**: [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)

👉 **Veja**: [FTP_UPLOAD_GUIDE.md](./FTP_UPLOAD_GUIDE.md)

---

## 📁 Estrutura do Projeto

```
catalago/
├── src/
│   ├── App.jsx              # App principal com admin
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── Cart.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── services/
│   │   └── api.js           # Chamadas HTTP para o backend
│   └── data/
│       └── products.js      # Produtos iniciais
├── server.js                # Backend Node/Express
├── db.json                  # Banco de dados (produtos e usuários)
├── uploads/                 # Pasta de imagens (criada automaticamente)
├── package.json
└── vite.config.js
```

---

## 🔌 API Backend

### Produtos
- `GET /api/products` - lista todos
- `POST /api/products` - cria novo
- `PUT /api/products/:id` - atualiza
- `POST /api/upload` - faz upload de imagem

### Autenticação
- `POST /api/login` - faz login
- `GET /api/users` - lista usuários

---

## 🚀 Build para Produção

```bash
npm run build
```

Gera a pasta `dist/` para fazer upload à Hostinger.

---

## 📝 Configuração (.env)

Copia `.env.example` para `.env` e ajusta se necessário:

```env
PUBLIC_URL=https://seu-dominio.com
FTP_HOST=62.72.62.191
FTP_USER=seu_usuario_ftp
FTP_PASSWORD=sua_senha_ftp
```

---

## 💡 Dicas

- Produtos são salvos em `db.json` (arquivo de texto)
- Imagens são salvas em `uploads/` (como arquivos)
- Cada dispositivo que acessar a URL verá os mesmos produtos e imagens
- Faz backup do `db.json` periodicamente

---

## ⚠️ Troubleshooting

**"Botão adicionar produto não funciona"**
- Verifica se o backend está rodando (`npm run backend`)
- Verifica console do navegador (F12) para erros

**"Imagens não aparecem em outro dispositivo"**
- Verifica se as imagens foram upadas para `/public_html/uploads` via FTP
- Verifica a URL no console do navegador

**"Erro de conexão ao backend"**
- Backend e frontend devem estar em redes conectadas
- Se local: ambos devem estar rodando
- Se Hostinger: backend deve estar ativo no Node.js da Hostinger

---

## 📞 Suporte

Para dúvidas ou problemas, verifica os guias:
- [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
- [FTP_UPLOAD_GUIDE.md](./FTP_UPLOAD_GUIDE.md)
