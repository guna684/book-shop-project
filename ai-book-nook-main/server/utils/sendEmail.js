import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    // EmailJS Credentials
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    // Check if keys are missing
    if (!serviceId || !templateId || !publicKey || !privateKey) {
        console.warn('[EMAIL] EmailJS keys missing. Using Mock.');
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
        return Promise.resolve({ response: 'Mock success' });
    }

    try {
        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
                email: 'sricholabookgob@gmail.com', // Sender email (required by template)
                to_email: to,
                subject: subject,
                html_content: html,
            }
        });

        console.log('[EMAIL] Sent via EmailJS:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('[EMAIL] EmailJS Error:', error.response?.data || error.message);
        // Don't throw to avoid crashing checkout
        return { success: false, error: error.message };
    }
};

export default sendEmail;
