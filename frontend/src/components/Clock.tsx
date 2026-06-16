import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        px: 2, 
        py: 0.5, 
        borderRadius: '20px', 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      <AccessTimeIcon fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: '600', fontFamily: 'monospace', letterSpacing: 1 }}>
        {time.toLocaleTimeString()}
      </Typography>
    </Box>
  );
};

export default Clock;
