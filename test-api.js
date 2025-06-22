// Teste da API de disponibilidade
const testAPI = async () => {
  try {
    // Testar com uma data específica
    const date = '2025-06-25' // Data de teste
    const shopSlug = 'barbearia1-mc7vmxzn' // Slug correto da barbearia
    
    console.log(`🧪 Testando API de disponibilidade`)
    console.log(`📅 Data: ${date}`)
    console.log(`🏪 Barbearia: ${shopSlug}`)
    
    const response = await fetch(`http://localhost:3000/api/shops/${shopSlug}/availability?date=${date}`)
    const data = await response.json()
    
    console.log('\n📊 Resposta da API:')
    console.log(JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log(`\n✅ Sucesso!`)
      console.log(`📅 Horários disponíveis: ${data.availableSlots?.length || 0}`)
      console.log(`🚫 Horários ocupados: ${data.bookedTimes?.length || 0}`)
      
      if (data.availableSlots?.length > 0) {
        console.log(`🕐 Horários: ${data.availableSlots.join(', ')}`)
      } else {
        console.log(`❌ Nenhum horário disponível`)
      }
    } else {
      console.log(`❌ Erro: ${data.error}`)
    }
  } catch (error) {
    console.error('💥 Erro no teste:', error.message)
  }
}

// Executar o teste
testAPI() 