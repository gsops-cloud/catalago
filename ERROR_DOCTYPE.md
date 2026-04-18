# 🚨 Erro: "<!DOCTYPE ... is not valid JSON"

Este erro significa que o frontend enviou uma requisição HTTP, mas recebeu **HTML em vez de JSON**.

Isso acontece quando:
1. ❌ Backend não está rodando
2. ❌ Backend está retornando erro 404/500 (página HTML de erro)
3. ❌ URL está apontando para o lugar errado
4. ❌ CORS está bloqueando a requisição

---

## ✅ Se você está na Hostinger (VM)

### Cenário 1: Frontend e Backend na mesma VM (recomendado)

Se ambos estão rodando no Node.js da Hostinger:

```javascript
// src/services/api.js deve usar URL relativa
const apiBase = ""; // Deixa vazio, usa /api do mesmo servidor
```

Isso faz o frontend requisitar para `/api` em vez de `http://localhost:4000`.

**Configuração no Hostinger:**
1. Node.js App 1: Frontend (react app)
2. Node.js App 2: Backend (server.js) na porta 4000

Mas se estão na **mesma aplicação Node.js**, não precisa de proxy.

---

### Cenário 2: Backend rodando local, frontend na Hostinger

Se seu backend está na máquina local e frontend na Hostinger:

```javascript
const apiBase = "http://seu-ip-local:4000";
// Ou se tem acesso via domínio:
const apiBase = "https://seu-backend.com:4000";
```

⚠️ **Problema:** Seu IP local não é acessível pela internet. **Não funciona.**

---

## 🔍 Como Diagnosticar

### 1. Verifique no console do navegador (F12)

Abra **Console** e rode:
```javascript
fetch("/api/ping")
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

Se retornar `<!DOCTYPE`, o backend está retornando HTML (erro).

---

### 2. Teste a URL diretamente no navegador

Tenta acessar:
```
http://localhost:4000/api/ping
```

Se estiver na Hostinger, tenta:
```
https://seu-dominio.com:4000/api/ping
```

---

### 3. Verifica os logs do backend

Se backend está rodando, você deve ver no console:
```
Backend rodando em http://localhost:4000
```

Se não vê isso, **backend não iniciou**.

---

## ✅ Solução Rápida para Hostinger

Se frontend e backend estão **na mesma VM**:

### Opção 1: Usar `/api` (relativo)
```javascript
// src/services/api.js
const apiBase = ""; // Deixa vazio
```

Então configure um proxy no Node.js da Hostinger para `/api` → `http://localhost:4000`

### Opção 2: Usar URL absoluta
```javascript
const apiBase = "https://seu-dominio.com:4000";
```

Isso só funciona se o backend está exposto nessa porta (requer configuração Hostinger).

---

## 🚀 Recomendação

**Para Hostinger, use esta configuração:**

```javascript
// src/services/api.js
const isDev = import.meta.env.DEV;
const apiBase = isDev ? "http://localhost:4000" : "/api";
```

Depois, configure um **proxy reverso** no Hostinger:
- `/api` → `http://localhost:4000`

Ou rode ambos na mesma porta usando a mesma aplicação Node.js.

---

## 📋 Checklist Final

- [ ] Verificou se backend está rodando? (`npm run backend` ou equivalente)
- [ ] Verificou se retorna JSON? (não HTML)
- [ ] Abriu console (F12) e viu a URL exata da requisição?
- [ ] Testou a URL diretamente no navegador?
- [ ] Confirmou frontend e backend estão na mesma máquina?

Se tudo falhar, **me mostra:**
1. A URL exata que aparece no console
2. O que vê quando acessa essa URL no navegador
3. Se são local ou Hostinger
