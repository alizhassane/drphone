
import * as settingsService from './settingsService.js';

export const sendSMS = async (to: string, message: string) => {
    const settings: any = await settingsService.getSettings();

    if (settings.sms_enabled !== 'true') {
        console.log('SMS disabled, skipping message to:', to);
        return { success: false, reason: 'disabled' };
    }

    if (!to) {
        console.error('SMS Error: No recipient number');
        return { success: false, reason: 'no_number' };
    }

    const provider = settings.sms_provider || 'twilio';
    const apiKey = settings.sms_api_key;
    const fromNumber = settings.sms_number;

    console.log(`[SMS SIMULATION] Sending via ${provider}`);
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${to}`);
    console.log(`Body: ${message}`);

    // TODO: Implement actual Twilio/Plivo Logic here
    // For now, we simulate success and log to console for demo

    return { success: true, simulated: true };
};

export const sendRepairStatusUpdate = async (clientPhone: string, clientName: string, repairId: string, status: string, model: string) => {
    const settings: any = await settingsService.getSettings();
    if (settings.sms_enabled !== 'true') return;

    let message = '';

    // Helper to map status to friendly message
    // Settings keys: sms_tmpl_received, sms_tmpl_done

    if (status === 'reçue' && settings.sms_tmpl_received === 'true') {
        message = `Bonjour ${clientName}, Dr.Phone a bien reçu votre appareil (${model}). Ticket: ${repairId}. Nous vous contacterons bientôt.`;
    } else if (status === 'réparée' && settings.sms_tmpl_done === 'true') {
        message = `Bonjour ${clientName}, votre réparation pour (${model}) est terminée ! Vous pouvez passer récupérer votre appareil chez Dr.Phone. Ticket: ${repairId}.`;
    }

    if (message) {
        return await sendSMS(clientPhone, message);
    }
};
