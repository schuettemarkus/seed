import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const stripe = new Stripe(stripeKey)
  const { userId, email, returnUrl } = req.body

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required' })
  }

  try {
    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 })
    let customerId: string

    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id
    }

    // Look up the pro price — find the first active price on a product named "Seed Pro"
    const prices = await stripe.prices.list({ active: true, limit: 20 })
    const proPrice = prices.data.find(
      (p) => p.recurring?.interval === 'month' && p.unit_amount === 999,
    )

    if (!proPrice) {
      return res.status(500).json({
        error: 'No $9.99/month price found in Stripe. Create a product with a $9.99/mo recurring price.',
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: proPrice.id, quantity: 1 }],
      success_url: `${returnUrl ?? 'https://seed-kohl.vercel.app'}/settings?billing=success`,
      cancel_url: `${returnUrl ?? 'https://seed-kohl.vercel.app'}/pricing`,
      metadata: { supabase_user_id: userId },
      subscription_data: {
        metadata: { supabase_user_id: userId },
        trial_period_days: 14,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
