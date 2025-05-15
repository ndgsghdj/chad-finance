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
import { AuthProvider } from './context/AuthProvider.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';

// import InvestmentPage from './pages/InvestmentPage';
// import NotFoundPage from './pages/NotFoundPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3949ab', // blue accent
    },
    secondary: {
      main: '#f50057', // pink/red accent
    },
    background: {
      default: '#0e1117',
      paper: '#1e222b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
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
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
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
                <Button component={Link} to="/investments" color="inherit">
                  Investments
                </Button>
                <Button component={Link} to="/login" color="inherit">
                  Login
                </Button>
              </div>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              {/* <Route path="/investments" element={<InvestmentPage />} /> */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

