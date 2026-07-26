import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import DashboardShell, { type DashboardNavItem } from '../components/layout/DashboardShell';

const navItems: DashboardNavItem[] = [
  { label: 'Dashboard', path: '/app/patient', icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Book Appointment', path: '/app/patient/book', icon: <CalendarMonthOutlinedIcon /> },
  { label: 'My Appointments', path: '/app/patient/appointments', icon: <EventNoteOutlinedIcon /> },
  { label: 'Vitals', path: '/app/patient/vitals', icon: <MonitorHeartOutlinedIcon /> },
  { label: 'Medical Records', path: '/app/patient/medical-records', icon: <DescriptionOutlinedIcon /> },
  { label: 'Test Results', path: '/app/patient/test-results', icon: <ScienceOutlinedIcon /> },
  { label: 'Prescriptions', path: '/app/patient/prescriptions', icon: <MedicationOutlinedIcon /> },
  { label: 'Video Consultation', path: '/app/patient/video', icon: <VideoCameraFrontOutlinedIcon /> },
  { label: 'Profile', path: '/app/patient/profile', icon: <AccountCircleOutlinedIcon /> },
];

export default function PatientLayout() {
  return <DashboardShell roleLabel="My Health" navItems={navItems} />;
}
