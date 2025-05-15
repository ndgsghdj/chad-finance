import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  AdvancedPortfolioSimulator,
  ScenarioType,
  Stock,
  BankAccount,
  MonthlySimulatedPortfolioState,
} from "../utils/portfolio-simulator.ts";

export default function PortfolioSimulationPage() {
  const stocks: Stock[] = [
    { name: "TechStock", geometricMean: 0.12, volatility: 0.2 },
    { name: "BlueChip", geometricMean: 0.08, volatility: 0.15 },
  ];
  const bankAccount: BankAccount = { name: "Savings Plus", interestRate: 0.04 };

  const initialInvestment = 10000;
  const monthlyDeposit = 500;
  const targetVolatility = 0.08;
  const durationMonths = 36;

  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.AVERAGE);
  const [simulationData, setSimulationData] = useState<
    MonthlySimulatedPortfolioState[] | null
  >(null);

  const runSimulation = () => {
    const simulator = new AdvancedPortfolioSimulator();
    const result = simulator.simulateInvestmentStrategy(
      initialInvestment,
      monthlyDeposit,
      stocks,
      bankAccount,
      targetVolatility,
      durationMonths,
      scenario
    );
    setSimulationData(result);
  };

  const handleScenarioChange = (event: SelectChangeEvent) => {
    setScenario(event.target.value as ScenarioType);
  };

  const chartData =
    simulationData?.map((item) => ({
      month: item.month,
      totalValue: item.totalPortfolioValue,
      bankValue: item.bankValue,
      stocksValue: Object.values(item.stockValues).reduce((sum, val) => sum + val, 0),
    })) || [];

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>
        Portfolio Simulation
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={3}
        flexWrap="wrap"
      >
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="scenario-select-label">Scenario</InputLabel>
          <Select
            labelId="scenario-select-label"
            id="scenario-select"
            value={scenario}
            label="Scenario"
            onChange={handleScenarioChange}
          >
            <MenuItem value={ScenarioType.AVERAGE}>Average</MenuItem>
            <MenuItem value={ScenarioType.BEST}>Best</MenuItem>
            <MenuItem value={ScenarioType.WORST}>Worst</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={runSimulation}>
          Run Simulation
        </Button>
      </Box>

      {simulationData && (
        <>
          <Typography variant="h5" gutterBottom>
            Simulation Results (Last 5 Months)
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small" aria-label="simulation results table">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Total Portfolio Value ($)</TableCell>
                  <TableCell align="right">Bank Value ($)</TableCell>
                  <TableCell align="right">Stocks Value ($)</TableCell>
                  {stocks.map((s) => (
                    <TableCell key={s.name} align="right">
                      {s.name} ($)
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {simulationData.slice(-5).map((item) => (
                  <TableRow key={item.month}>
                    <TableCell component="th" scope="row">
                      {item.month}
                    </TableCell>
                    <TableCell align="right">
                      {item.totalPortfolioValue.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{item.bankValue.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {Object.values(item.stockValues)
                        .reduce((sum, val) => sum + val, 0)
                        .toFixed(2)}
                    </TableCell>
                    {stocks.map((s) => (
                      <TableCell key={s.name} align="right">
                        {(item.stockValues[s.name] ?? 0).toFixed(2)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" gutterBottom>
            Portfolio Value Over Time
          </Typography>

          <Box height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Month", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Value ($)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalValue"
                  stroke="#8884d8"
                  name="Total Portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="bankValue"
                  stroke="#82ca9d"
                  name="Bank"
                />
                <Line
                  type="monotone"
                  dataKey="stocksValue"
                  stroke="#ff7300"
                  name="Stocks"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  );
}
 
