interface MonthlyInvestmentValue {
    month: number;
    value: number;                 // Value of the investment at the end of this month
    totalAmountInvested: number;   // Cumulative sum of initial investment + all monthly deposits up to this month
}

export class BankInvestmentSimulatorWithMonthlyDeposits {
    private readonly MIN_ANNUAL_INTEREST_RATE = 0.01;  // 1%
    private readonly MAX_ANNUAL_INTEREST_RATE = 0.0776; // 7.76%

    /**
     * Simulates the monthly compounded growth of an investment in a bank account
     * with additional fixed monthly deposits.
     *
     * @param initialPrincipalAmount - The initial amount to invest at month 0. Can be 0 if starting with first monthly deposit.
     * @param monthlyDepositAmount - The fixed amount to deposit at the start of each month (from month 1 onwards).
     * @param annualInterestRate - The annual interest rate as a decimal (e.g., 0.045 for 4.5%).
     *                             Must be between 1% (0.01) and 7.76% (0.0776).
     * @param numberOfMonths - The total number of months to simulate the investment.
     * @returns An array of objects, where each object contains the month number,
     *          the investment value at the end of that month, and the total amount invested,
     *          all rounded to two decimal places.
     */
    public simulateInvestment(
        initialPrincipalAmount: number,
        monthlyDepositAmount: number,
        annualInterestRate: number,
        numberOfMonths: number
    ): MonthlyInvestmentValue[] {
        // Validate inputs
        if (initialPrincipalAmount < 0) {
            throw new Error("Initial principal amount cannot be negative.");
        }
        if (monthlyDepositAmount < 0) {
            throw new Error("Monthly deposit amount cannot be negative.");
        }
        if (annualInterestRate < this.MIN_ANNUAL_INTEREST_RATE || annualInterestRate > this.MAX_ANNUAL_INTEREST_RATE) {
            throw new Error(
                `Annual interest rate must be between ${this.MIN_ANNUAL_INTEREST_RATE * 100}% and ${this.MAX_ANNUAL_INTEREST_RATE * 100}%. Received: ${annualInterestRate * 100}%`
            );
        }
        if (numberOfMonths < 0 || !Number.isInteger(numberOfMonths)) { // Allow 0 months for initial state only
            throw new Error("Number of months must be a non-negative integer.");
        }

        const monthlyInterestRate = annualInterestRate / 12;
        const results: MonthlyInvestmentValue[] = [];

        let currentValue = initialPrincipalAmount;
        let totalInvested = initialPrincipalAmount;

        // Record initial state (Month 0)
        results.push({
            month: 0,
            value: parseFloat(currentValue.toFixed(2)),
            totalAmountInvested: parseFloat(totalInvested.toFixed(2))
        });

        if (numberOfMonths === 0) {
            return results;
        }

        for (let month = 1; month <= numberOfMonths; month++) {
            // 1. Add monthly deposit at the start of the month
            currentValue += monthlyDepositAmount;
            totalInvested += monthlyDepositAmount;

            // 2. Apply interest for the current month on the new total
            currentValue = currentValue * (1 + monthlyInterestRate);

            results.push({
                month: month,
                value: parseFloat(currentValue.toFixed(2)),
                totalAmountInvested: parseFloat(totalInvested.toFixed(2))
            });
        }

        return results;
    }
}

// Example Usage
/*
try {
    const simulator = new BankInvestmentSimulatorWithMonthlyDeposits();

    // Example 1: Standard case with monthly deposits
    const initial1 = 1000;
    const monthlyDeposit1 = 100;
    const rate1 = 0.0465;       // 4.65% annual interest
    const months1 = 12;         // 1 year

    console.log(`\nSimulation 1`);
    console.log(`Initial: $${initial1.toFixed(2)}, Monthly Deposit: $${monthlyDeposit1.toFixed(2)}, Rate: ${rate1 * 100}% annual, Months: ${months1}`);
    const investmentGrowth1 = simulator.simulateInvestment(initial1, monthlyDeposit1, rate1, months1);

    investmentGrowth1.forEach(record => {
        console.log(`Month ${record.month}: Value $${record.value.toFixed(2)}, Total Invested $${record.totalAmountInvested.toFixed(2)}`);
    });

    // Example 2: Starting with zero initial, only monthly deposits
    const initial2 = 0;
    const monthlyDeposit2 = 200;
    const rate2 = 0.0776;       // 7.76% annual interest (max allowed)
    const months2 = 6;

    console.log(`\nSimulation 2`);
    console.log(`Initial: $${initial2.toFixed(2)}, Monthly Deposit: $${monthlyDeposit2.toFixed(2)}, Rate: ${rate2 * 100}% annual, Months: ${months2}`);
    const investmentGrowth2 = simulator.simulateInvestment(initial2, monthlyDeposit2, rate2, months2);

    investmentGrowth2.forEach(record => {
        console.log(`Month ${record.month}: Value $${record.value.toFixed(2)}, Total Invested $${record.totalAmountInvested.toFixed(2)}`);
    });

    // Example 3: No further monthly deposits, just initial amount (monthlyDeposit = 0)
    const initial3 = 500;
    const monthlyDeposit3 = 0;
    const rate3 = 0.01;         // 1% annual interest (min allowed)
    const months3 = 3;

    console.log(`\nSimulation 3`);
    console.log(`Initial: $${initial3.toFixed(2)}, Monthly Deposit: $${monthlyDeposit3.toFixed(2)}, Rate: ${rate3 * 100}% annual, Months: ${months3}`);
    const investmentGrowth3 = simulator.simulateInvestment(initial3, monthlyDeposit3, rate3, months3);
    investmentGrowth3.forEach(record => {
        console.log(`Month ${record.month}: Value $${record.value.toFixed(2)}, Total Invested $${record.totalAmountInvested.toFixed(2)}`);
    });

} catch (error) {
    if (error instanceof Error) {
        console.error("Error during simulation:", error.message);
    } else {
        console.error("An unknown error occurred:", error);
    }
}
*/