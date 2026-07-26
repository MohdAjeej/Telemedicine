import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useLogoutMutation } from '../../features/auth/authApi';
import { logout as logoutAction } from '../../features/auth/authSlice';
import NotificationBell from './NotificationBell';

const DRAWER_WIDTH = 260;

export interface DashboardNavItem {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
}

export interface DashboardShellProps {
  roleLabel: string;
  navItems: DashboardNavItem[];
}

export default function DashboardShell({ roleLabel, navItems }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { mode, toggleMode } = useThemeMode();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary.main" noWrap>
          Telemedicine
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.end}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {roleLabel}
          </Typography>
          <NotificationBell />
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleMode}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem disabled>
              {user?.firstName} {user?.lastName}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
