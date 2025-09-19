
import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const success = await sendTelegramMessage(message);

    if (success) {
      return NextResponse.json({ message: 'Notification sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
