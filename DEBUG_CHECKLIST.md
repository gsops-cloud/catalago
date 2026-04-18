# 🔧 Checklist - Falha ao Adicionar Produto

Se você está recebendo **"Falha ao adicionar produto"**, siga este checklist:

---

## 1️⃣ Backend está rodando?

Abra um terminal e execute:
```bash
npm run backend
```

Ou:
```bash
node server.js
```

Você deve ver:
```
Backend rodando em http://localhost:4000
```

Se **NÃO** aparecer, o backend não está rodando. Isso é o problema!

---

## 2️⃣ Frontend está rodando?

Em outro terminal:
```bash
npm run dev
```

Você deve ver:
```
  ➜  Local:   http://localhost:5173/
```

---

## 3️⃣ Verificar logs do console

1. Abra o navegador em `http://localhost:5173`
2. Pressiona **F12** para abrir Developer Tools
3. Vá para **Console**
4. Tenta adicionar um produto
5. Você deve ver mensagens como:
   - `Iniciando upload da imagem...`
   - `Upload concluído: {...}`
   - `Criando produto: {...}`

Se ver **erro de conexão**, significa o backend não está acessível.

---

## 4️⃣ Testar backend direto

Abra uma nova aba do navegador e acessa:
```
http://localhost:4000/api/ping
```

Você deve ver:
```json
{"status":"ok"}
```

Se der erro, o backend **não está respondendo**.

---

## 5️⃣ Verificar porta 4000

A porta 4000 pode estar em uso por outro programa. Tenta:

### Windows (PowerShell):
```powershell
Get-NetTCPConnection -LocalPort 4000
```

Se houver resultado, outra aplicação está usando a porta 4000.

### Linux/Mac:
```bash
lsof -i :4000
```

---

## 6️⃣ Mudar porta do backend

Se a porta 4000 está em uso, muda para outra:

```bash
PORT=5000 npm run backend
```

Depois ajusta `vite.config.js`:
```javascript
proxy: {
  "/api": "http://localhost:5000",  // Muda aqui
  "/uploads": "http://localhost:5000",
},
```

---

## ✅ Solução Rápida

Se tudo falha, tenta isso:

1. Fecha **todos** os terminais
2. Abre um terminal novo
3. `npm run backend` (espera aparecer "rodando em...")
4. Abre outro terminal novo
5. `npm run dev` (espera aparecer "localhost:5173")
6. Tenta adicionar produto de novo

---

## 📝 Exemplos de Erro

### ❌ "ERR_CONNECTION_REFUSED"
- Backend não está rodando
- Solução: Execute `npm run backend`

### ❌ "TypeError: Cannot read properties of undefined"
- Backend respondeu mas com erro
- Verifique os logs do backend no terminal

### ❌ "CORS error"
- Raro, mas verifica se `cors` está importado em `server.js`

---

## 🆘 Ainda não funciona?

1. Verifica os logs **exatos** do console (F12)
2. Copia a **mensagem de erro completa**
3. Verifica se ambos backend e frontend estão rodando
4. Reinicia tudo do zero (fecha tudo, abre novos terminais)

Qualquer dúvida, me mostra a mensagem de erro **exata** do console!
