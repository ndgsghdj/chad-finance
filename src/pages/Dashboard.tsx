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
  { title: '📈 Progress Tracker', description: 'Monitor savings and goals.' },
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

        <Grid container spacing={4} mt={1}>
          {sections.map((section, i) => (
            <Grid item xs={12} sm={6} md={4} key={section.title}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: '#1e222b',
                    color: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="grey.400">
                    {section.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

