import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Client } from 'pg'

async function getDb() {
  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })
  await client.connect()
  return client
}

export const config = { api: { bodyParser: false } }

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const stripe = new Stripe(stripeKey)
  const sig = req.headers['stripe-signature'] as string
  const body = await buffer(req)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const db = await getDb()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (userId && session.customer) {
          await db.query(
            `UPDATE parents SET subscription_tier = 'pro', stripe_customer_id = $1 WHERE id = $2`,
            [session.customer as string, userId],
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (userId) {
          const tier = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free'
          await db.query(
            `UPDATE parents SET subscription_tier = $1 WHERE id = $2`,
            [tier, userId],
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (userId) {
          await db.query(
            `UPDATE parents SET subscription_tier = 'free' WHERE id = $1`,
            [userId],
          )
        }
        break
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  } finally {
    await db.end()
  }
}
