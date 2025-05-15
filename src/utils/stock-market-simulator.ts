// stock-market-simulator.ts

export enum ScenarioType {
    BEST = 'BEST',
    AVERAGE = 'AVERAGE',
    WORST = 'WORST',
}

export interface MonthlyStockValue {
    month: number;                  // Month number (0 for initial state)
    portfolioValue: number;         // Value of the portfolio at the end of this month
    totalAmountInvested: number;    // Cumulative sum of initial investment + all monthly deposits up to this month
    monthlyReturnApplied: number;   // The actual percentage return applied for this month (as decimal, e.g., 0.01 for 1%)
}

export class StockMarketSimulator {

    // Scenario adjustment factors - these can be tuned further
    // BEST Case: Higher mean return, slightly lower volatility, random component always positive
    private readonly BEST_CASE_RETURN_MULTIPLIER = 1.5; // e.g., expected return is 50% higher
    private readonly BEST_CASE_VOL_MULTIPLIER = 0.6;    // e.g., volatility is 60% of original for smoother upward trend

    // WORST Case: Lower/negative mean return, potentially higher volatility for inconsistency
    private readonly WORST_CASE_RETURN_MULTIPLIER = 0.3; // e.g., expected return is 30% of original
    private readonly WORST_CASE_ADDITIONAL_NEGATIVE_BIAS = -0.0075; // Additional fixed reduction to monthly mean return (e.g. -0.75% per month)
    private readonly WORST_CASE_VOL_MULTIPLIER = 1.25;   // e.g., volatility is 25% higher

    /**
     * Generates a random number from a standard normal distribution (mean 0, stddev 1).
     * Uses the Box-Muller transform.
     * Clipped to +/- 3.5 std devs to avoid overly extreme single-month events in this model.
     */
    private generateStandardNormalRandom(): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return Math.max(-3.5, Math.min(3.5, num)); // Clip to a reasonable range
    }

    /**
     * Simulates monthly stock market investment with regular contributions under different scenarios.
     *
     * @param initialInvestmentAmount The initial amount invested at month 0.
     * @param monthlyInvestmentAmount The fixed amount invested at the start of each subsequent month.
     * @param annualExpectedReturn The average expected annual return (e.g., 0.08 for 8%).
     * @param annualVolatility The annual volatility (standard deviation) of returns (e.g., 0.15 for 15%).
     * @param investmentDurationInMonths The total number of months to simulate.
     * @param scenario The scenario to simulate (BEST, AVERAGE, WORST).
     * @returns An array of objects, each representing the state of the investment at the end of a month.
     */
    public simulateInvestment(
        initialInvestmentAmount: number,
        monthlyInvestmentAmount: number,
        annualExpectedReturn: number,
        annualVolatility: number,
        investmentDurationInMonths: number,
        scenario: ScenarioType
    ): MonthlyStockValue[] {

        // --- Input Validation ---
        if (initialInvestmentAmount < 0) {
            throw new Error("Initial investment amount cannot be negative.");
        }
        if (monthlyInvestmentAmount < 0) {
            throw new Error("Monthly investment amount cannot be negative.");
        }
        if (annualVolatility < 0) {
            throw new Error("Annual volatility cannot be negative.");
        }
        if (investmentDurationInMonths < 0 || !Number.isInteger(investmentDurationInMonths)) {
            throw new Error("Investment duration in months must be a non-negative integer.");
        }

        // --- Monthly Parameter Calculation ---
        const monthlyExpectedReturn = annualExpectedReturn / 12;
        const monthlyVolatility = annualVolatility / Math.sqrt(12);

        let portfolioValue = initialInvestmentAmount;
        let totalAmountInvested = initialInvestmentAmount;

        const results: MonthlyStockValue[] = [];

        // Log initial state (Month 0)
        results.push({
            month: 0,
            portfolioValue: parseFloat(portfolioValue.toFixed(2)),
            totalAmountInvested: parseFloat(totalAmountInvested.toFixed(2)),
            monthlyReturnApplied: 0, // No return applied at month 0
        });

        if (investmentDurationInMonths === 0) {
            return results;
        }

        // --- Monthly Simulation Loop ---
        for (let m = 1; m <= investmentDurationInMonths; m++) {
            // 1. Add monthly deposit at the start of the month's calculation period
            // (before calculating growth for this month)
            portfolioValue += monthlyInvestmentAmount;
            totalAmountInvested += monthlyInvestmentAmount;

            // 2. Determine actual monthly return based on scenario
            let actualMonthlyReturn = 0;
            const randomFactor = this.generateStandardNormalRandom(); // Random N(0,1) value

            switch (scenario) {
                case ScenarioType.BEST:
                    const bestCaseMean = monthlyExpectedReturn * this.BEST_CASE_RETURN_MULTIPLIER;
                    const bestCaseVol = monthlyVolatility * this.BEST_CASE_VOL_MULTIPLIER;
                    // Add a scaled positive random component to the boosted mean
                    actualMonthlyReturn = bestCaseMean + Math.abs(randomFactor) * bestCaseVol;
                    break;

                case ScenarioType.WORST:
                    const worstCaseMean = (monthlyExpectedReturn * this.WORST_CASE_RETURN_MULTIPLIER) + this.WORST_CASE_ADDITIONAL_NEGATIVE_BIAS;
                    const worstCaseVol = monthlyVolatility * this.WORST_CASE_VOL_MULTIPLIER;
                    actualMonthlyReturn = worstCaseMean + randomFactor * worstCaseVol;
                    break;

                case ScenarioType.AVERAGE:
                default:
                    actualMonthlyReturn = monthlyExpectedReturn + randomFactor * monthlyVolatility;
                    break;
            }

            // Cap loss at 100% for the month (portfolio can't go below 0 from market loss alone in one step)
            actualMonthlyReturn = Math.max(-1, actualMonthlyReturn);

            // 3. Apply growth/loss to the portfolio
            const growthAmount = portfolioValue * actualMonthlyReturn;
            portfolioValue += growthAmount;

            // Ensure portfolio value doesn't go below zero (e.g. after fees or if model allowed debt)
            // In this model, it means you can't lose more than you have.
            portfolioValue = Math.max(0, portfolioValue);

            // 4. Log results for the current month
            results.push({
                month: m,
                portfolioValue: parseFloat(portfolioValue.toFixed(2)),
                totalAmountInvested: parseFloat(totalAmountInvested.toFixed(2)),
                monthlyReturnApplied: parseFloat(actualMonthlyReturn.toFixed(4)), // Store with more precision
            });
        }
        return results;
    }
}

// Example Usage
/*
try {
    const simulator = new StockMarketSimulator();

    const initial = 1000;
    const monthly = 100;
    const expectedReturn = 0.08; // 8% per year
    const volatility = 0.15;     // 15% per year
    const months = 24;           // 2 years

    console.log(`\nSimulating Stock Investment`);
    console.log(`Initial: $${initial}, Monthly: $${monthly}, Return: ${expectedReturn*100}%, Vol: ${volatility*100}%, Months: ${months}`);

    // AVERAGE Case
    console.log("\nAVERAGE SCENARIO");
    const averageResults = simulator.simulateInvestment(initial, monthly, expectedReturn, volatility, months, ScenarioType.AVERAGE);
    averageResults.forEach(r => {
        console.log(`Month ${r.month}: Value $${r.portfolioValue.toFixed(2)}, Invested $${r.totalAmountInvested.toFixed(2)}, Return Applied: ${(r.monthlyReturnApplied * 100).toFixed(2)}%`);
    });

    // BEST Case
    console.log("\nBEST SCENARIO");
    const bestResults = simulator.simulateInvestment(initial, monthly, expectedReturn, volatility, months, ScenarioType.BEST);
    bestResults.forEach(r => {
        console.log(`Month ${r.month}: Value $${r.portfolioValue.toFixed(2)}, Invested $${r.totalAmountInvested.toFixed(2)}, Return Applied: ${(r.monthlyReturnApplied * 100).toFixed(2)}%`);
    });

    // WORST Case
    console.log("\nWORST SCENARIO");
    const worstResults = simulator.simulateInvestment(initial, monthly, expectedReturn, volatility, months, ScenarioType.WORST);
    worstResults.forEach(r => {
        console.log(`Month ${r.month}: Value $${r.portfolioValue.toFixed(2)}, Invested $${r.totalAmountInvested.toFixed(2)}, Return Applied: ${(r.monthlyReturnApplied * 100).toFixed(2)}%`);
    });

    // Example: Zero volatility (should show predictable growth based on scenario mean)
    console.log("\nZERO VOLATILITY TEST (AVERAGE SCENARIO)");
    const zeroVolResults = simulator.simulateInvestment(1000, 100, 0.05, 0, 12, ScenarioType.AVERAGE);
     zeroVolResults.forEach(r => {
        console.log(`Month ${r.month}: Value $${r.portfolioValue.toFixed(2)}, Invested $${r.totalAmountInvested.toFixed(2)}, Return Applied: ${(r.monthlyReturnApplied * 100).toFixed(2)}%`);
    });


} catch (error) {
    if (error instanceof Error) {
        console.error("Error during stock simulation:", error.message);
    } else {
        console.error("An unknown error occurred during stock simulation:", error);
    }
}
*/
