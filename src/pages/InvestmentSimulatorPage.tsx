import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  BankInvestmentSimulatorWithMonthlyDeposits,
  MonthlyInvestmentValue,
} from '../utils/BankInvestmentSimulator.ts'; // adjust the path accordingly

const InvestmentSimulatorPage: React.FC = () => {
  const [initial, setInitial] = useState('1000');
  const [monthlyDeposit, setMonthlyDeposit] = useState('100');
  const [rate, setRate] = useState('0.0465');
  const [months, setMonths] = useState('12');

  const [data, setData] = useState<MonthlyInvestmentValue[]>([]);
  const [error, setError] = useState('');

  const handleSimulate = () => {
    setError('');
    try {
      const simulator = new BankInvestmentSimulatorWithMonthlyDeposits();

      const result = simulator.simulateInvestment(
        parseFloat(initial),
        parseFloat(monthlyDeposit),
        parseFloat(rate),
        parseInt(months, 10)
      );

      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error during simulation');
      setData([]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bank Investment Simulator
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          noValidate
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleSimulate();
          }}
        >
          <TextField
            label="Initial Principal Amount"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            sx={{ flex: '1 1 40%' }}
            required
          />

          <TextField
            label="Monthly Deposit Amount"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            sx={{ flex: '1 1 40%' }}
            required
          />

          <TextField
            label="Annual Interest Rate (e.g. 0.0465)"
            type="number"
            inputProps={{ min: 0.01, max: 0.0776, step: 0.0001 }}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            sx={{ flex: '1 1 40%' }}
            required
          />

          <TextField
            label="Number of Months"
            type="number"
            inputProps={{ min: 0, step: 1 }}
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            sx={{ flex: '1 1 40%' }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ height: '56px', flex: '1 1 100%', mt: 1 }}
          >
            Simulate
          </Button>
        </Box>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>

      {data.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Investment Value Over Time
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                tickCount={data.length > 12 ? 13 : undefined}
              />
              <YAxis
                label={{
                  value: 'Amount ($)',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />
              <Legend verticalAlign="top" />

              <Line
                type="monotone"
                dataKey="value"
                name="Investment Value"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

              <Line
                type="monotone"
                dataKey="totalAmountInvested"
                name="Total Invested"
                stroke="#ff5722"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Container>
  );
};

export default InvestmentSimulatorPage;

