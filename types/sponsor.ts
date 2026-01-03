export interface Sponsor {
  id: string
  name: string
  description: string | null
  logoUrl: string
  targetUrl: string
  isActive: boolean
  priority: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  email: string | null
  stripeSessionId: string | null
}
