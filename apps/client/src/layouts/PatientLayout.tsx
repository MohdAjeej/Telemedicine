import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/patient', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Vitals', path: '/app/patient/vitals', icon: <MonitorHeartOutlinedIcon /> },
  { label: 'Test Results', path: '/app/patient/test-results', icon: <ScienceOutlinedIcon /> },
  { label: 'Prescriptions', path: '/app/patient/prescriptions', icon: <MedicationOutlinedIcon /> },
  { label: 'Profile', path: '/app/patient/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function PatientLayout() {
  return <DashboardShell roleLabel="My Health" navItems={navItems} />;
}
