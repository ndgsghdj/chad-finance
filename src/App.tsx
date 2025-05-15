import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';

import MainPage from './pages/MainPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import InvestmentSimulatorPage from './pages/InvestmentSimulatorPage.tsx'; // import your simulator
import SimulatorPage from './pages/SimulatorPage.tsx';
import PortfolioPage from './pages/PortfolioPage.tsx'

import { AuthProvider } from './context/AuthProvider.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import PrivateLayout from './components/PrivateLayout.tsx'; // new layout with sidebar

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3949ab' },
    secondary: { main: '#f50057' },
    background: { default: '#0e1117', paper: '#1e222b' },
    text: { primary: '#ffffff', secondary: '#b0bec5' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #1c1f26, #2a2f3a)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none' },
      },
    },
  },
});

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
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
              </div>
            </Toolbar>
          </AppBar>

          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Dashboard />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/investments"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <InvestmentSimulatorPage />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/simulator"
              element={
                  <PrivateRoute>
                    <PrivateLayout>
                        <SimulatorPage />
                    </PrivateLayout>
                  </PrivateRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                  <PrivateRoute>
                    <PrivateLayout>
                        <PortfolioPage />
                    </PrivateLayout>
                  </PrivateRoute>
              }
            />

          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

