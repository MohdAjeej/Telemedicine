import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/doctor', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Appointments', path: '/app/doctor/appointments', icon: <EventNoteOutlinedIcon /> },
  { label: 'My Patients', path: '/app/doctor/patients', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Video Consultation', path: '/app/doctor/consultations', icon: <VideoCameraFrontOutlinedIcon /> },
  { label: 'Prescriptions', path: '/app/doctor/prescriptions', icon: <MedicationOutlinedIcon /> },
  { label: 'Profile', path: '/app/doctor/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function DoctorLayout() {
  return <DashboardShell roleLabel="Doctor Workspace" navItems={navItems} />;
}
