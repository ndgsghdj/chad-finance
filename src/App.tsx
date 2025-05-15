import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import MainPage from './pages/MainPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import { AuthProvider } from './context/AuthProvider.tsx'
// import InvestmentPage from './pages/InvestmentPage';
// import NotFoundPage from './pages/NotFoundPage';

 
const theme = createTheme({
  palette: {
    primary: {
      main: '#0b1d4a', // dark bank blue
    },
    secondary: {
      main: '#c62828', // red accent
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});
 
export default function App() {
  return (
      <AuthProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky" elevation={2}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
              ChadFinance
            </Typography>
            <div>
              <Button component={Link} to="/" color="inherit">Home</Button>
              <Button component={Link} to="/investments" color="inherit">Investments</Button>
              <Button component={Link} to="/login" color="inherit">Login</Button>
            </div>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
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

