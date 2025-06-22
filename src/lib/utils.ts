import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para gerar slug único
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Função para gerar slug único com timestamp
export function generateUniqueSlug(text: string): string {
  const baseSlug = slugify(text)
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

// Função para validar horário de funcionamento
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Função para gerar horários disponíveis
export function generateTimeSlots(openTime: string, closeTime: string, serviceDuration: number = 60): string[] {
  const slots: string[] = []
  const [openHour, openMinute] = openTime.split(':').map(Number)
  const [closeHour, closeMinute] = closeTime.split(':').map(Number)
  
  let currentHour = openHour
  let currentMinute = openMinute
  
  while (
    currentHour < closeHour || 
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    // Adicionar duração do serviço
    currentMinute += serviceDuration
    while (currentMinute >= 60) {
      currentMinute -= 60
      currentHour += 1
    }
  }
  
  return slots
}

// Função para formatar data
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Função para formatar hora
export function formatTime(time: string): string {
  return time
}
