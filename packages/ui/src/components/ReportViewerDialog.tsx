import { useEffect, useState, type WheelEvent } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

export interface ReportViewerDialogProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  title?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function isPdfUrl(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return url.toLowerCase().endsWith('.pdf');
  }
}

/** Opens a lab report (image or PDF) in-place instead of navigating to a new tab.
 * Images get zoom in/out controls (buttons + Ctrl+scroll) since <img> has no native
 * zoom; PDFs render in an iframe, which browsers already give a native zoomable viewer. */
export function ReportViewerDialog({ open, onClose, url, title = 'Report' }: ReportViewerDialogProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    if (open) setZoom(MIN_ZOOM);
  }, [open, url]);

  if (!url) return null;
  const isPdf = isPdfUrl(url);

  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        {title}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {!isPdf && (
            <>
              <Tooltip title="Zoom out">
                <span>
                  <IconButton size="small" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
                    <ZoomOutRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Zoom in">
                <span>
                  <IconButton size="small" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
                    <ZoomInRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Reset zoom">
                <IconButton size="small" onClick={() => setZoom(MIN_ZOOM)}>
                  <RestartAltRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        onWheel={isPdf ? undefined : handleWheel}
        sx={{
          p: 0,
          overflow: 'auto',
          bgcolor: 'grey.900',
        }}
      >
        {isPdf ? (
          <iframe src={url} title={title} style={{ width: '100%', height: '100%', border: 'none' }} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Box
              component="img"
              src={url}
              alt={title}
              sx={{
                display: 'block',
                maxWidth: '100%',
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
