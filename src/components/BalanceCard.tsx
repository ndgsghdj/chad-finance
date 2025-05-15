import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface BalanceCardProps {
  user: string;
}

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
          <Typography variant="h4" fontWeight="bold">
            ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;


