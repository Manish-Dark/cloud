import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Paper, Divider, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Select, InputLabel, FormControl,
  LinearProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useParams } from 'react-router-dom';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockIcon from '@mui/icons-material/Lock';
import FolderIcon from '@mui/icons-material/Folder';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../api';

interface IFolder { _id: string; name: string; }
interface IFile { _id: string; path: string; size: number; }
interface IAccess {
  _id: string;
  user_id: { _id: string; email: string };
  access_type: 'R' | 'W' | 'A';
}

const ACCESS_LABEL: Record<string, { label: string; color: 'error' | 'warning' | 'success' }> = {
  A: { label: 'Admin', color: 'error' },
  W: { label: 'Write', color: 'warning' },
  R: { label: 'Read', color: 'success' },
};

const StorageFiles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabIndex, setTabIndex] = useState(0);
  const [storageName, setStorageName] = useState('Loading...');

  // Files & Folders
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [files, setFiles] = useState<IFile[]>([]);

  // Access
  const [accesses, setAccesses] = useState<IAccess[]>([]);

  // CREATE dropdown menu
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Per-item context menu (three-dot)
  const [itemMenuAnchor, setItemMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);

  // Create Folder dialog
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Grant Access dialog
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantType, setGrantType] = useState<'R' | 'W' | 'A'>('R');
  const [editAccess, setEditAccess] = useState<IAccess | null>(null);

  // Upload file
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  // Progress states
  const [downloadProgress, setDownloadProgress] = useState<{ name: string; percent: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; percent: number } | null>(null);

  const showSnack = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnack({ open: true, message, severity });
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [storagesRes, foldersRes, filesRes] = await Promise.all([
        api.get('/storages'),
        api.get(`/folders?storage_id=${id}`),
        api.get(`/files?storage_id=${id}`),
      ]);
      const storage = storagesRes.data.find((s: any) => s._id === id);
      if (storage) setStorageName(storage.name);
      setFolders(foldersRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      console.error('Error fetching storage data', error);
    }
  };

  const fetchAccesses = async () => {
    try {
      const res = await api.get(`/access?storage_id=${id}`);
      setAccesses(res.data);
    } catch (error) {
      console.error('Error fetching accesses', error);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    if (newValue === 1) fetchAccesses();
  };

  // ----- CREATE FOLDER -----
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { name: newFolderName.trim(), storage_id: id });
      setFolderDialogOpen(false);
      setNewFolderName('');
      showSnack(`Created folder '${newFolderName.trim()}'`);
      fetchAll();
    } catch (error: any) {
      showSnack(error?.response?.data?.error || 'Failed to create folder', 'error');
    }
  };

  // ----- UPLOAD FILE -----
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      // 1. Initialize upload
      const initRes = await api.post('/files/init', {
        path: file.name,
        size: file.size,
        storage_id: id
      });
      const fileDoc = initRes.data;

      // 2. Split and upload chunks
      // For large files (>= 1 GB): use 15 MB chunks to avoid Telegram upload timeouts.
      // For smaller files: use 25 MB chunks for fewer round-trips and faster overall upload.
      const ONE_GB = 1 * 1024 * 1024 * 1024;
      const CHUNK_SIZE = file.size >= ONE_GB
        ? 15 * 1024 * 1024  // 15 MB for files >= 1 GB
        : 25 * 1024 * 1024; // 25 MB for files < 1 GB
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      setUploadProgress({ name: file.name, percent: 0 });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', chunkBlob, file.name);
        formData.append('position', i.toString());
        formData.append('is_last', (i === totalChunks - 1).toString());

        await api.post(`/files/${fileDoc._id}/chunks`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const percent = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress({ name: file.name, percent });
      }

      showSnack(`✅ '${file.name}' uploaded successfully!`);
      fetchAll();
      setTimeout(() => setUploadProgress(null), 2000);
    } catch (error: any) {
      showSnack(error?.response?.data?.error || 'Upload failed', 'error');
      setUploadProgress(null);
    }
    e.target.value = '';
  };

  // ----- GRANT / EDIT ACCESS -----
  const handleGrantAccess = async () => {
    if (!grantEmail.trim()) return;
    try {
      if (editAccess) {
        await api.put(`/access/${editAccess._id}`, { access_type: grantType });
        showSnack(`Updated access for '${grantEmail}'`);
      } else {
        await api.post('/access', { email: grantEmail.trim(), storage_id: id, access_type: grantType });
        showSnack(`Granted access to '${grantEmail}'`);
      }
      setAccessDialogOpen(false);
      setGrantEmail('');
      setGrantType('R');
      setEditAccess(null);
      fetchAccesses();
    } catch (error: any) {
      showSnack(error?.response?.data?.error || 'Failed to grant access', 'error');
    }
  };

  const handleEditAccess = (access: IAccess) => {
    setEditAccess(access);
    setGrantEmail(access.user_id.email);
    setGrantType(access.access_type);
    setAccessDialogOpen(true);
  };

  const handleDeleteAccess = async (accessId: string) => {
    try {
      await api.delete(`/access/${accessId}`);
      showSnack('Access removed');
      fetchAccesses();
    } catch (error) {
      showSnack('Failed to remove access', 'error');
    }
  };

  // ----- DELETE FILE -----
  const handleDeleteFile = async (fileId: string, name: string) => {
    try {
      await api.delete(`/files/${fileId}`);
      showSnack(`Deleted '${name}'`);
      fetchAll();
    } catch (error) {
      showSnack('Failed to delete file', 'error');
    }
  };

  // ----- DELETE FOLDER -----
  const handleDeleteFolder = async (folderId: string, name: string) => {
    try {
      await api.delete(`/folders/${folderId}`);
      showSnack(`Deleted folder '${name}'`);
      fetchAll();
    } catch (error) {
      showSnack('Failed to delete folder', 'error');
    }
  };

  // ----- Per-item context menu -----
  const openItemMenu = (e: React.MouseEvent<HTMLElement>, id: string, type: 'file' | 'folder', name: string) => {
    e.stopPropagation();
    setItemMenuAnchor(e.currentTarget);
    setSelectedItem({ id, type, name });
  };

  const closeItemMenu = () => {
    setItemMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleItemDelete = () => {
    if (!selectedItem) return;
    closeItemMenu();
    if (selectedItem.type === 'file') handleDeleteFile(selectedItem.id, selectedItem.name);
    else handleDeleteFolder(selectedItem.id, selectedItem.name);
  };

  // ----- DOWNLOAD FILE -----
  const handleDownloadFile = async () => {
    if (!selectedItem || selectedItem.type !== 'file') return;
    const { id: fileId, name } = selectedItem;
    closeItemMenu();
    
    try {
      // 1. Get chunk list
      const chunksRes = await api.get(`/files/${fileId}/chunks`);
      const chunks = chunksRes.data;
      if (!chunks.length) {
        showSnack('No chunks found for this file', 'error');
        return;
      }

      setDownloadProgress({ name, percent: 0 });
      const bufferChunks: Blob[] = [];

      // 2. Download one by one
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const res = await api.get(`/files/chunks/${chunk._id}/download`, {
          responseType: 'blob'
        });
        bufferChunks.push(res.data);
        
        const percent = Math.round(((i + 1) / chunks.length) * 100);
        setDownloadProgress({ name, percent });
      }

      // 3. Assemble and trigger download
      const finalBlob = new Blob(bufferChunks);
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnack(`✅ '${name}' downloaded!`);
      setTimeout(() => setDownloadProgress(null), 2000);
    } catch (error) {
      showSnack('Failed to download file', 'error');
      setDownloadProgress(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">{storageName}</Typography>
        <Button
          variant="contained"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ bgcolor: '#ffeb3b', color: 'black', fontWeight: 'bold', borderRadius: 5, '&:hover': { bgcolor: '#fbc02d' } }}
        >
          + CREATE
        </Button>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); setFolderDialogOpen(true); }}>
            <CreateNewFolderIcon fontSize="small" sx={{ mr: 1 }} /> Create folder
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); fileInputRef.current?.click(); }}>
            <FileUploadIcon fontSize="small" sx={{ mr: 1 }} /> Upload file
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); fileInputRef.current?.click(); }}>
            <DriveFileMoveIcon fontSize="small" sx={{ mr: 1 }} /> Upload file to
          </MenuItem>
        </Menu>
        <input ref={fileInputRef} type="file" hidden onChange={handleUploadFile} />
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': { color: 'text.secondary', '&.Mui-selected': { color: 'black', bgcolor: '#f5f5f5', fontWeight: 'bold' } }
          }}
        >
          <Tab icon={<FolderIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="FILES" sx={{ minHeight: 48 }} />
          <Tab icon={<LockIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="ACCESS" sx={{ minHeight: 48, borderLeft: '1px solid #e0e0e0' }} />
        </Tabs>

        {tabIndex === 1 && (
          <Button
            variant="contained"
            onClick={() => { setEditAccess(null); setGrantEmail(''); setGrantType('R'); setAccessDialogOpen(true); }}
            sx={{ bgcolor: '#ffeb3b', color: 'black', fontWeight: 'bold', borderRadius: 5, '&:hover': { bgcolor: '#fbc02d' } }}
          >
            + GRANT ACCESS
          </Button>
        )}
      </Box>

      {/* FILES TAB */}
      {tabIndex === 0 && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <List disablePadding>
            {folders.map((folder, i) => (
              <React.Fragment key={folder._id}>
                {i > 0 && <Divider />}
                <ListItem secondaryAction={
                  <IconButton edge="end" onClick={(e) => openItemMenu(e, folder._id, 'folder', folder.name)}>
                    <MoreVertIcon />
                  </IconButton>
                }>
                  <ListItemIcon><FolderIcon color="action" /></ListItemIcon>
                  <ListItemText primary={folder.name} />
                </ListItem>
              </React.Fragment>
            ))}
            {files.map((file, i) => (
              <React.Fragment key={file._id}>
                {(folders.length > 0 || i > 0) && <Divider />}
                <ListItem secondaryAction={
                  <IconButton edge="end" onClick={(e) => openItemMenu(e, file._id, 'file', file.path)}>
                    <MoreVertIcon />
                  </IconButton>
                }>
                  <ListItemIcon><InsertDriveFileIcon color="action" /></ListItemIcon>
                  <ListItemText
                    primary={file.path}
                    secondary={`${(file.size / 1024).toFixed(1)} KiB`}
                  />
                </ListItem>
              </React.Fragment>
            ))}
            {folders.length === 0 && files.length === 0 && (
              <ListItem sx={{ py: 4 }}>
                <Typography color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                  No files or folders yet. Click + CREATE to add some.
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      {/* Per-item context menu */}
      <Menu anchorEl={itemMenuAnchor} open={Boolean(itemMenuAnchor)} onClose={closeItemMenu}>
        {selectedItem?.type === 'file' && (
          <MenuItem onClick={handleDownloadFile}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
          </MenuItem>
        )}
        <MenuItem onClick={handleItemDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* ACCESS TAB */}
      {tabIndex === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Access Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {accesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No access granted yet. Click + GRANT ACCESS to add.
                  </TableCell>
                </TableRow>
              ) : (
                accesses.map((a) => {
                  const meta = ACCESS_LABEL[a.access_type] || { label: a.access_type, color: 'default' };
                  return (
                    <TableRow key={a._id}>
                      <TableCell>{a.user_id?.email}</TableCell>
                      <TableCell>
                        <Chip label={meta.label} color={meta.color} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEditAccess(a)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteAccess(a._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── CREATE FOLDER DIALOG ── */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="New folder name"
            variant="standard"
            fullWidth
            required
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateFolder} sx={{ color: '#1976d2', fontWeight: 'bold' }}>CREATE</Button>
          <Button onClick={() => { setFolderDialogOpen(false); setNewFolderName(''); }} sx={{ color: 'error.main', fontWeight: 'bold' }}>CANCEL</Button>
        </DialogActions>
      </Dialog>

      {/* ── GRANT / EDIT ACCESS DIALOG ── */}
      <Dialog open={accessDialogOpen} onClose={() => setAccessDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editAccess ? 'Edit Access' : 'Grant Access'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="User Email"
            variant="standard"
            fullWidth
            required
            disabled={!!editAccess}
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
          />
          <FormControl variant="standard" fullWidth>
            <InputLabel>Access Type</InputLabel>
            <Select
              value={grantType}
              onChange={(e: SelectChangeEvent) => setGrantType(e.target.value as 'R' | 'W' | 'A')}
            >
              <MenuItem value="R">Read</MenuItem>
              <MenuItem value="W">Write</MenuItem>
              <MenuItem value="A">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGrantAccess} sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            {editAccess ? 'UPDATE' : 'GRANT'}
          </Button>
          <Button onClick={() => { setAccessDialogOpen(false); setEditAccess(null); }} sx={{ color: 'error.main', fontWeight: 'bold' }}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* ── PROGRESS BARS (UPLOAD & DOWNLOAD) ── */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 9999 }}>
        {uploadProgress && (
          <Paper elevation={6} sx={{ width: 300, p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Uploading {uploadProgress.name}...
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={uploadProgress.percent} sx={{ height: 8, borderRadius: 5, bgcolor: '#e3f2fd', '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' } }} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${uploadProgress.percent}%`}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {downloadProgress && (
          <Paper elevation={6} sx={{ width: 300, p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Downloading {downloadProgress.name}...
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={downloadProgress.percent} sx={{ height: 8, borderRadius: 5, bgcolor: '#e8f5e9', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' } }} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${downloadProgress.percent}%`}</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default StorageFiles;
