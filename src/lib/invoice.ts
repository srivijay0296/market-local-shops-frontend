import { jsPDF } from 'jspdf';
import { formatPrice } from './constants';

export const generateInvoicePDF = (order: any, orderItems: any[]) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 116, 240); // Flipkart Blue
  doc.text('BTM (Bargur Textile Market)', margin, y);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  y += 10;
  doc.text('Authentic Textiles from Bargur, Tamil Nadu', margin, y);
  doc.text('GSTIN: 33AAAAA0000A1Z5', margin, y + 5);

  // Order Info
  y += 20;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Invoice No: INV-${order.id.substring(0, 8).toUpperCase()}`, margin, y);
  doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`, margin, y + 7);
  doc.text(`Order Status: ${order.status.toUpperCase()}`, margin, y + 14);

  // Billing Address
  y += 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Address:', margin, y);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(order.shipping_address || 'Address not available', 80);
  doc.text(addressLines, margin, y + 5);

  // Table Header
  y += 40;
  doc.setFillColor(241, 243, 246);
  doc.rect(margin, y, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Product Name', margin + 5, y + 7);
  doc.text('Qty', margin + 100, y + 7);
  doc.text('Price', margin + 120, y + 7);
  doc.text('Total', margin + 150, y + 7);

  // Table Body
  y += 15;
  doc.setFont('helvetica', 'normal');
  orderItems.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const name = item.product_name || 'Product';
    const splitName = doc.splitTextToSize(name, 90);
    doc.text(splitName, margin + 5, y);
    doc.text(item.quantity.toString(), margin + 100, y);
    doc.text(formatPrice(item.price_at_time || 0), margin + 120, y);
    doc.text(formatPrice((item.price_at_time || 0) * item.quantity), margin + 150, y);
    y += (splitName.length * 5) + 5;
  });

  // Summary
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(margin + 100, y, margin + 170, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', margin + 100, y);
  doc.text(formatPrice(order.total_amount || 0), margin + 150, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Thank you for shopping with BTM!', 105, 285, { align: 'center' });

  // Save PDF
  doc.save(`Invoice_BTM_${order.id.substring(0, 8)}.pdf`);
};
