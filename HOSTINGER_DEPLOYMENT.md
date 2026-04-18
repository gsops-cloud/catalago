# 📦 Deploy na Hostinger

## Passo 1: Publicar o Frontend + Backend

1. Acesse o painel da Hostinger
2. Vá até **Files** → **File Manager**
3. Navegue até `/public_html`
4. Deleta o conteúdo existente (se houver)
5. Faz upload da pasta `dist/` (gerada por `npm run build`) para `/public_html`

## Passo 2: Publicar o Backend Node (server.js)

Você tem 2 opções:

### Opção A: Backend no mesmo servidor (recomendado)

1. No painel Hostinger, vá até **Advanced** → **Node.js**
2. Clique em **Create Application**
3. Configure:
   - **Application root**: `/public_html`
   - **Application startup file**: `server.js`
   - **Node.js version**: 18+ (ou a mais recente)
4. Faz upload de:
   - `server.js`
   - `db.json`
   - `package.json`
   - `uploads/` (pasta vazia para começar)
5. Clique em **Create**

### Opção B: Backend apenas local

Se não conseguir rodar Node na Hostinger:
- Frontend fica estático em `/public_html`
- Backend roda local no seu computador
- As imagens são salvas em `uploads/` local

## Passo 3: Configurar a URL da API

Se o backend está na Hostinger em `/api`, o frontend já funciona.

Se o backend está local, ajusta `vite.config.js`:

```javascript
server: {
  proxy: {
    "/api": "http://localhost:4000",
    "/uploads": "http://localhost:4000",
  },
},
```

## Passo 4: Fazer Upload das Imagens via FTP

Depois que as imagens são criadas localmente:

1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte com as credenciais:
   ```
   Host: ftp.seu-dominio.com
   Usuario: u876547810.mediumaquamarine-barracuda-131448.hostingersite.com
   Porta: 21
   Senha: J~RyyPm8tm=*=:3h
   ```
3. Navegue até `/public_html/uploads`
4. Faz upload da pasta `uploads/` do seu projeto

## Passo 5: Testar

1. Acesse seu domínio na Hostinger
2. Faça login no admin (admin / 1234)
3. Tenta adicionar um novo produto com imagem
4. Verifica se a imagem aparece em outro dispositivo

---

## ⚠️ Importante

- `db.json` armazena os produtos. Faz backup periódico
- Pasta `uploads/` deve ter permissão 755 no servidor
- Imagens são salvas com nomes aleatórios: `img-1644567890-abc123.jpg`
