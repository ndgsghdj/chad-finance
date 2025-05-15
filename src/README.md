# Investment Portfolio Simulators

This project contains a suite of TypeScript simulators designed to model different investment strategies and scenarios over time. They can help visualize potential outcomes based on various inputs like expected returns, volatility, regular contributions, and risk preferences.

## Core Components & Simulators

The project is primarily composed of the following key scripts:

1.  **`bank-investment-simulator-with-monthly-deposits.ts` (Q1: Bank Savings Simulation)**
2.  **`stock-market-simulator.ts` (Q2: Basic Stock Market Scenario Simulation)**
3.  **`advanced-portfolio-simulator.ts` (Q3: Advanced Dynamic Portfolio Simulation with Scenarios & Integrated Allocation Engine)**

---

### 1. `Q1'

*   **Referred to as:** Q1
*   **Purpose:** Simulates the growth of an investment in a standard bank savings account where interest is compounded monthly. It allows for an initial principal and regular, fixed monthly deposits.
*   **Key Features:**
    *   Applies a fixed annual interest rate, compounded monthly.
    *   Supports an initial investment and ongoing fixed monthly contributions.
    *   Tracks the total value of the investment and the total capital invested over time.
*   **Core Inputs:**
    *   `initialPrincipalAmount`: The starting sum.
    *   `monthlyDepositAmount`: Fixed amount added each month.
    *   `annualInterestRate`: The bank's annual interest rate (decimal).
    *   `numberOfMonths`: The duration of the simulation.
*   **Output:** An array of `MonthlyInvestmentValue` objects, each showing the `month`, `value` (portfolio worth), and `totalAmountInvested`.

---

### 2. `Q2'

*   **Referred to as:** Q2 (an earlier version of a stock simulator)
*   **Purpose:** Simulates investing in a generic stock market (or a single stock fund) with an initial sum and regular monthly contributions. It illustrates potential outcomes under "Best," "Average," and "Worst" case market scenarios by adjusting monthly returns based on expected return, volatility, and scenario-specific biases. This model does *not* involve dynamic allocation with a risk-free asset.
*   **Key Features:**
    *   Models stock growth based on a single set of annual expected return and volatility figures.
    *   Applies scenario logic (Best/Average/Worst) to generate randomized monthly returns.
    *   Includes an initial investment and ongoing fixed monthly contributions.
    *   Tracks the portfolio's value and the total capital invested.
*   **Core Inputs:**
    *   `initialInvestmentAmount`: The starting sum.
    *   `monthlyInvestmentAmount`: Fixed amount added each month.
    *   `annualExpectedReturn`: For the stock/market.
    *   `annualVolatility`: For the stock/market.
    *   `investmentDurationInMonths`: The duration of the simulation.
    *   `scenario`: `ScenarioType.BEST`, `ScenarioType.AVERAGE`, or `ScenarioType.WORST`.
*   **Output:** An array of `MonthlyStockValue` objects, each showing `month`, `portfolioValue`, `totalAmountInvested`, and the `monthlyReturnApplied`.

---

### 3. `Q3.ts'

*   **Referred to as:** Q3
*   **Purpose:** This is the most comprehensive simulator. It models an investment strategy where:
    1.  An investor makes an initial investment and regular monthly deposits.
    2.  The total capital is dynamically allocated each month between a basket of stocks and a bank savings account to meet a target overall portfolio volatility.
    3.  The stock portion of the portfolio grows (or shrinks) based on randomized monthly returns, influenced by "Best," "Average," or "Worst" case scenarios.
    4.  The bank portion grows at its fixed interest rate.
    5.  The entire portfolio is rebalanced monthly to the newly calculated target allocations.
*   **Key Features:**
    *   **Integrated Allocation Engine:** Contains the `PortfolioCalculator` class logic directly within the script. This engine:
        *   Calculates Sharpe Ratios for individual stocks.
        *   Determines Sharpe-weighted allocations for stocks within a "stock basket."
        *   Calculates the expected return and volatility of this stock basket.
        *   Combines the stock basket with a risk-free bank asset to achieve an overall target portfolio volatility.
        *   Outputs the dollar amounts to be allocated to each stock and the bank.
    *   Simulates randomized monthly returns for each stock, adjusted by the chosen `ScenarioType` (Best/Average/Worst).
    *   Bank asset grows at a fixed, compounded monthly rate.
    *   Includes initial investment and ongoing fixed monthly contributions.
    *   Performs monthly rebalancing of the entire portfolio based on the integrated allocation engine's output.
    *   Tracks the dollar value of each stock holding, bank holding, total portfolio value, and total capital invested.
*   **Core Inputs for the Simulation:**
    *   `initialInvestment`: The starting sum.
    *   `monthlyDeposit`: Fixed amount added each month.
    *   `stocks`: Array of `Stock` objects (annual return/volatility).
    *   `bankAccount`: `BankAccount` object (annual rate).
    *   `targetOverallVolatility`: Desired risk level for the total portfolio (decimal).
    *   `durationInMonths`: The simulation period.
    *   `scenario`: `ScenarioType.BEST`, `ScenarioType.AVERAGE`, or `ScenarioType.WORST` (influences stock returns).
    *   `correlation`: Assumed correlation between stock pairs for the allocation logic.
*   **Output:** An array of `MonthlySimulatedPortfolioState` objects, detailing the portfolio's composition and value month by month.

---

## How to Use / Run Scripts

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed.
    *   TypeScript compiler: `npm install -g typescript` (if not already installed).

2.  **Compilation:**
    Navigate to the directory containing the `.ts` files and compile them:
    ```bash
    tsc bank-investment-simulator-with-monthly-deposits.ts
    tsc stock-market-simulator.ts
    tsc advanced-portfolio-simulator.ts
    # Or compile all .ts files:
    # tsc *.ts
    ```
    This will generate corresponding `.js` files.

3.  **Running Examples:**
    Each script contains commented-out example usage code at the bottom.
    *   Uncomment the example block in the desired `.ts` file.
    *   Compile the file again if you made changes (`tsc your-script-name.ts`).
    *   Run the generated JavaScript file using Node.js:
        ```bash
        node bank-investment-simulator-with-monthly-deposits.js
        node stock-market-simulator.js
        node advanced-portfolio-simulator.js
        ```
    *   Alternatively, use `ts-node` to run TypeScript files directly without explicit compilation:
        ```bash
        # npm install -g ts-node (if not already installed)
        ts-node your-script-name.ts
        ```