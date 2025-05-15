export enum ScenarioType {
    BEST = 'BEST',
    AVERAGE = 'AVERAGE',
    WORST = 'WORST',
}

interface Stock {
    name: string;
    geometricMean: number;  // Expected ANNUAL return as decimal
    volatility: number;     // ANNUAL volatility as decimal
}

interface BankAccount {
    name: string;
    interestRate: number;   // ANNUAL interest rate as decimal
}

// Interface for the monthly state of the simulation
interface MonthlySimulatedPortfolioState {
    month: number;
    stockValues: { [stockName: string]: number }; // Dollar value of each stock holding
    bankValue: number;                            // Dollar value of bank holding
    totalPortfolioValue: number;                  // Sum of all holdings
    totalCapitalInvested: number;                 // Cumulative sum of initial + all monthly deposits
}

interface StockAllocationResult {
    name: string;
    amount: number;
    weightInBasket: number;
    weightInTotal: number;
}

interface PortfolioAllocationResult {
    stocks: StockAllocationResult[];
    bankAllocation: { name: string; amount: number; weightInTotal: number; };
    basketMetrics: { expectedReturn: number; volatility: number; sharpeRatio?: number; };
    targetPortfolioVolatility: number;
    totalInvestment: number;
}

class PortfolioCalculator {
    private readonly MIN_INTEREST_RATE = 0.01;
    private readonly MAX_INTEREST_RATE = 0.076;
    private readonly DEFAULT_CORRELATION = 0.6;

    public calculateAllocation(
        totalAmount: number,
        stocks: Stock[],
        bankAccount: BankAccount,
        targetPortfolioVolatility: number,
        correlation: number = this.DEFAULT_CORRELATION
    ): PortfolioAllocationResult {
        this.validateInputs(totalAmount, stocks, bankAccount, targetPortfolioVolatility, correlation);

        if (stocks.length === 0) {
            if (targetPortfolioVolatility === 0) {
                // If no stocks and target volatility is zero, 100% must be in the bank account.
                return {
                    stocks: [],
                    bankAllocation: {
                        name: bankAccount.name,
                        amount: totalAmount,
                        weightInTotal: totalAmount > 0 ? 100 : 0, // Avoid 100% if totalAmount is 0
                    },
                    basketMetrics: {
                        expectedReturn: 0,
                        volatility: 0,
                        sharpeRatio: 0,
                    },
                    targetPortfolioVolatility: 0,
                    totalInvestment: totalAmount,
                };
            } else {
                throw new Error(
                    `Cannot achieve target volatility of ${targetPortfolioVolatility * 100}% with no stocks available for investment.`
                );
            }
        }

        const riskFreeRate = bankAccount.interestRate;
        const stockSharpeRatios = this.calculateStockSharpeRatios(stocks, riskFreeRate);
        const basketWeights = this.calculateBasketWeights(stockSharpeRatios, stocks.map(s => s.name));
        const basketMetrics = this.calculateBasketMetrics(stocks, basketWeights, riskFreeRate, correlation);

        let basketWeightInPortfolio: number;
        if (basketMetrics.volatility === 0) {
            // Basket has zero volatility.
            // If target is also zero, then it depends on whether basket return > risk-free rate.
            if (targetPortfolioVolatility === 0) {
                // If basket return is better, take it (100% basket, 0% bank).
                // If bank is better or equal, take bank (0% basket, 100% bank).
                basketWeightInPortfolio = (basketMetrics.expectedReturn > riskFreeRate) ? 1 : 0;
            } else {
                // Basket has zero vol, but target is non-zero. This is unachievable.
                throw new Error(
                    `Cannot achieve target volatility of ${targetPortfolioVolatility * 100}% because the stock basket has zero volatility, and the target is non-zero.`
                );
            }
        } else {
            // Basket has non-zero volatility, can target.
            basketWeightInPortfolio = targetPortfolioVolatility / basketMetrics.volatility;
        }

        const bankWeightInPortfolio = 1 - basketWeightInPortfolio;
        const totalAllocatedToBasket = totalAmount * basketWeightInPortfolio;
        const totalAllocatedToBank = totalAmount * bankWeightInPortfolio;

        const stockAllocationResults: StockAllocationResult[] = stocks.map((stock, index) => ({
            name: stock.name,
            amount: totalAllocatedToBasket * basketWeights[index],
            weightInBasket: basketWeights[index] * 100,
            weightInTotal: basketWeights[index] * basketWeightInPortfolio * 100,
        }));

        return {
            stocks: stockAllocationResults,
            bankAllocation: {
                name: bankAccount.name,
                amount: totalAllocatedToBank,
                weightInTotal: bankWeightInPortfolio * 100,
            },
            basketMetrics: {
                expectedReturn: basketMetrics.expectedReturn * 100,
                volatility: basketMetrics.volatility * 100,
                sharpeRatio: basketMetrics.sharpeRatio,
            },
            targetPortfolioVolatility: targetPortfolioVolatility * 100,
            totalInvestment: totalAmount,
        };
    }

    private validateInputs( totalAmount: number, stocks: Stock[], bankAccount: BankAccount, targetPortfolioVolatility: number, correlation: number ): void {
        // Allow totalAmount to be 0 for initial setup, but if stocks are involved and amount is <=0 for allocation, it's an issue.
        if (totalAmount < 0) { // Changed from totalAmount <= 0
             throw new Error("Total investment amount cannot be negative.");
        }
        if (totalAmount === 0 && stocks.length > 0 && targetPortfolioVolatility > 0) {
            // This scenario is tricky. If you have 0 amount but want to calculate weights for a target vol,
            // the amounts will be 0. The current structure handles this by returning 0 amounts.
            // If totalAmount is 0, weights in total are less meaningful until an amount is applied.
        }

        stocks.forEach(stock => {
            if (stock.volatility <= 0) {
                throw new Error(`Volatility for stock ${stock.name} must be positive.`);
            }
            if (typeof stock.geometricMean !== 'number' || typeof stock.volatility !== 'number' || !stock.name) {
                throw new Error(`Invalid data for stock: ${JSON.stringify(stock)}. Ensure name, geometricMean, and volatility are correctly defined.`);
            }
        });
        if (bankAccount.interestRate < this.MIN_INTEREST_RATE || bankAccount.interestRate > this.MAX_INTEREST_RATE) {
            throw new Error(
                `Bank interest rate must be between ${this.MIN_INTEREST_RATE * 100}% and ${this.MAX_INTEREST_RATE * 100}%. Received: ${bankAccount.interestRate * 100}%`
            );
        }
        if (targetPortfolioVolatility < 0) {
            throw new Error("Target portfolio volatility cannot be negative.");
        }
         if (correlation < -1 || correlation > 1) {
            throw new Error(`Correlation coefficient must be between -1 and 1. Received: ${correlation}`);
        }
    }

    private calculateStockSharpeRatios(stocks: Stock[], riskFreeRate: number): number[] {
        return stocks.map(stock => {
            if (stock.volatility === 0) { return (stock.geometricMean - riskFreeRate) > 0 ? Infinity : (stock.geometricMean - riskFreeRate) < 0 ? -Infinity : 0; }
            return (stock.geometricMean - riskFreeRate) / stock.volatility;
        });
    }

    private calculateBasketWeights(stockSharpeRatios: number[], stockNames: string[]): number[] {
        const positiveSharpeRatios = stockSharpeRatios.filter(r => r > 0);
        const sumPositiveSharpe = positiveSharpeRatios.reduce((sum, ratio) => sum + ratio, 0);

        if (sumPositiveSharpe === 0) {
            // No stocks with positive Sharpe ratios.
            // If all Sharpe ratios are <= 0:
            if (stockSharpeRatios.every(ratio => ratio <= 0)) {
                // If there are any stocks, distribute equally among them.
                // This is a neutral stance when no stock is "better" based on Sharpe.
                // Or, one might argue to not invest in stocks at all if all Sharpe <=0.
                // For now, equal weight if any stocks exist.
                return stockSharpeRatios.length > 0 ? stockSharpeRatios.map(() => 1 / stockSharpeRatios.length) : [];
            }
            // This case (some positive, some negative, summing to zero or less for positive ones)
            // implies an issue or a very specific scenario not typically handled by simple Sharpe weighting.
            // The original code threw an error if totalSharpe was 0 due to cancelling ratios.
            // We now focus on positive Sharpe ratios for weighting.
            throw new Error(
                "Cannot determine Sharpe-weighted basket weights: Sum of positive Sharpe ratios is zero. Consider alternative weighting or if stocks are suitable."
            );
        }
        // Weight only based on stocks with positive Sharpe ratios
        return stockSharpeRatios.map(ratio => (ratio > 0 ? ratio / sumPositiveSharpe : 0));
    }

    private calculateBasketMetrics( stocks: Stock[], basketWeights: number[], riskFreeRate: number, correlation: number ): { expectedReturn: number; volatility: number; sharpeRatio?: number } {
        const basketExpectedReturn = stocks.reduce( (sum, stock, index) => sum + basketWeights[index] * stock.geometricMean, 0 );
        let basketVariance = 0;
        for (let i = 0; i < stocks.length; i++) {
            basketVariance += Math.pow(basketWeights[i], 2) * Math.pow(stocks[i].volatility, 2);
            for (let j = i + 1; j < stocks.length; j++) {
                basketVariance += 2 * basketWeights[i] * basketWeights[j] * stocks[i].volatility * stocks[j].volatility * correlation;
            }
        }
        const basketVolatility = Math.sqrt(basketVariance);
        let basketSharpeRatio: number | undefined = undefined;
        if (basketVolatility > 0) {
            basketSharpeRatio = (basketExpectedReturn - riskFreeRate) / basketVolatility;
        } else if (basketExpectedReturn - riskFreeRate === 0) {
             basketSharpeRatio = 0; // Neutral Sharpe if no excess return and no vol
        } else {
            // Zero volatility but non-zero excess return
            basketSharpeRatio = (basketExpectedReturn > riskFreeRate) ? Infinity : -Infinity;
        }
        return { expectedReturn: basketExpectedReturn, volatility: basketVolatility, sharpeRatio: basketSharpeRatio };
    }
}

export class AdvancedPortfolioSimulator {
    private portfolioCalc: PortfolioCalculator;

    private readonly BEST_CASE_RETURN_MULTIPLIER = 1.5;
    private readonly BEST_CASE_VOL_MULTIPLIER = 0.6;
    private readonly WORST_CASE_RETURN_MULTIPLIER = 0.3;
    private readonly WORST_CASE_ADDITIONAL_NEGATIVE_BIAS = -0.0075; // Monthly bias
    private readonly WORST_CASE_VOL_MULTIPLIER = 1.25;

    constructor() {
        this.portfolioCalc = new PortfolioCalculator();
    }

    private generateStandardNormalRandom(): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return Math.max(-3.5, Math.min(3.5, num)); // Clip to +/- 3.5 std dev
    }

    public simulateInvestmentStrategy(
        initialInvestment: number,
        monthlyDeposit: number,
        stocks: Stock[],
        bankAccount: BankAccount,
        targetOverallVolatility: number,
        durationInMonths: number,
        scenario: ScenarioType,
        correlation: number = 0.6
    ): MonthlySimulatedPortfolioState[] {

        if (initialInvestment < 0) throw new Error("Initial investment cannot be negative.");
        if (monthlyDeposit < 0) throw new Error("Monthly deposit cannot be negative.");
        if (durationInMonths < 0 || !Number.isInteger(durationInMonths)) {
            throw new Error("Duration must be a non-negative integer.");
        }
        if (stocks.length === 0 && targetOverallVolatility > 0) {
            throw new Error("Cannot achieve a non-zero target volatility with no stocks.");
        }


        const history: MonthlySimulatedPortfolioState[] = [];
        let currentStockHoldings: { [name: string]: number } = {};
        stocks.forEach(s => currentStockHoldings[s.name] = 0);
        let currentBankHolding: number = 0;
        let cumulativeCapitalInvested = 0;

        // --- Month 0: Initial Setup & Allocation ---
        if (initialInvestment > 0) {
            cumulativeCapitalInvested = initialInvestment;
            try {
                const initialAlloc = this.portfolioCalc.calculateAllocation(
                    initialInvestment, stocks, bankAccount, targetOverallVolatility, correlation
                );
                initialAlloc.stocks.forEach(sAlloc => { currentStockHoldings[sAlloc.name] = sAlloc.amount; });
                currentBankHolding = initialAlloc.bankAllocation.amount;
            } catch (e) {
                 console.warn(`Month 0: Could not calculate initial allocation: ${(e as Error).message}. Defaulting to all in bank.`);
                 currentBankHolding = initialInvestment;
                 stocks.forEach(s => currentStockHoldings[s.name] = 0);
            }
        }

        history.push({
            month: 0,
            stockValues: { ...currentStockHoldings },
            bankValue: currentBankHolding,
            totalPortfolioValue: Object.values(currentStockHoldings).reduce((a, b) => a + b, 0) + currentBankHolding,
            totalCapitalInvested: cumulativeCapitalInvested,
        });

        if (durationInMonths === 0) return history;

        // --- Monthly Simulation Loop ---
        for (let m = 1; m <= durationInMonths; m++) {
            // 1. Simulate Growth on Existing Holdings
            const grownStockHoldings: { [name: string]: number } = {};

            for (const stock of stocks) {
                const monthlyExpectedReturn = stock.geometricMean / 12;
                const monthlyVolatility = stock.volatility / Math.sqrt(12);
                const randomFactor = this.generateStandardNormalRandom();
                let actualMonthlyReturn = 0;

                switch (scenario) {
                    case ScenarioType.BEST:
                        const bestMean = monthlyExpectedReturn * this.BEST_CASE_RETURN_MULTIPLIER;
                        const bestVol = monthlyVolatility * this.BEST_CASE_VOL_MULTIPLIER;
                        actualMonthlyReturn = bestMean + Math.abs(randomFactor) * bestVol; // Use Math.abs for consistently positive random shock in best case
                        break;
                    case ScenarioType.WORST:
                        const worstMean = (monthlyExpectedReturn * this.WORST_CASE_RETURN_MULTIPLIER) + this.WORST_CASE_ADDITIONAL_NEGATIVE_BIAS;
                        const worstVol = monthlyVolatility * this.WORST_CASE_VOL_MULTIPLIER;
                        actualMonthlyReturn = worstMean + randomFactor * worstVol; // randomFactor can be negative here
                        break;
                    case ScenarioType.AVERAGE:
                    default:
                        actualMonthlyReturn = monthlyExpectedReturn + randomFactor * monthlyVolatility;
                        break;
                }
                actualMonthlyReturn = Math.max(-1, actualMonthlyReturn); // Cap loss at -100% for the month
                grownStockHoldings[stock.name] = (currentStockHoldings[stock.name] || 0) * (1 + actualMonthlyReturn);
            }

            const monthlyBankRate = bankAccount.interestRate / 12;
            // Bank interest applies to positive balances; debt might accrue at a different (higher) rate,
            // but for simplicity, we use the same rate or assume it's part of the "bank" cost.
            const grownBankHolding = currentBankHolding * (1 + monthlyBankRate);

            // 2. Calculate Portfolio Value After Growth
            let valueAfterGrowth = Object.values(grownStockHoldings).reduce((a, b) => a + b, 0) + grownBankHolding;

            // 3. Add New Monthly Deposit
            cumulativeCapitalInvested += monthlyDeposit;
            const totalCapitalForReallocation = valueAfterGrowth + monthlyDeposit;

            // 4. Re-calculate Target Allocation & Rebalance
            if (totalCapitalForReallocation > 0) {
                try {
                    const newAlloc = this.portfolioCalc.calculateAllocation(
                        totalCapitalForReallocation, stocks, bankAccount, targetOverallVolatility, correlation
                    );
                    newAlloc.stocks.forEach(sAlloc => { currentStockHoldings[sAlloc.name] = sAlloc.amount; });
                    currentBankHolding = newAlloc.bankAllocation.amount;
                } catch (e) {
                    console.warn(`Month ${m}: Re-allocation failed: ${(e as Error).message}. Holding grown values and adding deposit to bank portion.`);
                    // Fallback: keep stock values as they grew. The remainder of totalCapitalForReallocation
                    // (which includes the new deposit) effectively goes to the bank portion.
                    currentStockHoldings = { ...grownStockHoldings };
                    let sumOfGrownStocks = 0;
                    for (const stockName in grownStockHoldings) {
                        sumOfGrownStocks += grownStockHoldings[stockName];
                    }
                    currentBankHolding = totalCapitalForReallocation - sumOfGrownStocks;
                }
            } else { // totalCapitalForReallocation <= 0 (Portfolio wiped out or in debt)
                // All assets are effectively liquidated (or considered valueless against the debt).
                // The remaining totalCapitalForReallocation is the net debt (if negative) or zero.
                // This amount is now entirely in the "bank" as a negative balance (debt).
                stocks.forEach(s => currentStockHoldings[s.name] = 0);
                currentBankHolding = totalCapitalForReallocation; // Persists debt
            }
            
            // Ensure individual stock holdings are not negative (e.g. due to extreme rounding).
            // Bank holding can be negative (representing debt/leverage).
            Object.keys(currentStockHoldings).forEach(key => {
                currentStockHoldings[key] = Math.max(0, currentStockHoldings[key]);
            });
            // DO NOT do Math.max(0, currentBankHolding) here if leverage is allowed.

            const currentTotalValue = Object.values(currentStockHoldings).reduce((a, b) => a + b, 0) + currentBankHolding;

            // Sanity check: currentTotalValue should be very close to totalCapitalForReallocation if allocation succeeded,
            // or reflect the post-growth/deposit state if allocation failed or portfolio was wiped.
            // Small discrepancies due to floating point arithmetic are possible.
            if (Math.abs(currentTotalValue - totalCapitalForReallocation) > 1e-5 && totalCapitalForReallocation > 0) { // 1e-5 is a small tolerance
                 // console.warn(`Month ${m}: Discrepancy between currentTotalValue (${currentTotalValue.toFixed(2)}) and totalCapitalForReallocation (${totalCapitalForReallocation.toFixed(2)})`);
                 // This might happen if allocation logic has an issue or due to the fallback.
                 // Forcing consistency if a significant discrepancy:
                 // If currentBankHolding was calculated from a successful allocation, it should be fine.
                 // If from fallback, it was totalCapitalForReallocation - sumOfGrownStocks.
                 // If from wipeout, currentBankHolding = totalCapitalForReallocation, and stocks are 0.
                 // The sum should naturally equal totalCapitalForReallocation.
            }


            history.push({
                month: m,
                stockValues: { ...currentStockHoldings }, // Store copies
                bankValue: parseFloat(currentBankHolding.toFixed(2)),
                totalPortfolioValue: parseFloat(currentTotalValue.toFixed(2)),
                totalCapitalInvested: parseFloat(cumulativeCapitalInvested.toFixed(2)),
            });
        }
        return history;
    }
}

// Example Usage (Illustrative - you'd replace with your actual inputs)
/*
const simulator = new AdvancedPortfolioSimulator();

const myStocks: Stock[] = [
    { name: "NIVIDA", geometricMean: 0.45, volatility: 0.5251 }, // Hypothetical annual numbers
    { name: "SMP500", geometricMean: 0.10, volatility: 0.1266 }  // Hypothetical annual numbers
];

const myBankAccount: BankAccount = {
    name: "My Savings",
    interestRate: 0.03 // 3% annual
};

const results = simulator.simulateInvestmentStrategy(
    10000,        // initialInvestment
    500,          // monthlyDeposit
    myStocks,
    myBankAccount,
    0.15,         // targetOverallVolatility (e.g., 15%)
    36,           // durationInMonths
    ScenarioType.AVERAGE,
    0.3           // correlation
);

console.log(results[results.length-1]);

// Test with high volatility target
const highVolResults = simulator.simulateInvestmentStrategy(
    10000,
    500,
    myStocks,
    myBankAccount,
    1.0, // 100% target volatility (implies high leverage)
    36,
    ScenarioType.AVERAGE,
    0.3
);
console.log("High Volatility Target:", highVolResults[highVolResults.length-1]);

// Test with 0 stocks
const noStockResults = simulator.simulateInvestmentStrategy(
    10000,
    500,
    [], // No stocks
    myBankAccount,
    0, // Target volatility must be 0 if no stocks
    12,
    ScenarioType.AVERAGE
);
console.log("No Stocks:", noStockResults[noStockResults.length-1]);

try {
    const invalidNoStockResults = simulator.simulateInvestmentStrategy(
        10000,
        500,
        [], // No stocks
        myBankAccount,
        0.05, // Target volatility > 0 with no stocks should fail
        12,
        ScenarioType.AVERAGE
    );
    console.log("Invalid No Stocks (should not reach here):", invalidNoStockResults[invalidNoStockResults.length-1]);
} catch (e) {
    console.error("Error with invalid no-stock scenario:", (e as Error).message);
}
*/