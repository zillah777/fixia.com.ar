// WhatsApp Integration Utilities

export interface WhatsAppContact {
  phone: string;
  name: string;
  service?: {
    title: string;
    price: number;
    id: string;
  };
  project?: {
    title: string;
    budget?: string;
    id: string;
  };
}

/**
 * Generates a WhatsApp URL for contacting a professional
 */
export const generateWhatsAppUrl = (contact: WhatsAppContact): string => {
  // Clean phone number (remove non-digits, add country code if needed)
  let cleanPhone = contact.phone.replace(/\D/g, '');
  
  // Add Argentina country code if not present
  if (!cleanPhone.startsWith('54')) {
    cleanPhone = '54' + cleanPhone;
  }
  
  // Generate message based on context
  let message = '';
  
  if (contact.service) {
    message = `¡Hola ${contact.name}! 👋

Vi tu servicio *${contact.service.title}* en Fixia y me interesa contratarlo.

💰 Precio: $${contact.service.price.toLocaleString('es-AR')}

¿Podrías darme más información sobre:
- Detalles del servicio
- Tiempos de entrega
- Formas de pago

¡Gracias!

_Mensaje enviado desde Fixia.com.ar_`;
  } else if (contact.project) {
    message = `¡Hola ${contact.name}! 👋

Vi que tienes experiencia en el área y me gustaría consultarte sobre mi proyecto:

📋 *${contact.project.title}*
${contact.project.budget ? `💰 Presupuesto: ${contact.project.budget}` : ''}

¿Podrías ayudarme con este proyecto?

¡Gracias!

_Mensaje enviado desde Fixia.com.ar_`;
  } else {
    message = `¡Hola ${contact.name}! 👋

Te contacto desde Fixia.com.ar porque me interesa conocer más sobre tus servicios.

¿Podrías darme más información?

¡Gracias!`;
  }
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Opens WhatsApp chat in new window/tab
 */
export const openWhatsAppChat = (contact: WhatsAppContact): void => {
  const url = generateWhatsAppUrl(contact);
  window.open(url, '_blank');
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +54 9 XXX XXX-XXXX
  if (cleaned.length >= 10) {
    const countryCode = cleaned.startsWith('54') ? '+54' : '+54';
    const areaCode = cleaned.slice(-10, -7);
    const firstPart = cleaned.slice(-7, -4);
    const secondPart = cleaned.slice(-4);
    
    return `${countryCode} 9 ${areaCode} ${firstPart}-${secondPart}`;
  }
  
  return phone;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};