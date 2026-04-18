#!/bin/bash

echo "🔍 Testando conexão com o backend..."
echo ""

# Testa se o backend está rodando em localhost:4000
if curl -s http://localhost:4000/api/ping > /dev/null 2>&1; then
  echo "✅ Backend está rodando em http://localhost:4000"
  
  # Testa a rota de produtos
  echo ""
  echo "📦 Testando rota de produtos..."
  curl -s http://localhost:4000/api/products | jq . 2>/dev/null || curl -s http://localhost:4000/api/products
  
else
  echo "❌ Backend NÃO está rodando!"
  echo ""
  echo "Para iniciar o backend, execute em um terminal:"
  echo "  npm run backend"
  echo ""
  echo "Ou se estiver usando PowerShell:"
  echo "  node server.js"
fi
