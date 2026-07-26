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
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/admin', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Hospitals', path: '/app/admin/hospitals', icon: <LocalHospitalOutlinedIcon /> },
  { label: 'Doctors', path: '/app/admin/doctors', icon: <MedicalServicesOutlinedIcon /> },
  { label: 'Health Officers', path: '/app/admin/health-officers', icon: <BadgeOutlinedIcon /> },
  { label: 'Patients', path: '/app/admin/patients', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Appointments', path: '/app/admin/appointments', icon: <EventNoteOutlinedIcon /> },
  { label: 'Analytics', path: '/app/admin/analytics', icon: <AssessmentOutlinedIcon /> },
  { label: 'Audit Logs', path: '/app/admin/audit-logs', icon: <HistoryOutlinedIcon /> },
  { label: 'User Management', path: '/app/admin/users', icon: <ManageAccountsOutlinedIcon /> },
  { label: 'Notification Center', path: '/app/admin/notifications', icon: <NotificationsOutlinedIcon /> },
  { label: 'Settings', path: '/app/admin/settings', icon: <SettingsOutlinedIcon /> },
];

export default function AdminLayout() {
  return <DashboardShell roleLabel="Admin Console" navItems={navItems} />;
}
