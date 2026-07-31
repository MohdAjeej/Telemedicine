import { Button, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState, PageHeader, StatusBadge } from '@telemedicine/ui';
import {
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../features/notification/notificationApi';

export default function NotificationCenterPage() {
  const { data: notifications = [], isFetching } = useListNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader
        title="Notification Center"
        subtitle="Every notification sent to your account"
        actions={
          unreadCount > 0 ? (
            <Button variant="outlined" disabled={isMarkingAll} onClick={() => markAllRead()}>
              Mark all read ({unreadCount})
            </Button>
          ) : undefined
        }
      />
      {!isFetching && notifications.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification._id}
              divider
              onClick={() => !notification.isRead && markRead(notification._id)}
              sx={{
                cursor: notification.isRead ? 'default' : 'pointer',
                opacity: notification.isRead ? 0.65 : 1,
                alignItems: 'flex-start',
              }}
              secondaryAction={!notification.isRead ? <StatusBadge status="pending" label="New" /> : undefined}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {notification.title}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {notification.body}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
