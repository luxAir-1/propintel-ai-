import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });

    this.logger.log('✅ Stripe service initialized');
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        billing_address_collection: 'required',
      });

      this.logger.log(`✅ Created checkout session ${session.id}`);
      return session.url || '';
    } catch (error) {
      this.logger.error('Failed to create checkout session:', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
    try {
      // Search for existing customer
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        this.logger.log(`✅ Found existing customer ${customers.data[0].id}`);
        return customers.data[0].id;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });

      this.logger.log(`✅ Created new customer ${customer.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error('Failed to create/get customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  /**
   * Get subscription details from Stripe
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to retrieve subscription');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`✅ Canceled subscription ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  /**
   * Update subscription (change plan)
   */
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription.items.data[0]) {
        throw new Error('No subscription items found');
      }

      const updated = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });

      this.logger.log(`✅ Updated subscription ${subscriptionId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to update subscription');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): object {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      }

      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get Stripe price information
   */
  async getPrice(priceId: string): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      return price;
    } catch (error) {
      this.logger.error(`Failed to retrieve price ${priceId}:`, error);
      throw new BadRequestException('Failed to retrieve price');
    }
  }

  /**
   * Get payment method
   */
  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to retrieve payment method ${paymentMethodId}:`, error);
      throw new BadRequestException('Failed to retrieve payment method');
    }
  }
}
