import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Paper, Typography, Divider, InputAdornment, IconButton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import SecurityIcon from '@mui/icons-material/Security';
import WifiIcon from '@mui/icons-material/Wifi';
import axios from 'axios';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('manish@gmail.com');
  const [password, setPassword] = useState('ManishDark');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/');
    } catch (error: any) {
      console.error('Login failed', error);
      const msg = error?.response?.data?.error || 'Login failed. Please check your credentials.';
      alert(msg);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const floatingIcons = [
    { Icon: CloudIcon,   size: 48, left: '8%',  top: '12%', delay: '0s',   duration: '6s'  },
    { Icon: StorageIcon, size: 36, left: '85%', top: '20%', delay: '1s',   duration: '7s'  },
    { Icon: FolderIcon,  size: 42, left: '72%', top: '70%', delay: '2s',   duration: '5s'  },
    { Icon: SecurityIcon,size: 32, left: '15%', top: '75%', delay: '0.5s', duration: '8s'  },
    { Icon: WifiIcon,    size: 40, left: '90%', top: '50%', delay: '1.5s', duration: '6.5s'},
    { Icon: CloudIcon,   size: 28, left: '5%',  top: '50%', delay: '2.5s', duration: '9s'  },
    { Icon: FolderIcon,  size: 24, left: '60%', top: '8%',  delay: '3s',   duration: '7.5s'},
    { Icon: StorageIcon, size: 44, left: '30%', top: '85%', delay: '0.8s', duration: '5.5s'},
  ];

  const bubbles = [
    { size: 80,  left: '10%', delay: '0s',   duration: '8s'  },
    { size: 120, left: '25%', delay: '2s',   duration: '10s' },
    { size: 60,  left: '50%', delay: '1s',   duration: '7s'  },
    { size: 100, left: '70%', delay: '3s',   duration: '9s'  },
    { size: 70,  left: '88%', delay: '1.5s', duration: '6s'  },
    { size: 50,  left: '40%', delay: '4s',   duration: '11s' },
  ];

  return (
    <Box className="login-bg">
      {/* Animated floating bubbles */}
      {bubbles.map((b, i) => (
        <span
          key={`bubble-${i}`}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}

      {/* Floating tech icons */}
      {floatingIcons.map(({ Icon, size, left, top, delay, duration }, i) => (
        <Box
          key={`icon-${i}`}
          className="float-icon"
          sx={{ left, top, animationDelay: delay, animationDuration: duration }}
        >
          <Icon sx={{ fontSize: size, opacity: 0.25, color: 'white' }} />
        </Box>
      ))}

      {/* Login Card */}
      <Paper
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 440,
          p: 5,
          borderRadius: 4,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <CloudIcon sx={{ fontSize: 40, color: '#818cf8' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
              Manish-Dark
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3 }}>
            Sign in to access your cloud storage
          </Typography>

          <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)' }} />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#818cf8' },
                '&.Mui-focused fieldset': { borderColor: '#818cf8' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#818cf8' }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#818cf8' },
                '&.Mui-focused fieldset': { borderColor: '#818cf8' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#818cf8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#818cf8' } }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 1,
              fontWeight: 'bold',
              borderRadius: 2,
              py: 1.5,
              fontSize: '1rem',
              letterSpacing: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                boxShadow: '0 12px 32px rgba(99,102,241,0.55)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Login
          </Button>

          <Link to="/register" style={{ textDecoration: 'none', color: 'rgba(129,140,248,0.9)', fontWeight: 500 }}>
            Don't have an account yet? Register!
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
