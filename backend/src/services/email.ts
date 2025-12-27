import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send');
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SaddleUp <onboarding@resend.dev>',
      to: email,
      subject: 'Your SaddleUp Login Code',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #78716c;">SaddleUp</h2>
          <p>Your login code is:</p>
          <div style="background: #f5f5f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #292524;">${code}</span>
          </div>
          <p style="color: #78716c; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #78716c; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    console.log('Email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send');
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SaddleUp <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to SaddleUp!',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #78716c;">Welcome to SaddleUp${name ? `, ${name}` : ''}!</h2>
          <p>Thank you for joining SaddleUp, your AI-powered horse training companion.</p>
          <p>Get started by completing your profile and selecting your horsemanship method to receive personalized training plans.</p>
          <p style="color: #78716c; font-size: 14px; margin-top: 30px;">Happy training!</p>
        </div>
      `
    });

    if (error) {
      console.error('Welcome email send error:', error);
      return false;
    }

    console.log('Welcome email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}
