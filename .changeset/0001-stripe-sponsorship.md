---
"contribute-to-small-projects": minor
---

# Stripe Sponsorship Integration

Add Stripe payment integration for sponsorships. Sponsors can now pay directly through Stripe checkout and be automatically activated.

Features:
- Sponsor form at /sponsor collecting name, description, logo URL, target URL, email
- Stripe checkout session creation
- Webhook handler for payment confirmation
- Auto-activation of sponsors for 1 month after payment
- Success/cancel pages
- Updated sponsor modal CTA to link to payment flow
