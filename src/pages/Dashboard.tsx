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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { motion } from 'framer-motion';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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


const incomeSources = [
    {
        title: '“Intermittent Fasting”',
        subtitle: '(skipping lunch to study math in the classroom)',
        amount: '$200 / month',
    },
    {
        title: '“Torturing Children”',
        subtitle: '(giving math tuition and making primary school children cry)',
        amount: '$240 / month',
    },
    {
        title: '“Experiencing the future life”',
        subtitle: '(working at McDonalds)',
        amount: '$320 / month',
    },
    {
        title: '“Questionable Side Hustles”',
        subtitle: '(selling questionable items @ Joshua Wong)',
        amount: '$90 / month',
    },
    {
        title: '“Botak”',
        subtitle: '(NSF salary)',
        amount: '$630 / month',
    },
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

        <Box mt={4}>
        </Box>

        <Box mt={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
        Sources of Income
        </Typography>
        <Grid container spacing={3}>
  {incomeSources.map((source, i) => (
    <Grid item xs={12} sm={6} md={4} key={source.title}>
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
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <MonetizationOnIcon color="secondary" />
            <Typography variant="h6">{source.title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {source.subtitle}
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {source.amount}
          </Typography>
        </Paper>
      </motion.div>
    </Grid>
  ))}
</Grid>

        </Box>


        </Container>
        </Box>
    );
};

export default Dashboard;

