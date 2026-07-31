import { useState } from 'react';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { formatDistanceToNow } from 'date-fns';
import {
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useUnreadNotificationCountQuery,
} from '../../features/notification/notificationApi';

export default function NotificationBell() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: count = 0 } = useUnreadNotificationCountQuery(undefined, { pollingInterval: 30000 });
  const { data: notifications = [] } = useListNotificationsQuery(undefined, { skip: !anchor });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  return (
    <>
      <IconButton onClick={(event) => setAnchor(event.currentTarget)}>
        <Badge badgeContent={count} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notifications
          </Typography>
          {count > 0 && (
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => markAllRead()}
            >
              Mark all read
            </Typography>
          )}
        </Box>
        <Divider />
        <List dense sx={{ py: 0 }}>
          {notifications.length === 0 && (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No notifications yet
              </Typography>
            </Box>
          )}
          {notifications.map((notification) => (
            <ListItemButton
              key={notification._id}
              onClick={() => markRead(notification._id)}
              sx={{ opacity: notification.isRead ? 0.6 : 1, alignItems: 'flex-start' }}
            >
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    {notification.body}
                    <br />
                    <Typography component="span" variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Menu>
    </>
  );
}
