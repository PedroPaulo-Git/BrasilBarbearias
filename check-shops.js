// Verificar barbearias no banco
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkShops() {
  try {
    console.log('🔍 Verificando barbearias no banco...')
    
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        openTime: true,
        closeTime: true,
        serviceDuration: true
      }
    })
    
    console.log(`\n📊 Encontradas ${shops.length} barbearia(s):`)
    
    shops.forEach((shop, index) => {
      console.log(`\n${index + 1}. ${shop.name}`)
      console.log(`   ID: ${shop.id}`)
      console.log(`   Slug: ${shop.slug}`)
      console.log(`   Horário: ${shop.openTime} - ${shop.closeTime}`)
      console.log(`   Duração: ${shop.serviceDuration}min`)
    })
    
    if (shops.length === 0) {
      console.log('\n❌ Nenhuma barbearia encontrada!')
      console.log('💡 Execute o seed ou crie uma barbearia primeiro.')
    }
    
  } catch (error) {
    console.error('💥 Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkShops() 