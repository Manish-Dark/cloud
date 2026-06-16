import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Tooltip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import api from '../api';

const StorageRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [chatId, setChatId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/storages', { name, chat_id: Number(chatId) });
      navigate('/storages');
    } catch (error) {
      console.error('Failed to register storage', error);
      alert('Failed to register storage');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center' }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate(-1)} 
        sx={{ mb: 4, color: 'text.secondary', borderColor: 'divider' }}
      >
        &lt; BACK
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" component="h1">
          Register new storage
        </Typography>
        <Tooltip title="Enter a recognizable name and a Telegram Chat ID">
          <IconButton size="small" sx={{ color: '#ed6c02', ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Name"
          variant="standard"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Chat id"
          variant="standard"
          type="number"
          required
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          fullWidth
        />
        <Box sx={{ mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ bgcolor: '#ffeb3b', color: 'black', fontWeight: 'bold', px: 4, py: 1, '&:hover': { bgcolor: '#fbc02d' } }}
          >
            REGISTER
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StorageRegister;
