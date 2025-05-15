import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';

import { useAuth } from '../context/AuthProvider.tsx';

export default function Bar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={3}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          color="inherit"
          sx={{ textDecoration: 'none' }}
        >
          ChadFinance
        </Typography>
        <div>
          <Button component={Link} to="/" color="inherit">
            Home
          </Button>
          <Button component={Link} to="/login" color="inherit">
            Login
          </Button>
          <Button onClick={handleSignOut} color="inherit">
            Sign Out
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}

