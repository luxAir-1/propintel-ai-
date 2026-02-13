import { Controller, Post, Req, RawBodyRequest, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import Stripe from 'stripe';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);

  constructor(
    private stripeService: StripeService,
    private webhookService: WebhookService,
  ) {}

  @Public()
  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const body = req.rawBody;

      if (!signature || !body) {
        return { received: false, error: 'Missing signature or body' };
      }

      // Verify webhook signature
      const event = this.stripeService.verifyWebhookSignature(
        body.toString(),
        signature,
      ) as Stripe.Event;

      this.logger.log(`📥 Received Stripe webhook: ${event.type}`);

      // Handle specific event types
      switch (event.type) {
        case 'checkout.session.completed':
          await this.webhookService.handleCheckoutSessionCompleted(event);
          break;

        case 'invoice.paid':
          await this.webhookService.handleInvoicePaid(event);
          break;

        case 'invoice.payment_failed':
          await this.webhookService.handleInvoicePaymentFailed(event);
          break;

        case 'customer.subscription.deleted':
          await this.webhookService.handleSubscriptionDeleted(event);
          break;

        case 'customer.subscription.updated':
          await this.webhookService.handleSubscriptionUpdated(event);
          break;

        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }

      return { received: true, event: event.type };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw error;
    }
  }
}
