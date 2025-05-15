import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.ts';
import { useAuth } from '../context/AuthProvider.tsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 6,
            borderRadius: 3,
            width: 400,
            backgroundColor: (theme) => theme.palette.background.paper,
            borderTop: `6px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            color="text.primary"
          >
            Begin Your Journey With ChadFinance
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Access your Math Degree Investment Portfolio
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 3, borderRadius: 2 }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Divider sx={{ my: 3 }} />
        </Paper>
      </motion.div>
    </Box>
  );
};

export default LoginPage;


