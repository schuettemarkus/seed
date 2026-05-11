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
  const { customerId, returnUrl } = req.body

  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl ?? 'https://seed-kohl.vercel.app/settings',
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return res.status(500).json({ error: 'Failed to create portal session' })
  }
}
