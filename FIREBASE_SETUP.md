# 🔥 Integração Firebase - Guia Completo

Seu app agora usa **Firebase Storage** para armazenar imagens de forma segura na nuvem (100% frontend, sem backend!).

---

## 📋 Passo 1: Criar Conta Firebase (Gratuito)

1. Acessa: https://console.firebase.google.com/
2. Clica **"Criar Projeto"** (ou **"Create Project"**)
3. Preencha:
   - Nome: `catalago` (ou outro nome qualquer)
   - Desabilita Google Analytics (opcional)
4. Clica **"Criar Projeto"**
5. Espera a criação terminar (2-3 minutos)

---

## �️ Passo 1.5: Ativar Cloud Storage

1. No console Firebase, vai para **"Storage"** no menu lateral esquerdo
2. Clica **"Get started"**
3. Escolhe **"Start in test mode"** (para desenvolvimento - permite uploads sem autenticação)
4. Clica **"Done"**

Isso cria o bucket padrão necessário para o upload de imagens.

---

## �🔑 Passo 2: Pegar Credenciais do Projeto

1. No console Firebase, procura pelo ícone de **engrenagem** (⚙️) no canto superior esquerdo
2. Clica **"Project Settings"**
3. Vai para a aba **"General"**
4. Scroll down até **"Your apps"**
5. Se não tem nenhuma app, clica **"</>** (Web)"
6. Nome da app: `catalago-app` (qualquer nome)
7. Clica **"Register app"**
8. Você verá um código assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDz...",
  authDomain: "catalago.firebaseapp.com",
  projectId: "catalago-xyz",
  storageBucket: "catalago-xyz.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def"
};
```

**Copia esses 6 valores!** Você vai usar no próximo passo.

---

## 📝 Passo 3: Configurar no Projeto

1. Na pasta raiz do projeto, cria um arquivo `.env.local`:

```bash
# .env.local (criar arquivo novo)
VITE_FIREBASE_API_KEY=AIzaSyDz...
VITE_FIREBASE_AUTH_DOMAIN=catalago.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=catalago-xyz
VITE_FIREBASE_STORAGE_BUCKET=catalago-xyz.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def
```

**⚠️ IMPORTANTE:**
- Substitui os valores pelos seus reais
- `.env.local` é **ignorado pelo git** (não compartilha credenciais)
- Vite automaticamente carrega essas variáveis

---

## 🔐 Passo 4: Configurar Permissões do Storage

No console Firebase:

1. Vai para **"Build"** → **"Storage"** (no menu esquerdo)
2. Clica **"Create Bucket"** ou **"Get Started"**
3. Localização: escolhe a mais próxima (padrão fica bom)
4. Modo: **"Start in test mode"** (desenvolvimento)
5. Clica **"Create"**

### Atualizar Regras de Segurança (Importante!)

1. No Storage, clica na aba **"Rules"**
2. Substitui o conteúdo por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /catalog-images/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Clica **"Publish"**

**Isso permite que qualquer um leia/escreva imagens. Em produção, restrinja se necessário.**

---

## ✅ Passo 5: Testar Localmente

```bash
npm install   # Instala firebase
npm run dev   # Inicia o app
```

Acessa: `http://localhost:5173`

1. Login: admin / 1234
2. Tenta adicionar um produto com imagem
3. Se funcionar, verá a imagem carregar
4. Abre console (F12) → Storage (aba) → vê a imagem em Firebase

---

## 🚀 Passo 6: Deploy na Hostinger

Agora que está tudo funcionando localmente:

```bash
npm run build   # Cria dist/
```

### Upload para Hostinger via FTP:

1. Conecta no FTP (FileZilla ou similar)
2. Navega até `/public_html`
3. Deleta tudo que tem (ou faz backup)
4. Faz upload:
   - 📁 `dist/` (toda a pasta)
   - 📄 `package.json` (só para referência)

**NÃO precisa fazer upload de:**
- ❌ `server.js` (não vai usar)
- ❌ `.env.local` (já está no `dist/` compilado)
- ❌ `node_modules/` (muito grande)

### Adicionar `.env.local` na Hostinger

Se a Hostinger tiver suporte a variáveis de ambiente:

1. Painel → Build (ou Environment)
2. Adiciona as variáveis do Firebase
3. Redeploy

Ou simplemente coloca no `.env.local` local e faz build ANTES de fazer upload.

---

## 🔍 Testar em Produção

Acessa seu domínio:
```
https://mediumaquamarine-barracuda-131448.hostingersite.com/
```

1. Tenta fazer login (admin / 1234)
2. Tenta adicionar produto com imagem
3. Se funcionar = ✅ Tudo pronto!

---

## 💡 Recursos da Solução

✅ **Sem backend** - 100% frontend  
✅ **Firebase Storage** - imagens na nuvem  
✅ **localStorage** - dados locais dos produtos  
✅ **Gratuito** - até ~5GB de storage  
✅ **Seguro** - sem credenciais expostas  
✅ **Funciona offline** - localStorage + cache  

---

## 🆘 Troubleshooting

### "Erro: apiKey não definida"
- Verifica se `.env.local` foi criado
- Verifica se os valores foram copiados corretamente
- Reinicia `npm run dev`

### "Erro ao fazer upload: Permission denied"
- Verifica se as Rules do Storage foram atualizadas
- Certifica que está em "test mode" ou regras permissivas

### "Imagem não aparece após upload"
- Abre console (F12) → Network
- Verifica se a requisição ao Firebase retornou 200
- Verifica se a URL está correta

### "Firebase não reconhece o projeto"
- Verifica se `VITE_FIREBASE_PROJECT_ID` está correto
- Tenta recriar o `.env.local`
- Reinicia dev server

---

## 📚 Próximos Passos

1. ✅ Criar conta Firebase
2. ✅ Adicionar credenciais em `.env.local`
3. ✅ Testar localmente
4. ✅ Fazer build
5. ✅ Upload para Hostinger
6. ✅ Testar em produção

---

## 🎉 Pronto!

Seu app agora é 100% frontend com storage na nuvem. Sem backend, sem servidor, sem complicações.

Qualquer dúvida, consulta a [documentação oficial do Firebase](https://firebase.google.com/docs/storage).
