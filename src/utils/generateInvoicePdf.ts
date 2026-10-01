import { jsPDF } from 'jspdf';
import { Order } from '../types/index.ts';

/**
 * Generates and downloads a clean, professional PDF tax invoice for an order.
 */
export function generateInvoicePdf(order: Order): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [220, 38, 38]; // #dc2626 (AutoApex Red)
  const darkColor: [number, number, number] = [17, 24, 39]; // #111827
  const grayColor: [number, number, number] = [107, 114, 128]; // #6b7280
  const lightBg: [number, number, number] = [249, 250, 251]; // #f9fafb
  const borderColor: [number, number, number] = [229, 231, 235]; // #e5e7eb

  let y = margin;

  // --- Top Red Decorative Accent Bar ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // --- 1. Header & Brand Block ---
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text('AUTOAPEX', margin, y);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('PERFORMANCE & OEM PARTS', margin + 44, y - 0.5);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Premier Automotive Replacement Spares & Accessories', margin, y + 4.5);

  // Invoice Title on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkColor);
  doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`ORIGINAL FOR RECIPIENT`, pageWidth - margin, y + 5, { align: 'right' });

  y += 11;
  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // --- 2. Company & Order Meta Columns ---
  y += 6;
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Seller Information
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colWidth, 32, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, colWidth, 32, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Sold By / Supplier Details:', margin + 4, y + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AutoApex Logistics India Pvt. Ltd.', margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Central Fulfillment Hub, Sector 18, NH-48', margin + 4, y + 15);
  doc.text('Gurugram, Haryana - 122015, India', margin + 4, y + 19);
  doc.text('GSTIN: 07AAACA1234B1Z5  |  PAN: AAACA1234B', margin + 4, y + 23);
  doc.text('Email: support@autoapex.in  |  Tel: 1800-200-4567', margin + 4, y + 27);

  // Right Box: Invoice & Order Metadata
  const rightBoxX = margin + colWidth + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(rightBoxX, y, colWidth, 32, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(rightBoxX, y, colWidth, 32, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Invoice & Order Details:', rightBoxX + 4, y + 5.5);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const printMetaRow = (label: string, val: string, rowY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.text(label, rightBoxX + 4, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(val, rightBoxX + colWidth - 4, rowY, { align: 'right' });
  };

  printMetaRow('Invoice No:', `INV-${order.orderNumber}`, y + 10.5);
  printMetaRow('Order Number:', `#${order.orderNumber}`, y + 15);
  printMetaRow('Invoice Date:', `${formattedDate}, ${formattedTime}`, y + 19.5);
  printMetaRow('Carrier / AWB:', `${order.carrier} (${order.trackingNumber})`, y + 24);
  printMetaRow('Order Status:', order.orderStatus.replace(/_/g, ' '), y + 28.5);

  y += 36;

  // --- 3. Customer Billing & Shipping Address ---
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'S');

  // Billing & Shipping To
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Billed To / Delivered To:', margin + 4, y + 5.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(order.shippingAddress.name, margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  const addr1 = order.shippingAddress.addressLine1 + (order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : '');
  const addr2 = `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}, India`;
  doc.text(addr1, margin + 4, y + 14.5);
  doc.text(addr2, margin + 4, y + 18.5);

  // Contact & Payment badge on right side of this box
  const custRightX = pageWidth - margin - 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Phone: ${order.shippingAddress.phone}`, custRightX, y + 10.5, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald
  doc.text(`Payment: ${order.payment.status.toUpperCase()} (${order.payment.method})`, custRightX, y + 14.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text(`Payment Ref: ${order.payment.razorpayPaymentId || 'PAID_DIRECT'}`, custRightX, y + 18.5, { align: 'right' });

  y += 28;

  // --- 4. Order Items Table ---
  // Table Header
  const colX = {
    idx: margin + 2,
    desc: margin + 12,
    sku: margin + 85,
    qty: margin + 120,
    price: margin + 145,
    total: pageWidth - margin - 2
  };

  const tableHeaderHeight = 7.5;
  doc.setFillColor(...darkColor);
  doc.rect(margin, y, contentWidth, tableHeaderHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.idx, y + 5);
  doc.text('Item Description', colX.desc, y + 5);
  doc.text('SKU / Code', colX.sku, y + 5);
  doc.text('Qty', colX.qty, y + 5, { align: 'center' });
  doc.text('Unit Price', colX.price, y + 5, { align: 'right' });
  doc.text('Total (INR)', colX.total, y + 5, { align: 'right' });

  y += tableHeaderHeight;

  // Table Rows
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowHeight = 11;

    // Check if row exceeds printable page limit (leave room for summary or page break)
    if (y + rowHeight > pageHeight - 65) {
      doc.addPage();
      y = margin + 4;
      // Re-draw table header on new page
      doc.setFillColor(...darkColor);
      doc.rect(margin, y, contentWidth, tableHeaderHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('#', colX.idx, y + 5);
      doc.text('Item Description (cont.)', colX.desc, y + 5);
      doc.text('SKU / Code', colX.sku, y + 5);
      doc.text('Qty', colX.qty, y + 5, { align: 'center' });
      doc.text('Unit Price', colX.price, y + 5, { align: 'right' });
      doc.text('Total (INR)', colX.total, y + 5, { align: 'right' });
      y += tableHeaderHeight;
    }

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(249, 250, 251);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(...borderColor);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // Index
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(String(index + 1), colX.idx, y + 6);

    // Item Name (truncate if too long)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    const maxNameWidth = colX.sku - colX.desc - 4;
    const itemName = doc.splitTextToSize(item.name, maxNameWidth);
    doc.text(itemName[0] || item.name, colX.desc, y + 5);

    // Vehicle Fitment subtext if available
    if (item.vehicleCompatibility) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...grayColor);
      const fitmentText = doc.splitTextToSize(`Fit: ${item.vehicleCompatibility}`, maxNameWidth);
      doc.text(fitmentText[0], colX.desc, y + 8.5);
    }

    // SKU
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...grayColor);
    doc.text(item.sku || 'N/A', colX.sku, y + 6);

    // Qty
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.text(String(item.quantity), colX.qty, y + 6, { align: 'center' });

    // Unit Price
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.text(`INR ${item.price.toLocaleString('en-IN')}`, colX.price, y + 6, { align: 'right' });

    // Line Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    const lineTotal = item.price * item.quantity;
    doc.text(`INR ${lineTotal.toLocaleString('en-IN')}`, colX.total, y + 6, { align: 'right' });

    y += rowHeight;
  });

  // Check if summary box fits on current page
  if (y + 50 > pageHeight - margin) {
    doc.addPage();
    y = margin + 4;
  } else {
    y += 5;
  }

  // --- 5. Cost & Taxes Summary Box (Right Aligned) ---
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const summaryStartY = y;

  // Left Note Box (Terms & GST compliance)
  const noteBoxWidth = contentWidth - summaryBoxWidth - 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, noteBoxWidth, 42, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, noteBoxWidth, 42, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Important Notes & Tax Breakdown:', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('• Tax Classification: Composite supply of automotive spares (HSN 8708)', margin + 4, y + 10.5);
  doc.text('• CGST (9%) + SGST (9%) or IGST (18%) included in accordance with GST Rules.', margin + 4, y + 14.5);
  doc.text('• 100% Genuine OEM / Certified Aftermarket parts warranty applicable.', margin + 4, y + 18.5);
  doc.text('• For warranty claims or returns, retain this invoice.', margin + 4, y + 22.5);
  doc.text('• Support & Assistance: https://autoapex.in/support', margin + 4, y + 26.5);

  // Authorized Signatory seal note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text('AutoApex India - Digital Verification Desk', margin + 4, y + 34);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('(This is a digitally generated document. No physical signature required)', margin + 4, y + 38);

  // Right Side: Calculations Breakdown
  doc.setFillColor(...lightBg);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 42, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 42, 2, 2, 'S');

  let sumY = summaryStartY + 5.5;

  const printSummaryRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    if (isHighlight) {
      doc.setTextColor(220, 38, 38); // red
    } else {
      doc.setTextColor(...(isBold ? darkColor : grayColor));
    }
    doc.text(label, summaryBoxX + 4, sumY);
    doc.text(value, summaryBoxX + summaryBoxWidth - 4, sumY, { align: 'right' });
    sumY += 5;
  };

  printSummaryRow('Subtotal (Net):', `INR ${order.subtotal.toLocaleString('en-IN')}`);

  if (order.discount > 0) {
    printSummaryRow(`Coupon Discount (${order.couponCode || 'PROMO'}):`, `- INR ${order.discount.toLocaleString('en-IN')}`, true, false);
  }

  // Estimated CGST / SGST breakdown from order.tax
  const halfTax = Math.round(order.tax / 2);
  printSummaryRow('CGST (9%):', `INR ${halfTax.toLocaleString('en-IN')}`);
  printSummaryRow('SGST / UTGST (9%):', `INR ${(order.tax - halfTax).toLocaleString('en-IN')}`);
  printSummaryRow('Total GST Tax (18%):', `INR ${order.tax.toLocaleString('en-IN')}`);

  const shippingText = order.shipping === 0 ? 'FREE' : `INR ${order.shipping.toLocaleString('en-IN')}`;
  printSummaryRow('Express Delivery:', shippingText);

  // Total Divider
  doc.setDrawColor(...borderColor);
  doc.line(summaryBoxX + 4, sumY, summaryBoxX + summaryBoxWidth - 4, sumY);
  sumY += 4;

  // Grand Total Highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text('Total Amount Paid:', summaryBoxX + 4, sumY);
  doc.setTextColor(...primaryColor);
  doc.text(`INR ${order.total.toLocaleString('en-IN')}`, summaryBoxX + summaryBoxWidth - 4, sumY, { align: 'right' });

  // --- 6. Footer ---
  const footerY = pageHeight - margin - 4;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Thank you for trusting AutoApex for your automotive performance and repair needs!', margin, footerY);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

  // Trigger browser download of PDF
  const filename = `AutoApex_Invoice_${order.orderNumber}.pdf`;
  doc.save(filename);
}
