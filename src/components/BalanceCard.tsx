import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface BalanceCardProps {
  user: string;
}

const TARGET_GOAL = 82600;

const BalanceCard: React.FC<BalanceCardProps> = ({ user }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbwdakjQSyDMPkB2HU1I8sZPouCz4xLVCsPgQwrqooaOzbyD-zMsOQoBEVEFoAUlRoSR/exec?account=${user}`);
        if (!res.ok) throw new Error('Failed to fetch balance');
        const data = await res.json();
        setBalance(data[0].balance);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  const remaining = balance !== null ? TARGET_GOAL - balance : null;

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 4,
        backgroundColor: 'background.paper',
        p: 2,
        minWidth: 300,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <AccountBalanceWalletIcon color="primary" fontSize="large" />
          <Typography variant="h6">Current Bank Balance</Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="h4" fontWeight="bold">
              ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" color="text.secondary">
              You’re <strong>${remaining!.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> away from your $82,600 goal.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;

