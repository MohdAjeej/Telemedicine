import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useLogoutMutation } from '../../features/auth/authApi';
import { logout as logoutAction } from '../../features/auth/authSlice';
import NotificationBell from './NotificationBell';

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL ?? 'https://localhost:5183';

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

export default function DashboardShell({ roleLabel, navItems }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutMutation] = useLogoutMutation();
  const location = useLocation();

  // Drives the "Admin Console / <Page>" breadcrumb in the app bar — the
  // active nav item is whichever one's path matches the current route, so
  // this stays correct for every page without hand-listing titles here.
  const activeNavItem = navItems.find((item) =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path),
  );

  // Sent back to the client app's shared login page — not this console's own
  // /login — since that's the one page every role (including admin) signs in
  // from; landing here again would just invite the double-login the handoff
  // flow was built to avoid.
  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logoutAction());
      window.location.href = `${CLIENT_URL}/login`;
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
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
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" color="text.secondary" noWrap>
              {roleLabel}
            </Typography>
            {activeNavItem && (
              <>
                <Typography variant="subtitle1" color="text.secondary">
                  /
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {activeNavItem.label}
                </Typography>
              </>
            )}
          </Stack>
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

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
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
            display: { xs: 'none', md: 'block' },
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
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <Toolbar sx={{ flexShrink: 0 }} />
        {/* flex:1 + minHeight:0 gives page content a definite height to fill
            (e.g. via height:'100%') when it wants to fit without scrolling —
            pages that don't care just render at their natural height as
            normal, and overflow still falls through to this Box's own
            overflowY:auto. */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
