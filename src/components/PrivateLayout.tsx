import React from 'react';
import Sidebar from './Sidebar.tsx';
import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const PrivateLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component={motion.main}
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3 }}
        sx={{
          flexGrow: 1,
          p: 3,
          ml: '240px',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
          overflowX: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </Box>
    </Box>
  );
};

export default PrivateLayout;

