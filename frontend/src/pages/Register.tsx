import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Paper, Typography, Divider } from '@mui/material';
import api from '../api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/');
    } catch (error: any) {
      console.error('Registration failed', error);
      const msg = error?.response?.data?.error || 'Registration failed.';
      alert(msg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: '20vh' }}>
      <Paper elevation={4}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            px: 5, py: 4, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2
          }}
        >
          <Typography variant="h5">Registering in Manish-Dark</Typography>
          <Divider sx={{ width: '100%' }} />
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Divider sx={{ width: '100%' }} />
          <Button type="submit" variant="contained" color="secondary" fullWidth>
            Register
          </Button>
          <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', marginTop: 10 }}>
            Already have an account? Login!
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
