import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface DraggablePanelProps {
  title: string;
  onClose: () => void;
  width: number;
  height: number;
  children: ReactNode;
}

/** A floating panel (chat, recordings, etc.) that can be dragged by its title bar
 * anywhere on the page — it's fixed to the viewport (not a parent container), so it
 * isn't clipped by the video box and can be moved over the sidebar/header too.
 * Position resets to the top-right of the screen each time the panel is mounted
 * (i.e. reopened). */
export function DraggablePanel({ title, onClose, width, height, children }: DraggablePanelProps) {
  const getDefaultPosition = useCallback(
    () => ({ x: Math.max(16, window.innerWidth - width - 16), y: 80 }),
    [width],
  );

  const [position, setPosition] = useState(getDefaultPosition);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  const clamp = useCallback(
    (x: number, y: number) => {
      const maxX = Math.max(0, window.innerWidth - width);
      const maxY = Math.max(0, window.innerHeight - height);
      return { x: Math.min(Math.max(x, 0), maxX), y: Math.min(Math.max(y, 0), maxY) };
    },
    [width, height],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Let the close button (and anything else interactive in the title bar) work normally.
    if ((event.target as HTMLElement).closest('button')) return;
    dragOrigin.current = { pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;
    const { pointerX, pointerY, x, y } = dragOrigin.current;
    setPosition(clamp(x + (event.clientX - pointerX), y + (event.clientY - pointerY)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1300,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'move',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label={`Close ${title}`}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      {children}
    </Paper>
  );
}
