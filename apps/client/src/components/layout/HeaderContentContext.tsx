import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderContentContextValue {
  headerContent: ReactNode;
  setHeaderContent: (content: ReactNode) => void;
}

const HeaderContentContext = createContext<HeaderContentContextValue | null>(null);

/** Wraps DashboardShell so pages rendered in its Outlet can push content (e.g. the
 * video call's patient/tabs bar) into the fixed AppBar instead of the scrollable body. */
export function HeaderContentProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode>(null);
  return (
    <HeaderContentContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContentContext.Provider>
  );
}

export function useHeaderContent() {
  const context = useContext(HeaderContentContext);
  if (!context) {
    throw new Error('useHeaderContent must be used within a HeaderContentProvider');
  }
  return context;
}
