import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  Container,
  useTheme,
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WorkIcon from '@mui/icons-material/Work';
import { motion } from 'framer-motion';

const incomeSources = [
  {
    icon: <SchoolIcon fontSize="large" color="primary" />,
    title: 'Intermittent Fasting',
    description: 'Saving lunch money to study in class.',
    value: '$200/month',
  },
  {
    icon: <MonetizationOnIcon fontSize="large" color="primary" />,
    title: 'Math Tuition',
    description: 'Making primary school kids cry during tuition.',
    value: '$240/month',
  },
  {
    icon: <WorkIcon fontSize="large" color="primary" />,
    title: 'McDonald’s Part-time',
    description: 'Experiencing my future job (8hr/week).',
    value: '$320/month',
  },
  {
    icon: <SavingsIcon fontSize="large" color="primary" />,
    title: 'Side Hustle',
    description: 'Selling vapes (trust me bro – Joshua Wong).',
    value: '$90/month',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const MainPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, sm: 6 },
            background: 'linear-gradient(to right, #1c1f26, #2a2f3a)',
            color: theme.palette.text.primary,
            borderRadius: 4,
            textAlign: 'center',
            mb: 8,
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            NUS Mathematics Dream Fund
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 720, mx: 'auto', color: theme.palette.text.secondary }}>
            Track the 15-year-old legend's journey to fund his Mathematics degree — through fasting,
            tutoring, burgers, and side hustles.
          </Typography>
        </Paper>
      </motion.div>

      {/* Income Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h5"
          fontWeight="medium"
          align="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          🏦 Monthly Income Sources
        </Typography>
      </motion.div>

      <Grid container spacing={4} justifyContent="center">
        {incomeSources.map((source, index) => (
          <Grid item xs={12} sm={6} key={source.title}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  backgroundColor: theme.palette.background.paper,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    {source.icon}
                    <Typography variant="h6">{source.title}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 48 }}
                  >
                    {source.description}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Typography variant="body1" fontWeight="bold">
                    {source.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Summary Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={4}
      >
        <Box mt={10} textAlign="center">
          <Typography variant="h5" fontWeight="medium" gutterBottom>
            🎓 Financial Strategy
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 720, mx: 'auto', color: theme.palette.text.secondary }}>
            Over 7 years, the aspiring mathematician expects to save <strong>$60,320</strong>,
            against a projected tuition of <strong>$82,600</strong>. A funding gap of{' '}
            <strong>$22,280</strong> remains – to be filled through the magic of investing.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: 720, mx: 'auto', color: theme.palette.text.secondary }}>
            With an average of <strong>$754/month</strong>, he pursues a balanced strategy in
            equities, savings, and bonds — praying the 2024 market continues cooperating.
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
};

export default MainPage;

