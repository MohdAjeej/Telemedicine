import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/health-officer', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Patient Intake', path: '/app/health-officer/register-patient', icon: <PersonAddAltOutlinedIcon /> },
  { label: 'Appointments', path: '/app/health-officer/appointments', icon: <EventNoteOutlinedIcon /> },
  {
    label: 'Book Video Consultation',
    path: '/app/health-officer/appointments/book',
    icon: <EventAvailableOutlinedIcon />,
  },
  { label: 'Prescriptions', path: '/app/health-officer/prescriptions', icon: <MedicationOutlinedIcon /> },
  { label: 'Test Results', path: '/app/health-officer/test-results', icon: <ScienceOutlinedIcon /> },
  { label: 'Profile', path: '/app/health-officer/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function HealthOfficerLayout() {
  return <DashboardShell roleLabel="Health Officer Desk" navItems={navItems} />;
}
