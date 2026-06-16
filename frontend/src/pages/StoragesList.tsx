import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Paper, Chip,
  Skeleton, Tooltip, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TelegramIcon from '@mui/icons-material/Telegram';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Storage {
  _id: string;
  name: string;
  chat_id: number;
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
];

const StoragesList: React.FC = () => {
  const [storages, setStorages] = useState<Storage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorages();
  }, []);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/storages');
      setStorages(response.data);
    } catch (error) {
      console.error('Failed to fetch storages', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StorageIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, lineHeight: 1 }}>
              My Storages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {storages.length} storage{storages.length !== 1 ? 's' : ''} connected
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStorages} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/storages/register')}
            sx={{
              fontWeight: 'bold',
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.55)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Register New
          </Button>
        </Box>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Storages', value: storages.length, icon: <StorageIcon />, color: '#6366f1' },
          { label: 'Connected via Telegram', value: storages.length, icon: <TelegramIcon />, color: '#0ea5e9' },
          { label: 'Cloud Provider', value: 'Telegram', icon: <CloudIcon />, color: '#10b981' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{
            flex: '1 1 160px',
            p: 2,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: 'background.paper',
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

      {/* ── Storage Cards Grid ── */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 3 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : storages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <FolderOpenIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No Storages Yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Connect your first Telegram channel as a storage.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/storages/register')}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            Register First Storage
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 3 }}>
          {storages.map((storage, idx) => (
            <Paper
              key={storage._id}
              elevation={0}
              onClick={() => navigate(`/storages/${storage._id}/files`)}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
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
              {/* Gradient banner */}
              <Box sx={{
                height: 90,
                background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ position: 'absolute', right: 20, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <StorageIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)' }} />
                <Chip
                  icon={<TelegramIcon />}
                  label="Telegram"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, '& .MuiChip-icon': { color: 'white' } }}
                />
              </Box>

              {/* Card body */}
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {storage.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      Chat ID: {storage.chat_id}
                    </Typography>
                  </Box>
                  <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.5 }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip label="0 KiB" size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />
                  <Chip label="0 Files" size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StoragesList;
