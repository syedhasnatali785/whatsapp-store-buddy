// Import jsPDF library
import { jsPDF } from 'jspdf';

// Function to generate PDF invoice
export function generateInvoice(order) {
    const doc = new jsPDF();

    // Store Information
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Store Name', 20, 20);
    doc.setFontSize(12);
    doc.text('Store Address', 20, 30);
    doc.text('Store Phone: (123) 456-7890', 20, 40);

    // Customer Details
    doc.setFont('Helvetica', 'normal');
    doc.text(`Invoice to: ${order.customer.name}`, 20, 60);
    doc.text(`Address: ${order.customer.address}`, 20, 70);
    doc.text(`Email: ${order.customer.email}`, 20, 80);

    // Items
    doc.setFont('Helvetica', 'bold');
    doc.text('Items Purchased', 20, 100);
    doc.setFont('Helvetica', 'normal');
    let y = 110;
    order.items.forEach(item => {
        doc.text(`${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`, 20, y);
        y += 10;
    });

    // Totals
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Total: $${total.toFixed(2)}`, 20, y);

    // Save PDF
    doc.save(`invoice_${order.id}.pdf`);
}
