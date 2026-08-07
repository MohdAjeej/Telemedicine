import { Outlet } from 'react-router-dom';
import { CallProvider } from '../features/videoCall/CallProvider';
import { MinimizedCallWidget } from '../features/videoCall/MinimizedCallWidget';

export default function RootLayout() {
  return (
    <CallProvider>
      <Outlet />
      <MinimizedCallWidget />
    </CallProvider>
  );
}
