// // // 1. API Route para SSE (/api/shops/[slug]/events)
// // import { NextRequest } from 'next/server'

// import { NextRequest } from "next/server";

// // export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
// //   const { slug } = params
  
// //   // Configurar headers para SSE
// //   const headers = new Headers({
// //     'Content-Type': 'text/event-stream',
// //     'Cache-Control': 'no-cache',
// //     'Connection': 'keep-alive',
// //     'Access-Control-Allow-Origin': '*',
// //     'Access-Control-Allow-Headers': 'Cache-Control'
// //   })

// //   const encoder = new TextEncoder()
  
// //   let clientId = Math.random().toString(36).substr(2, 9)
  
// //   const readable = new ReadableStream({
// //     start(controller) {
// //       // Enviar evento inicial
// //       const data = `data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`
// //       controller.enqueue(encoder.encode(data))
      
// //       // Armazenar referência do cliente (em memória)
// //       globalThis.sseClients = globalThis.sseClients || new Map()
// //       globalThis.sseClients.set(clientId, { controller, shopSlug: slug })
      
// //       // Heartbeat para manter conexão viva
// //       const heartbeatInterval = setInterval(() => {
// //         try {
// //           const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`
// //           controller.enqueue(encoder.encode(heartbeat))
// //         } catch (error) {
// //           clearInterval(heartbeatInterval)
// //           globalThis.sseClients?.delete(clientId)
// //         }
// //       }, 30000) // 30 segundos
      
// //       // Cleanup quando cliente desconecta
// //       request.signal.addEventListener('abort', () => {
// //         clearInterval(heartbeatInterval)
// //         globalThis.sseClients?.delete(clientId)
// //         try {
// //           controller.close()
// //         } catch (error) {
// //           console.log('Controller já fechado')
// //         }
// //       })
// //     }
// //   })

// //   return new Response(readable, { headers })
// // }

// // // 2. Função para notificar clientes SSE
// // export function notifySSEClients(shopSlug: string, eventData: any) {
// //   if (!globalThis.sseClients) return
  
// //   const encoder = new TextEncoder()
// //   const message = `data: ${JSON.stringify(eventData)}\n\n`
  
// //   for (const [clientId, client] of globalThis.sseClients.entries()) {
// //     if (client.shopSlug === shopSlug) {
// //       try {
// //         client.controller.enqueue(encoder.encode(message))
// //       } catch (error) {
// //         console.log(`Erro ao enviar para cliente ${clientId}:`, error)
// //         globalThis.sseClients.delete(clientId)
// //       }
// //     }
// //   }
// // }

// // // 3. Hook customizado para SSE
// // import { useEffect, useState, useRef } from 'react'

// // export function useSSESync(shopSlug: string, onAppointmentUpdate: () => void) {
// //   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
// //   const eventSourceRef = useRef<EventSource | null>(null)
// //   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

// //   const connect = () => {
// //     if (eventSourceRef.current) {
// //       eventSourceRef.current.close()
// //     }

// //     console.log('🔌 Conectando ao SSE...')
// //     const eventSource = new EventSource(`/api/shops/${shopSlug}/events`)
// //     eventSourceRef.current = eventSource

// //     eventSource.onopen = () => {
// //       console.log('✅ SSE conectado')
// //       setConnectionStatus('connected')
// //       if (reconnectTimeoutRef.current) {
// //         clearTimeout(reconnectTimeoutRef.current)
// //         reconnectTimeoutRef.current = null
// //       }
// //     }

// //     eventSource.onmessage = (event) => {
// //       try {
// //         const data = JSON.parse(event.data)
// //         console.log('📨 Evento SSE recebido:', data)
        
// //         switch (data.type) {
// //           case 'new_appointment':
// //           case 'appointment_cancelled':
// //           case 'appointment_updated':
// //             console.log('🔄 Atualizando agendamentos via SSE')
// //             onAppointmentUpdate()
// //             break
// //           case 'heartbeat':
// //             // Apenas manter conexão viva
// //             break
// //           case 'connected':
// //             console.log('🎯 Cliente conectado:', data.clientId)
// //             break
// //         }
// //       } catch (error) {
// //         console.error('Erro ao processar evento SSE:', error)
// //       }
// //     }

// //     eventSource.onerror = (error) => {
// //       console.log('❌ Erro na conexão SSE:', error)
// //       setConnectionStatus('disconnected')
// //       eventSource.close()
      
// //       // Reconectar após 3 segundos
// //       if (!reconnectTimeoutRef.current) {
// //         reconnectTimeoutRef.current = setTimeout(() => {
// //           console.log('🔄 Tentando reconectar SSE...')
// //           connect()
// //         }, 3000)
// //       }
// //     }
// //   }

// //   useEffect(() => {
// //     if (!shopSlug) return

// //     connect()

// //     return () => {
// //       if (eventSourceRef.current) {
// //         console.log('🔌 Desconectando SSE')
// //         eventSourceRef.current.close()
// //       }
// //       if (reconnectTimeoutRef.current) {
// //         clearTimeout(reconnectTimeoutRef.current)
// //       }
// //     }
// //   }, [shopSlug])

// //   return { connectionStatus }
// // }

// // // 4. Atualizar API de agendamentos para notificar via SSE
// // export async function POST(request: NextRequest) {
// //   try {
// //     const body = await request.json()
// //     const { shopId, clientName, clientContact, date, time } = body

// //     // ... sua lógica existente de criação do agendamento ...
    
// //     // Após criar o agendamento, notificar via SSE
// //     const shop = await getShopById(shopId) // sua função para buscar shop
    
// //     if (shop) {
// //       notifySSEClients(shop.slug, {
// //         type: 'new_appointment',
// //         appointment: {
// //           clientName,
// //           date,
// //           time,
// //           status: 'scheduled'
// //         }
// //       })
// //     }

// //     return NextResponse.json({ success: true, trackingUrl: `...` })
    
// //   } catch (error) {
// //     return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
// //   }
// // }

// // // 5. Usar no componente do painel do barbeiro
// // import { useSSESync } from '@/hooks/useSSESync'

// // export function BarberPanel({ shop }: { shop: any }) {
// //   const [appointments, setAppointments] = useState([])
  
// //   // Substituir os useEffects existentes por este:
// //   const { connectionStatus } = useSSESync(shop.slug, fetchShopAndAppointments)
  
// //   // Manter apenas o useEffect inicial
// //   useEffect(() => {
// //     fetchShopAndAppointments()
// //   }, [shop?.slug, showCancelled])

// //   return (
// //     <div>
// //       {/* Indicador de status da conexão */}
// //       <div className={`connection-status ${connectionStatus}`}>
// //         {connectionStatus === 'connected' && '🟢 Sincronização ativa'}
// //         {connectionStatus === 'connecting' && '🟡 Conectando...'}
// //         {connectionStatus === 'disconnected' && '🔴 Desconectado'}
// //       </div>
      
// //       {/* Resto do seu componente */}
// //     </div>
// //   )
// // }

// // API Route: /api/shops/[slug]/events.ts
// import { NextRequest } from 'next/server';

// export default function handler(req: NextRequest) {
//     // Extrai o slug da URL usando req.nextUrl
//     const slug = req.nextUrl.pathname.split('/').filter(Boolean).pop();

//     const stream = new ReadableStream({
//       start(controller) {
//         const encoder = new TextEncoder();
        
//         // Manter conexão viva
//         const keepAlive = setInterval(() => {
//           controller.enqueue(encoder.encode('data: {"type":"keepalive"}\n\n'));
//         }, 30000);
  
//         // Cleanup quando cliente desconectar
//         req.signal.addEventListener('abort', () => {
//           clearInterval(keepAlive);
//           controller.close();
//         });
//       }
//     });
  
//     return new Response(stream, {
//       headers: {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive',
//       },
//     });
//   }