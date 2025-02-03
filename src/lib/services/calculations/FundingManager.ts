export interface OneTimeFunding {
  amount: number;
  payment_date: string;
}

export class FundingManager {
  public static getMonthlyFundings(
    fundings: OneTimeFunding[],
    currentDate: Date
  ): OneTimeFunding[] {
    return fundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
  }

  public static calculateTotalFunding(fundings: OneTimeFunding[]): number {
    return fundings.reduce((sum, funding) => sum + funding.amount, 0);
  }

  public static sortFundingsByDate(fundings: OneTimeFunding[]): OneTimeFunding[] {
    return [...fundings].sort(
      (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
  }
}