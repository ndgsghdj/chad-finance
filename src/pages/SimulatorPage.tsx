import React, { useState } from 'react';
import { StockMarketSimulator, ScenarioType, MonthlyStockValue } from '../utils/stock-market-simulator.ts';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const simulator = new StockMarketSimulator();

const SimulatorPage: React.FC = () => {
  // Form state
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(100);
  const [expectedReturn, setExpectedReturn] = useState(0.08);
  const [volatility, setVolatility] = useState(0.15);
  const [months, setMonths] = useState(24);
  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.AVERAGE);

  const [results, setResults] = useState<MonthlyStockValue[]>([]);

  const runSimulation = () => {
    try {
      const res = simulator.simulateInvestment(
        initial,
        monthly,
        expectedReturn,
        volatility,
        months,
        scenario
      );
      setResults(res);
    } catch (e) {
      alert('Error running simulation: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stock Market Simulator
      </Typography>

      <Box
        component="form"
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}
        noValidate
        autoComplete="off"
      >
        <TextField
          label="Initial Investment"
          type="number"
          value={initial}
          onChange={e => setInitial(parseFloat(e.target.value))}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Monthly Investment"
          type="number"
          value={monthly}
          onChange={e => setMonthly(parseFloat(e.target.value))}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Expected Annual Return"
          type="number"
          value={expectedReturn}
          onChange={e => setExpectedReturn(parseFloat(e.target.value))}
          inputProps={{ min: 0, max: 1, step: 0.01 }}
          helperText="Decimal (e.g. 0.08 for 8%)"
        />
        <TextField
          label="Annual Volatility"
          type="number"
          value={volatility}
          onChange={e => setVolatility(parseFloat(e.target.value))}
          inputProps={{ min: 0, max: 1, step: 0.01 }}
          helperText="Decimal (e.g. 0.15 for 15%)"
        />
        <TextField
          label="Months"
          type="number"
          value={months}
          onChange={e => setMonths(parseInt(e.target.value, 10))}
          inputProps={{ min: 0 }}
        />
        <Select
          label="Scenario"
          value={scenario}
          onChange={e => setScenario(e.target.value as ScenarioType)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value={ScenarioType.AVERAGE}>Average</MenuItem>
          <MenuItem value={ScenarioType.BEST}>Best</MenuItem>
          <MenuItem value={ScenarioType.WORST}>Worst</MenuItem>
        </Select>

        <Button variant="contained" onClick={runSimulation}>
          Run Simulation
        </Button>
      </Box>

      {results.length > 0 && (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="simulation results">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Portfolio Value ($)</TableCell>
                <TableCell>Total Invested ($)</TableCell>
                <TableCell>Monthly Return Applied (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(({ month, portfolioValue, totalAmountInvested, monthlyReturnApplied }) => (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  <TableCell>{portfolioValue.toFixed(2)}</TableCell>
                  <TableCell>{totalAmountInvested.toFixed(2)}</TableCell>
                  <TableCell>{(monthlyReturnApplied * 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default SimulatorPage;

