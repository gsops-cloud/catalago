# 🖼️ Upload de Imagens para Hostinger

## Opção 1: Upload Manual via FileZilla (Recomendado)

### Passo 1: Baixar FileZilla
- Baixa em: https://filezilla-project.org/
- Instala no seu computador

### Passo 2: Conectar ao FTP
1. Abre FileZilla
2. Vai em **File** → **Site Manager** (ou Ctrl+S)
3. Clica **New Site**
4. Preenche:
   - **Protocol**: FTP
   - **Host**: `62.72.62.191`
   - **Port**: `21`
   - **Username**: `u876547810.mediumaquamarine-barracuda-131448.hostingersite.com`
   - **Password**: `J~RyyPm8tm=*=:3h`
5. Clica **Connect**

### Passo 3: Fazer Upload
1. No painel esquerdo (Local Site), navega até `catalago/uploads/`
2. No painel direito (Remote Site), navega até `/public_html/uploads`
3. Seleciona todos os arquivos em `uploads/` (Ctrl+A)
4. Arrasta para o painel direito
5. Pronto! As imagens estão no servidor

---

## Opção 2: WinSCP

Se preferir outro cliente:
- Baixa: https://winscp.net/
- Passo 1: **New Site Connection**
- Passo 2: Preenche os dados acima
- Passo 3: Arrasta `uploads/` para `/public_html/`

---

## Verificar se funcionou

1. Acessa seu domínio em um outro dispositivo
2. Faz login no admin (admin / 1234)
3. Tenta adicionar um produto novo
4. Se a imagem aparecer em outro dispositivo = ✅ funcionou!

---

## ❌ Se as imagens não aparecerem

1. Verifica se a pasta `uploads/` está em `/public_html/uploads`
2. Verifica as permissões da pasta (deve ser 755)
3. Verifica o console do navegador (F12) para mensagens de erro
4. Verifica se o domínio está configurado corretamente no arquivo `.env`
