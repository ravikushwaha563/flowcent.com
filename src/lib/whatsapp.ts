// WhatsApp Cloud API Integration Utility

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Meta API Version
const API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

interface WhatsAppTemplateParameter {
    type: 'text';
    text: string;
}

interface WhatsAppTemplateComponent {
    type: 'header' | 'body' | 'button';
    parameters?: WhatsAppTemplateParameter[];
    sub_type?: 'quick_reply' | 'url';
    index?: string;
}

/**
 * Sends a WhatsApp template message using the official Cloud API.
 * Ensure the recipient number includes the country code without the '+' sign (e.g., '919876543210').
 */
export async function sendWhatsAppTemplate(
    toPhone: string,
    templateName: string,
    languageCode: string = 'en',
    components: WhatsAppTemplateComponent[] = []
) {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        console.warn('WhatsApp API credentials are not set. Skipping WhatsApp message.');
        return false;
    }

    // Clean phone number (remove +, spaces, dashes)
    const cleanedPhone = toPhone.replace(/\D/g, '');

    if (!cleanedPhone) {
        console.error('Invalid phone number provided for WhatsApp');
        return false;
    }

    const payload = {
        messaging_product: 'whatsapp',
        to: cleanedPhone,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode
            },
            components: components
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error:', data);
            throw new Error(data.error?.message || 'Failed to send WhatsApp message');
        }

        console.log(`WhatsApp message sent successfully to ${cleanedPhone}. Message ID: ${data.messages?.[0]?.id}`);
        return true;

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
}
