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
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useLogoutMutation } from '../../features/auth/authApi';
import { logout as logoutAction } from '../../features/auth/authSlice';
import NotificationBell from './NotificationBell';
import { HeaderContentProvider, useHeaderContent } from './HeaderContentContext';

const DRAWER_WIDTH = 260;
const SIDEBAR_BG = '#1e3a8a';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.08)';
const SIDEBAR_TEXT = 'rgba(255,255,255,0.78)';
const SIDEBAR_ICON = 'rgba(255,255,255,0.55)';
const SIDEBAR_HOVER = 'rgba(255,255,255,0.06)';

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

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <HeaderContentProvider>
      <DashboardShellInner {...props} />
    </HeaderContentProvider>
  );
}

function DashboardShellInner({ roleLabel, navItems }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutMutation] = useLogoutMutation();
  const { headerContent } = useHeaderContent();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG, color: SIDEBAR_TEXT }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="common.white" noWrap>
          Telemedicine
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: SIDEBAR_BORDER }} />
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
              color: SIDEBAR_TEXT,
              '& .MuiListItemIcon-root': { color: SIDEBAR_ICON },
              '&:hover': { bgcolor: SIDEBAR_HOVER },
              '&.active': {
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '& .MuiListItemIcon-root': { color: 'secondary.contrastText' },
                '&:hover': { bgcolor: 'secondary.main' },
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
        sx={(theme) => ({
          width: { md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: desktopOpen ? `${DRAWER_WIDTH}px` : 0 },
          boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        })}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            edge="start"
            onClick={() => setDesktopOpen((prev) => !prev)}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            {desktopOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          {headerContent ?? (
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              {roleLabel}
            </Typography>
          )}
          <NotificationBell />
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

      <Box
        component="nav"
        sx={(theme) => ({
          width: { md: desktopOpen ? DRAWER_WIDTH : 0 },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        })}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: SIDEBAR_BG },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: desktopOpen ? 'block' : 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: SIDEBAR_BG,
              borderRight: '1px solid',
              borderColor: SIDEBAR_BORDER,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          width: { md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          px: { xs: 2, md: 4 },
          py: 4,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        })}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
