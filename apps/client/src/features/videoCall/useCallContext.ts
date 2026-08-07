import { useContext } from 'react';
import { CallContext, type CallContextValue } from './callContext';

export function useCallContext(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be used within a CallProvider');
  return ctx;
}
