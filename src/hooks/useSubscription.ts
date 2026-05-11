import { useAuth } from '@/hooks/useAuth'

export function useSubscription() {
  const { parent, loading } = useAuth()

  const tier = parent?.subscription_tier ?? 'free'
  const isPro = tier === 'pro'
  const stripeCustomerId = parent?.stripe_customer_id ?? null

  return { tier, isPro, stripeCustomerId, loading }
}
