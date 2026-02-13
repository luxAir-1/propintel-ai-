import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class FinancialsService {
  constructor(private prisma: PrismaService) {}

  async calculate(userId: string, listingId: string, data: any) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.userId !== userId) {
      throw new NotFoundException('Listing not found');
    }

    // Calculate financial metrics
    const purchasePrice = data.purchasePrice || listing.price;
    const downPaymentPercent = data.downPaymentPercent || 20;
    const interestRate = data.interestRate || 0.065;
    const loanTerm = data.loanTerm || 360; // 30 years
    const rentalIncome = data.rentalIncome || 0;
    const vacancyRate = data.vacancyRate || 0.05;
    const monthlyExpenses = data.monthlyExpenses || 0;

    const downPayment = (purchasePrice * downPaymentPercent) / 100;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);

    const effectiveIncome = rentalIncome * (1 - vacancyRate);
    const totalMonthlyExpenses = monthlyPayment + monthlyExpenses;
    const monthlyProfit = effectiveIncome - totalMonthlyExpenses;
    const annualProfit = monthlyProfit * 12;

    const capRate = ((rentalIncome * 12) / purchasePrice) * 100;
    const roiPercent = (annualProfit / downPayment) * 100;

    // Create or update financials
    const financials = await this.prisma.propertyFinancials.upsert({
      where: { listingId },
      create: {
        listingId,
        userId,
        purchasePrice,
        downPaymentPercent,
        loanAmount: Math.round(loanAmount),
        interestRate,
        loanTerm,
        monthlyPayment: Math.round(monthlyPayment),
        rentalIncome,
        vacancyRate: vacancyRate * 100,
        monthlyExpenses,
        cashFlow: Math.round(monthlyProfit),
        capRate: parseFloat(capRate.toFixed(2)),
        roiPercent: parseFloat(roiPercent.toFixed(2)),
        projections: this.generate5YearProjections(monthlyProfit),
      },
      update: {
        purchasePrice,
        downPaymentPercent,
        loanAmount: Math.round(loanAmount),
        monthlyPayment: Math.round(monthlyPayment),
        cashFlow: Math.round(monthlyProfit),
        capRate: parseFloat(capRate.toFixed(2)),
        roiPercent: parseFloat(roiPercent.toFixed(2)),
        projections: this.generate5YearProjections(monthlyProfit),
      },
    });

    return financials;
  }

  async getFinancials(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { financials: true },
    });

    if (!listing || listing.userId !== userId) {
      throw new NotFoundException('Listing not found');
    }

    return listing.financials;
  }

  private generate5YearProjections(monthlyProfit: number) {
    const annualProfit = monthlyProfit * 12;
    const growthRate = 0.03; // 3% annual growth

    return {
      year1: Math.round(annualProfit),
      year2: Math.round(annualProfit * Math.pow(1 + growthRate, 1)),
      year3: Math.round(annualProfit * Math.pow(1 + growthRate, 2)),
      year4: Math.round(annualProfit * Math.pow(1 + growthRate, 3)),
      year5: Math.round(annualProfit * Math.pow(1 + growthRate, 4)),
    };
  }
}
