import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Paper, Chip,
  Skeleton, Tooltip, IconButton, Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import TelegramIcon from '@mui/icons-material/Telegram';
import KeyIcon from '@mui/icons-material/Key';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Worker {
  _id: string;
  name: string;
  token: string;
  storage_id: string | { _id: string, name: string };
}

const BOT_COLORS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
];

const maskToken = (token: string) =>
  token.length > 12 ? `${token.slice(0, 6)}••••••${token.slice(-4)}` : '••••••••';

const WorkersList: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to fetch workers', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, lineHeight: 1 }}>
              Storage Workers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {workers.length} bot{workers.length !== 1 ? 's' : ''} registered
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchWorkers} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/storage_workers/register')}
            sx={{
              fontWeight: 'bold',
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
                boxShadow: '0 8px 24px rgba(14,165,233,0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Register New
          </Button>
        </Box>
      </Box>

      {/* ── Stats ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Active Bots', value: workers.length, icon: <SmartToyIcon />, color: '#6366f1' },
          { label: 'Telegram Bots', value: workers.length, icon: <TelegramIcon />, color: '#0ea5e9' },
          { label: 'Max Allowed', value: '20', icon: <PrecisionManufacturingIcon />, color: '#10b981' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{
            flex: '1 1 160px', p: 2, borderRadius: 3,
            display: 'flex', alignItems: 'center', gap: 2,
            border: '1px solid', borderColor: 'divider',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: `0 8px 24px ${stat.color}33` },
          }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${stat.color}22`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── Worker Cards ── */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : workers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SmartToyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No Bots Registered</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add Telegram bots as storage workers to upload & download files.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/storage_workers/register')}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              '&:hover': { background: 'linear-gradient(135deg, #0284c7, #4f46e5)' },
            }}
          >
            Register First Worker
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
          {workers.map((worker, idx) => (
            <Paper
              key={worker._id}
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
                  borderColor: 'transparent',
                },
              }}
            >
              {/* Gradient header */}
              <Box sx={{
                height: 80,
                background: BOT_COLORS[idx % BOT_COLORS.length],
                display: 'flex',
                alignItems: 'center',
                px: 3,
                gap: 2,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <Box sx={{ position: 'absolute', right: -15, top: -15, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', width: 44, height: 44 }}>
                  <SmartToyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
                    {worker.name}
                  </Typography>
                  <Chip
                    icon={<TelegramIcon style={{ fontSize: 12, color: 'white' }} />}
                    label="Telegram Bot"
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mt: 0.3 }}
                  />
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">Storage:</Typography>
                  <Chip
                    label={
                      String(typeof worker.storage_id === 'object' && worker.storage_id !== null
                        ? worker.storage_id.name
                        : (worker.storage_id || 'None'))
                    }
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 600, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <KeyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                    {maskToken(worker.token)}
                  </Typography>
                  <Tooltip title={copied === worker._id ? 'Copied!' : 'Copy Token'}>
                    <IconButton size="small" onClick={() => copyToken(worker.token, worker._id)}>
                      <ContentCopyIcon sx={{ fontSize: 14, color: copied === worker._id ? 'success.main' : 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WorkersList;
