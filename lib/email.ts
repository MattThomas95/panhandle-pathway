import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface BookingEmailData {
  to: string;
  userName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  bookingId: string;
  status: 'confirmed' | 'cancelled';
}

export interface OrderEmailData {
  to: string;
  userName: string;
  orderId: string;
  total: number;
  trackingNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: any;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Booking Confirmation - ${data.serviceName}`,
      html: getBookingConfirmationHTML(data),
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error };
    }

    console.log('Booking confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendBookingCancellationEmail(data: BookingEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Booking Cancelled - ${data.serviceName}`,
      html: getBookingCancellationHTML(data),
    });

    if (error) {
      console.error('Failed to send booking cancellation email:', error);
      return { success: false, error };
    }

    console.log('Booking cancellation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending booking cancellation email:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.trackingNumber ? `Your order is on the way! #${data.orderId}` : `Order Confirmation #${data.orderId}`,
      html: getOrderConfirmationHTML(data),
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    console.log('Order confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendBookingReminderEmail(data: BookingEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Reminder: Upcoming Booking - ${data.serviceName}`,
      html: getBookingReminderHTML(data),
    });

    if (error) {
      console.error('Failed to send booking reminder email:', error);
      return { success: false, error };
    }

    console.log('Booking reminder email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending booking reminder email:', error);
    return { success: false, error };
  }
}

// Email HTML Templates
function getBookingConfirmationHTML(data: BookingEmailData): string {
  const formattedDate = new Date(data.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedStartTime = new Date(data.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEndTime = new Date(data.endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName},</p>

          <p style="font-size: 16px; margin-bottom: 30px;">
            Your booking has been confirmed. We're looking forward to seeing you!
          </p>

          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedStartTime} - ${formattedEndTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #667eea; font-family: monospace;">#${data.bookingId}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Important:</strong> Please arrive 10 minutes early. If you need to cancel or reschedule, please do so at least 24 hours in advance.
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">
            Thank you for choosing Panhandle Pathway!
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions, feel free to reply to this email.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Panhandle Pathway | Your trusted partner</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </body>
    </html>
  `;
}

function getBookingCancellationHTML(data: BookingEmailData): string {
  const formattedDate = new Date(data.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedStartTime = new Date(data.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Cancelled</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName},</p>

          <p style="font-size: 16px; margin-bottom: 30px;">
            Your booking has been cancelled as requested.
          </p>

          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #ef4444; font-size: 20px;">Cancelled Booking</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedStartTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #ef4444; font-family: monospace;">#${data.bookingId}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We hope to see you again soon! Feel free to book another appointment anytime.
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions or concerns, please don't hesitate to contact us.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Panhandle Pathway | Your trusted partner</p>
        </div>
      </body>
    </html>
  `;
}

function getOrderConfirmationHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const shippingHTML = data.shippingAddress
    ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #667eea; font-size: 18px; margin-bottom: 10px;">Shipping Address</h3>
      <p style="margin: 5px 0; color: #4b5563;">
        ${data.shippingAddress.name}<br>
        ${data.shippingAddress.line1}<br>
        ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ''}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}
      </p>
      ${data.trackingNumber ? `<p style="margin: 8px 0 0; color: #10b981;"><strong>Tracking:</strong> ${data.trackingNumber}</p>` : ''}
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName},</p>

          <p style="font-size: 16px; margin-bottom: 30px;">
            Your order has been confirmed and is being processed. We'll send you another email when your order ships.
          </p>

          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #10b981; font-size: 20px;">Order Details</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">Order #<span style="color: #10b981; font-family: monospace; font-weight: bold;">${data.orderId}</span></p>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                  <th style="padding: 15px 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                  <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">$${data.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            ${shippingHTML}
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>What's next?</strong><br>
              We're preparing your order for shipment. You'll receive a shipping confirmation email with tracking information once your order is on its way.
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">
            Thank you for shopping with Panhandle Pathway!
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions about your order, feel free to reply to this email.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Panhandle Pathway | Your trusted partner</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </body>
    </html>
  `;
}

function getBookingReminderHTML(data: BookingEmailData): string {
  const formattedDate = new Date(data.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedStartTime = new Date(data.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Reminder: Upcoming Booking</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName},</p>

          <p style="font-size: 16px; margin-bottom: 30px;">
            This is a friendly reminder about your upcoming booking tomorrow!
          </p>

          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #f59e0b; font-size: 20px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedStartTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #f59e0b; font-family: monospace;">#${data.bookingId}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Please remember:</strong> Arrive 10 minutes early. If you need to cancel or reschedule, please do so as soon as possible.
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            We're looking forward to seeing you tomorrow!
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Panhandle Pathway | Your trusted partner</p>
        </div>
      </body>
    </html>
  `;
}
