import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Tooltip, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import api from '../api';

interface Storage {
  _id: string;
  name: string;
}

const WorkerRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [storageId, setStorageId] = useState('');
  const [storages, setStorages] = useState<Storage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorages();
  }, []);

  const fetchStorages = async () => {
    try {
      const response = await api.get('/storages');
      setStorages(response.data);
    } catch (error) {
      console.error('Failed to fetch storages', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sending a dummy user_id since backend schema requires it but we don't have proper auth yet
      const dummyUserId = "64b5f9b4c052e424225c5689"; 
      await api.post('/workers', { 
        name, 
        token, 
        storage_id: storageId,
        user_id: dummyUserId
      });
      navigate('/storage_workers');
    } catch (error) {
      console.error('Failed to register storage worker', error);
      alert('Failed to register storage worker');
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
          Register new storage worker
        </Typography>
        <Tooltip title="Enter a worker name, an access token, and select a storage">
          <IconButton size="small" sx={{ color: '#ed6c02', ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left' }}>
        <TextField
          label="Name"
          variant="standard"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Token"
          variant="standard"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          fullWidth
        />
        
        <FormControl variant="standard" fullWidth required>
          <InputLabel id="storage-select-label">Storage</InputLabel>
          <Select
            labelId="storage-select-label"
            value={storageId}
            onChange={(e) => setStorageId(e.target.value)}
            label="Storage"
          >
            {storages.map((storage) => (
              <MenuItem key={storage._id} value={storage._id}>{storage.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
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

export default WorkerRegister;
