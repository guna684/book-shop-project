export const generateInvoiceTemplate = (order, user) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details p { margin: 5px 0; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
            .table th { background-color: #f8f9fa; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-section p { margin: 5px 0; }
            .total-amount { font-size: 18px; font-weight: bold; color: #2c3e50; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Sri Chola Book Shop</div>
                <p>Thank you for your order!</p>
            </div>
            
            <div class="invoice-details">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Shipping Address:</strong><br>
                ${order.shippingAddress.address}, ${order.shippingAddress.city}<br>
                ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                    <tr>
                        <td>${item.title}</td>
                        <td>${item.qty}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>₹${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <p>Subtotal: ₹${order.itemsPrice.toFixed(2)}</p>
                <p>Tax: ₹${order.taxPrice.toFixed(2)}</p>
                <p>Shipping: ₹${order.shippingPrice.toFixed(2)}</p>
                ${order.discountAmount > 0 ? `<p style="color: green;">Discount: -₹${order.discountAmount.toFixed(2)}</p>` : ''}
                <p class="total-amount">Grand Total: ₹${order.totalPrice.toFixed(2)}</p>
            </div>

            <div class="footer">
                <p>If you have any questions about this invoice, please contact support.</p>
                <p>&copy; ${new Date().getFullYear()} Sri Chola Book Shop. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
