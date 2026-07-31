import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'My Hospital', path: '/hospitals', icon: <LocalHospitalOutlinedIcon /> },
  { label: 'Doctors', path: '/doctors', icon: <MedicalServicesOutlinedIcon /> },
  { label: 'Health Officers', path: '/health-officers', icon: <BadgeOutlinedIcon /> },
  { label: 'Patients', path: '/patients', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Appointments', path: '/appointments', icon: <EventNoteOutlinedIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <AssessmentOutlinedIcon /> },
  { label: 'Audit Logs', path: '/audit-logs', icon: <HistoryOutlinedIcon /> },
  { label: 'User Management', path: '/users', icon: <ManageAccountsOutlinedIcon /> },
  { label: 'Notification Center', path: '/notifications', icon: <NotificationsOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
  { label: 'Profile', path: '/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function AdminLayout() {
  return <DashboardShell roleLabel="Admin Console" navItems={navItems} />;
}
