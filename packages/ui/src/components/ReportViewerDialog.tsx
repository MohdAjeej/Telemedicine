import { useEffect, useState, type ReactNode, type WheelEvent } from 'react';
import { Box, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

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

export interface ReportViewerPanelProps {
  url: string;
  title?: string;
  onClose: () => void;
  /** Rendered in the title bar next to the close button — e.g. a caller-supplied
   * Maximize/Restore toggle when this panel is embedded (not shown in a Dialog). */
  extraActions?: ReactNode;
}

/** The report title bar (zoom controls + actions) and body (image or PDF), factored out
 * of ReportViewerDialog so a caller can dock it inline in a layout — e.g. beside an
 * in-progress video call — instead of only ever showing it as an overlay dialog. */
export function ReportViewerPanel({ url, title = 'Report', onClose, extraActions }: ReportViewerPanelProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    setZoom(MIN_ZOOM);
  }, [url]);

  const isPdf = isPdfUrl(url);

  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {title}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
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
          {extraActions}
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        onWheel={isPdf ? undefined : handleWheel}
        sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'grey.900' }}
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
      </Box>
    </Box>
  );
}

export interface ReportViewerDialogProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  title?: string;
}

/** Opens a lab report (image or PDF) in a large centered dialog instead of navigating
 * to a new tab. For pages that need the report to sit alongside other content (e.g. an
 * active video call) instead of covering the whole screen, use ReportViewerPanel directly. */
export function ReportViewerDialog({ open, onClose, url, title = 'Report' }: ReportViewerDialogProps) {
  if (!url) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
      <ReportViewerPanel url={url} title={title} onClose={onClose} />
    </Dialog>
  );
}
