import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const { name, description, logoUrl, targetUrl, email } = session.metadata || {}

      if (!name || !logoUrl || !targetUrl || !email) {
        console.error('Missing required metadata in session:', session.id)
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Check if session already processed
      const existing = await prisma.sponsor.findUnique({
        where: { stripeSessionId: session.id },
      })

      if (existing) {
        console.log('Session already processed:', session.id)
        return NextResponse.json({ received: true })
      }

      // Calculate dates
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      // Create sponsor
      await prisma.sponsor.create({
        data: {
          name,
          description: description || null,
          logoUrl,
          targetUrl,
          email,
          stripeSessionId: session.id,
          isActive: true,
          priority: 0,
          startDate,
          endDate,
        },
      })

      console.log('Sponsor created successfully:', name)
    } catch (error) {
      console.error('Error creating sponsor:', error)
      return NextResponse.json(
        { error: 'Failed to create sponsor' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
