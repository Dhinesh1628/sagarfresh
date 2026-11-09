import express from 'express';
import { processCustomerMessage } from '../services/aiChatbot.js';

const router = express.Router();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'gomeat_whatsapp_verify_2026';

/**
 * 1. Meta WhatsApp Cloud API Webhook Verification (GET)
 * Meta will ping this URL with hub.mode, hub.challenge, and hub.verify_token
 * to verify endpoint ownership.
 */
router.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified webhook with Meta token successfully.');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp Webhook] Verification token mismatch.');
  return res.sendStatus(403);
});

/**
 * 2. Meta WhatsApp Incoming Message Handler (POST)
 * When a customer sends a message to the WhatsApp Business Number,
 * Meta forwards the webhook payload here.
 */
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const fromPhone = message.from; // Customer WhatsApp Number (e.g. "919876543210")
        const messageType = message.type;
        let messageText = '';

        if (messageType === 'text') {
          messageText = message.text?.body || '';
        } else if (messageType === 'interactive') {
          messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        } else if (messageType === 'button') {
          messageText = message.button?.text || '';
        }

        console.log(`[WhatsApp Inbound] From ${fromPhone}: "${messageText}"`);

        // Process with GoMeat AI Chatbot Engine
        const botResponse = await processCustomerMessage(messageText, fromPhone);

        // Send Reply Back to WhatsApp if Cloud API token is configured
        if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
          await sendWhatsAppTextMessage(fromPhone, botResponse.reply);
        } else {
          console.log(`[WhatsApp Outbound Mock] (WHATSAPP_TOKEN not set in .env): Generated reply:\n${botResponse.reply}`);
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    res.sendStatus(404);
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. Direct API Endpoint for Live Web Simulator & Chat Widget
 * Allows users, interns, and PM to chat with the GoMeat AI directly
 * in the interactive web WhatsApp widget!
 */
router.post('/chatbot/chat', async (req, res) => {
  try {
    const { message, phone, cartSummary } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const botResponse = await processCustomerMessage(message, phone || '+91 98765 00000', cartSummary);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...botResponse
    });
  } catch (error) {
    console.error('[Chatbot API Error]:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * Helper to dispatch message via Meta Graph API
 */
async function sendWhatsAppTextMessage(toPhoneNumber, messageBody) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: messageBody
          }
        })
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error('[WhatsApp API Delivery Failed]:', result);
    } else {
      console.log(`[WhatsApp API Delivery OK] Message sent to ${toPhoneNumber}, id: ${result.messages?.[0]?.id}`);
    }
    return result;
  } catch (err) {
    console.error('[WhatsApp API Exception]:', err.message);
  }
}

export default router;
