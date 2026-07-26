import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/health-officer', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Register Patient', path: '/app/health-officer/register-patient', icon: <PersonAddAltOutlinedIcon /> },
  { label: 'Appointments', path: '/app/health-officer/appointments', icon: <EventNoteOutlinedIcon /> },
  { label: 'Profile', path: '/app/health-officer/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function HealthOfficerLayout() {
  return <DashboardShell roleLabel="Health Officer Desk" navItems={navItems} />;
}
