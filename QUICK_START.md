# 🎯 Quick Start - Teste Local Agora

Siga estes passos para testar tudo funcionando localmente em 2 minutos.

---

## 1️⃣ Abrir Terminais

Abra **2 terminais** na pasta do projeto.

---

## 2️⃣ Terminal 1 - Backend

```bash
npm run backend
```

Espere ver:
```
✅ Servidor rodando em http://localhost:4000
📁 Frontend: ...dist/index.html
📸 Uploads: ...uploads
📦 DB: ...db.json
```

**✅ Deixa rodando!**

---

## 3️⃣ Terminal 2 - Frontend

```bash
npm run dev
```

Espere ver:
```
➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 4️⃣ Abrir no Navegador

Clica neste link ou copia na barra:
```
http://localhost:5173
```

Você deve ver a página do catálogo! ✨

---

## 5️⃣ Testar Admin

1. Clica em **"Administrador"** (canto superior direito)
2. Digite:
   - Usuário: `admin`
   - Senha: `1234`
3. Clica **"Entrar"**

Você deve ver o painel do admin com:
- Lista de produtos
- Formulário de desconto
- Formulário de novo produto

---

## 6️⃣ Testar Upload de Imagem

1. No painel admin, vá até **"Adicionar novo produto"**
2. Preencha:
   - Nome: `Seu Produto Teste`
   - Preço: `99.99`
   - Foto: Seleciona uma imagem do seu computador
3. Clica **"Adicionar produto"**

Se aparecer uma mensagem verde = ✅ sucesso!

---

## 7️⃣ Testar em Outro Navegador

1. Abre outra aba ou outro navegador
2. Vai para `http://localhost:5173`
3. **Você deve ver o produto novo que criou!**

Isso significa que o backend está compartilhando os dados corretamente.

---

## ✅ Checklist

- [ ] Terminal 1: Backend rodando (message "Servidor rodando...")
- [ ] Terminal 2: Frontend rodando (message "localhost:5173")
- [ ] Página carrega em `http://localhost:5173`
- [ ] Conseguiu fazer login (admin / 1234)
- [ ] Conseguiu adicionar um produto com imagem
- [ ] Produto aparece em outro navegador/aba

---

## 🎉 Se tudo passou

Parabéns! Seu app está funcionando perfeitamente.

**Próximo passo**: [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)

---

## ❌ Se algo deu erro

1. Verifica os terminais - algum erro está escrito lá?
2. Abre console no navegador (F12)
3. Vê a mensagem de erro exata
4. Consulta [DEBUG_CHECKLIST.md](./DEBUG_CHECKLIST.md)

---

## 🔥 Troubleshooting Rápido

### "Cannot GET /" no navegador
- Verifica se Terminal 2 está rodando
- Tenta `npm run dev` de novo

### "Falha ao adicionar produto"
- Verifica se Terminal 1 está rodando
- Abre console (F12) e vê erro exato

### "Port 4000 já está em uso"
```bash
PORT=5000 npm run backend
```

Depois muda `vite.config.js`:
```javascript
proxy: {
  "/api": "http://localhost:5000",
}
```

---

Está pronto? Vamos! 🚀
