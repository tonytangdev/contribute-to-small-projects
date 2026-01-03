import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

if (!process.env.STRIPE_PRICE_ID) {
  throw new Error('STRIPE_PRICE_ID is not defined')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, logoUrl, targetUrl, email } = body

    // Validate required fields
    if (!name || !logoUrl || !targetUrl || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URLs
    try {
      new URL(logoUrl)
      new URL(targetUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const metadata = {
      name,
      description: description || '',
      logoUrl,
      targetUrl,
      email,
    }

    console.log('Creating checkout with metadata:', metadata)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata,
      success_url: `${origin}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sponsor/cancel`,
    })

    console.log('Session created with ID:', session.id, 'Metadata:', session.metadata)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
