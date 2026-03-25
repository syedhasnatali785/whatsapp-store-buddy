// Updated CheckoutDialog.tsx

import React from 'react';
import { sendOrderToWhatsApp } from './whatsappService';

const CheckoutDialog = ({ orderDetails }) => {

    const handleSendOrder = () => {
        const images = orderDetails.products.map(product => product.imageUrl);
        const imageAttachments = images.map(image => `![Image](${image})`).join('\n');
        const message = `Here are the details of your order:\n\n${orderDetails.summary}\n\nImages: \n${imageAttachments}`;
        sendOrderToWhatsApp(message);
    };

    return (
        <div>
            <h2>Checkout</h2>
            <button onClick={handleSendOrder}>Send Order to WhatsApp</button>
        </div>
    );
};

export default CheckoutDialog;
