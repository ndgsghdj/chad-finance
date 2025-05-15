import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Investment Simulator', path: '/investments' },
  { label: 'Simulator', path: '/simulator' },
  { label: 'Portfolio', path: '/portfolio' },
  // add more private routes here if needed
];

const Sidebar: React.FC = () => {
  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        position: 'fixed',
        top: 64, // height of AppBar (default MUI is 64px for desktop)
        left: 0,
        overflowY: 'auto',
        pt: 2,
      }}
    >
      <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
        Private Menu
      </Typography>
      <List>
        {navItems.map(({ label, path }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={path}
              sx={{
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;

