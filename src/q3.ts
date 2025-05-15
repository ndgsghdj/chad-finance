// --- Enums and Interfaces ---
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
    // Optional: for detailed analysis
    // appliedStockReturns?: { [stockName: string]: number }; // Actual random return applied to each stock for the month
    // targetAllocations?: PortfolioAllocationResult; // The allocation calculated by PortfolioCalculator for this month
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
    ): PortfolioAllocationResult { // Using the interface defined in the prompt
        this.validateInputs(totalAmount, stocks, bankAccount, targetPortfolioVolatility, correlation);
        const riskFreeRate = bankAccount.interestRate;
        const stockSharpeRatios = this.calculateStockSharpeRatios(stocks, riskFreeRate);
        const basketWeights = this.calculateBasketWeights(stockSharpeRatios, stocks.map(s => s.name));
        const basketMetrics = this.calculateBasketMetrics(stocks, basketWeights, riskFreeRate, correlation);

        let basketWeightInPortfolio: number;
        if (basketMetrics.volatility === 0) {
            if (targetPortfolioVolatility === 0) {
                basketWeightInPortfolio = 0;
                if (basketMetrics.expectedReturn > riskFreeRate) {
                    basketWeightInPortfolio = 1;
                }
            } else {
                throw new Error(
                    `Cannot achieve target volatility of ${targetPortfolioVolatility * 100}% because the stock basket has zero volatility, and target is non-zero.`
                );
            }
        } else {
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
        if (totalAmount <= 0 && stocks.length > 0) {
            throw new Error("Total investment amount must be positive if stocks are involved in allocation.");
        }
        if (stocks.length === 0 && targetPortfolioVolatility > 0 && totalAmount > 0) {
            // If only bank, target vol must be 0.
            // This case is implicitly handled by basket volatility being 0 if no stocks.
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
        const totalSharpe = stockSharpeRatios.reduce((sum, ratio) => sum + ratio, 0);
        if (totalSharpe === 0) {
            if (stockSharpeRatios.every(ratio => ratio === 0)) {
                return stockSharpeRatios.length > 0 ? stockSharpeRatios.map(() => 1 / stockSharpeRatios.length) : [];
            }

             throw new Error(
                "Cannot determine Sharpe-weighted basket weights: Total Sharpe ratio of stocks is zero due to cancelling positive and negative individual Sharpe ratios."
            );
        }
        return stockSharpeRatios.map(ratio => ratio / totalSharpe);
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
             basketSharpeRatio = 0;
        } else {
            basketSharpeRatio = (basketExpectedReturn > riskFreeRate) ? Infinity : -Infinity;
        }
        return { expectedReturn: basketExpectedReturn, volatility: basketVolatility, sharpeRatio: basketSharpeRatio };
    }
}
// Interface for PortfolioAllocationResult (as defined in your prompt)
interface PortfolioAllocationResult {
    stocks: StockAllocationResult[];
    bankAllocation: { name: string; amount: number; weightInTotal: number; };
    basketMetrics: { expectedReturn: number; volatility: number; sharpeRatio?: number; };
    targetPortfolioVolatility: number;
    totalInvestment: number;
}
interface StockAllocationResult { name: string; amount: number; weightInBasket: number; weightInTotal: number;}


// --- Advanced Simulator Class ---
export class AdvancedPortfolioSimulator {
    private portfolioCalc: PortfolioCalculator;

    // Scenario adjustment factors
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
        return Math.max(-3.5, Math.min(3.5, num)); // Clip
    }

    public simulateInvestmentStrategy(
        initialInvestment: number,
        monthlyDeposit: number,
        stocks: Stock[], // Annual figures
        bankAccount: BankAccount, // Annual rate
        targetOverallVolatility: number, // Decimal, e.g., 0.06
        durationInMonths: number,
        scenario: ScenarioType,
        correlation: number = 0.6
    ): MonthlySimulatedPortfolioState[] {

        if (initialInvestment < 0) throw new Error("Initial investment cannot be negative.");
        if (monthlyDeposit < 0) throw new Error("Monthly deposit cannot be negative.");
        if (durationInMonths < 0 || !Number.isInteger(durationInMonths)) {
            throw new Error("Duration must be a non-negative integer.");
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
                 console.warn(`Month 0: Could not calculate initial allocation: ${(e as Error).message}. Starting with all in bank if possible, or 0.`);
                 currentBankHolding = initialInvestment; // Default to bank if allocation fails
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
            // const appliedReturns: { [name: string]: number } = {}; // Optional for detailed output

            for (const stock of stocks) {
                const monthlyExpectedReturn = stock.geometricMean / 12;
                const monthlyVolatility = stock.volatility / Math.sqrt(12);
                const randomFactor = this.generateStandardNormalRandom();
                let actualMonthlyReturn = 0;

                switch (scenario) {
                    case ScenarioType.BEST:
                        const bestMean = monthlyExpectedReturn * this.BEST_CASE_RETURN_MULTIPLIER;
                        const bestVol = monthlyVolatility * this.BEST_CASE_VOL_MULTIPLIER;
                        actualMonthlyReturn = bestMean + Math.abs(randomFactor) * bestVol;
                        break;
                    case ScenarioType.WORST:
                        const worstMean = (monthlyExpectedReturn * this.WORST_CASE_RETURN_MULTIPLIER) + this.WORST_CASE_ADDITIONAL_NEGATIVE_BIAS;
                        const worstVol = monthlyVolatility * this.WORST_CASE_VOL_MULTIPLIER;
                        actualMonthlyReturn = worstMean + randomFactor * worstVol;
                        break;
                    case ScenarioType.AVERAGE:
                    default:
                        actualMonthlyReturn = monthlyExpectedReturn + randomFactor * monthlyVolatility;
                        break;
                }
                actualMonthlyReturn = Math.max(-1, actualMonthlyReturn); // Cap loss
                // appliedReturns[stock.name] = actualMonthlyReturn;
                grownStockHoldings[stock.name] = (currentStockHoldings[stock.name] || 0) * (1 + actualMonthlyReturn);
            }

            const monthlyBankRate = bankAccount.interestRate / 12;
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
                    // If allocation fails (e.g., due to zero total Sharpe and conflicting individual Sharpes),
                    // hold previous allocation proportions or default to all in bank.
                    // For simplicity here, we'll try to maintain proportions or put new money in bank.
                    console.warn(`Month ${m}: Re-allocation failed: ${(e as Error).message}. Holding previous structure or adding to bank.`);
                    // A simple fallback: add new deposit to bank, keep stock values as grown.
                    // This isn't true rebalancing but prevents crash.
                    currentStockHoldings = { ...grownStockHoldings };
                    currentBankHolding = grownBankHolding + monthlyDeposit;
                }
            } else { // Portfolio wiped out
                stocks.forEach(s => currentStockHoldings[s.name] = 0);
                currentBankHolding = 0;
            }
            
            // Ensure no negative values due to extreme rounding or logic errors
            Object.keys(currentStockHoldings).forEach(key => { currentStockHoldings[key] = Math.max(0, currentStockHoldings[key]); });
            currentBankHolding = Math.max(0, currentBankHolding);


            const currentTotalValue = Object.values(currentStockHoldings).reduce((a, b) => a + b, 0) + currentBankHolding;

            history.push({
                month: m,
                stockValues: { ...currentStockHoldings },
                bankValue: parseFloat(currentBankHolding.toFixed(2)),
                totalPortfolioValue: parseFloat(currentTotalValue.toFixed(2)),
                totalCapitalInvested: parseFloat(cumulativeCapitalInvested.toFixed(2)),
                // appliedStockReturns: appliedReturns, // Optional
            });
        }
        return history;
    }
}

// --- Example Usage ---
/*
try {
    const simulator = new AdvancedPortfolioSimulator();

    const myStocks: Stock[] = [
        { name: "TechStock", geometricMean: 0.12, volatility: 0.20 }, // 12% return, 20% vol
        { name: "BlueChip", geometricMean: 0.08, volatility: 0.15 },  // 8% return, 15% vol
    ];
    const myBankAccount: BankAccount = { name: "Savings Plus", interestRate: 0.04 }; // 4%

    const initial = 10000;
    const monthly = 500;
    const targetVol = 0.08; // 8% target portfolio volatility
    const duration = 36;    // 3 years

    console.log(`\nADVANCED SIMULATION`);
    console.log(`Initial: $${initial}, Monthly: $${monthly}, Target Vol: ${targetVol*100}%, Duration: ${duration} months`);

    // AVERAGE Case
    console.log("\nAVERAGE SCENARIO");
    const avgResults = simulator.simulateInvestmentStrategy(initial, monthly, myStocks, myBankAccount, targetVol, duration, ScenarioType.AVERAGE);
    avgResults.slice(0, 5).concat(avgResults.slice(-5)).forEach(r => { // Show first 5 and last 5 months
        let stockDetail = Object.entries(r.stockValues).map(([name, val]) => `${name}: $${val.toFixed(2)}`).join(', ');
        console.log(`M ${r.month}: Total $${r.totalPortfolioValue.toFixed(2)} (Invested $${r.totalCapitalInvested.toFixed(2)}) | Bank: $${r.bankValue.toFixed(2)} | Stocks: [${stockDetail}]`);
    });

    // BEST Case
    console.log("\nBEST SCENARIO");
    const bestResults = simulator.simulateInvestmentStrategy(initial, monthly, myStocks, myBankAccount, targetVol, duration, ScenarioType.BEST);
    bestResults.slice(0, 5).concat(bestResults.slice(-5)).forEach(r => {
        let stockDetail = Object.entries(r.stockValues).map(([name, val]) => `${name}: $${val.toFixed(2)}`).join(', ');
        console.log(`M ${r.month}: Total $${r.totalPortfolioValue.toFixed(2)} (Invested $${r.totalCapitalInvested.toFixed(2)}) | Bank: $${r.bankValue.toFixed(2)} | Stocks: [${stockDetail}]`);
    });

    // WORST Case
    console.log("\nWORST SCENARIO");
    const worstResults = simulator.simulateInvestmentStrategy(initial, monthly, myStocks, myBankAccount, targetVol, duration, ScenarioType.WORST);
    worstResults.slice(0, 5).concat(worstResults.slice(-5)).forEach(r => {
        let stockDetail = Object.entries(r.stockValues).map(([name, val]) => `${name}: $${val.toFixed(2)}`).join(', ');
        console.log(`M ${r.month}: Total $${r.totalPortfolioValue.toFixed(2)} (Invested $${r.totalCapitalInvested.toFixed(2)}) | Bank: $${r.bankValue.toFixed(2)} | Stocks: [${stockDetail}]`);
    });

} catch (error) {
    if (error instanceof Error) {
        console.error("Error during advanced portfolio simulation:", error.message);
    } else {
        console.error("An unknown error occurred:", error);
    }
}
*/