#!/usr/bin/env node

// ===========================================
// SCRIPT DE BUILD PARA PRODUÇÃO
// ===========================================

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🏗️ Preparando build para produção...')

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
  console.error('❌ Execute este script no diretório frontend/')
  process.exit(1)
}

try {
  // Limpar build anterior
  console.log('🧹 Limpando build anterior...')
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' })
  }

  // Verificar dependências
  console.log('📦 Verificando dependências...')
  execSync('npm ci', { stdio: 'inherit' })

  // Type check
  console.log('🔍 Verificando tipos TypeScript...')
  execSync('npm run type-check', { stdio: 'inherit' })

  // Lint
  console.log('✨ Verificando código com ESLint...')
  try {
    execSync('npm run lint', { stdio: 'inherit' })
  } catch (error) {
    console.warn('⚠️ Avisos de lint encontrados, mas continuando...')
  }

  // Build
  console.log('🚀 Fazendo build para produção...')
  execSync('npm run build', { stdio: 'inherit' })

  // Verificar se build foi criado
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('Build não foi criado corretamente')
  }

  // Estatísticas do build
  console.log('\n📊 Estatísticas do build:')
  const distStats = execSync('du -sh dist/', { encoding: 'utf8' }).trim()
  console.log(`   Tamanho total: ${distStats.split('\t')[0]}`)

  // Listar arquivos principais
  const files = fs.readdirSync('dist')
  console.log('   Arquivos principais:')
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
      const filePath = path.join('dist', file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`   - ${file}: ${sizeKB}KB`)
    }
  })

  console.log('\n✅ Build para produção concluído com sucesso!')
  console.log('\n📋 Próximos passos:')
  console.log('1. Fazer deploy na Vercel: vercel --prod')
  console.log('2. Configurar variáveis de ambiente na Vercel')
  console.log('3. Configurar domínio personalizado (opcional)')

} catch (error) {
  console.error('\n❌ Erro no build:', error.message)
  process.exit(1)
}
