import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import BalanceCard from '../components/BalanceCard.tsx';
import { useAuth } from '../context/AuthProvider.tsx';
import { Navigate } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const sections = [
  { title: '📈 Your Goal', description: '$82,600' },
  { title: '📊 Investment Plans', description: 'Explore funding strategies.' },
  { title: '📝 Expense Journal', description: 'Track spending habits.' },
];

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ backgroundColor: '#0e1117', minHeight: '100vh', color: 'white' }}>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(to right, #1c1f26, #2a2f3a)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🧮 NUS Math Dream Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user.displayName || user.email} 👋
        </Typography>

        <Box mt={3}>
          <BalanceCard user={user.email} />
        </Box>

      </Container>
    </Box>
  );
};

export default Dashboard;

