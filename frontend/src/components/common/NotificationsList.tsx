import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '../../utils/constants';
import * as notifSvc from '../../services/notificationService';
import { Badge, Button, EmptyState, ErrorState, PageLoading } from './ui';
import { formatDateTime } from '../../utils/format';
import { useTranslation } from 'react-i18next';
const TYPE_TONE: Record<string, 'green' | 'blue' | 'orange' | 'gray'> = {
order: 'blue', demand_match: 'green', payment: 'green', bulk_offer: 'orange', system: 'gray',
};
export default function NotificationsList() {
const { t } = useTranslation();
const qc = useQueryClient();
const { data, isLoading, error, refetch } = useQuery({ queryKey: qk.notifications(), queryFn: notifSvc.getNotifications });
const markRead = useMutation({ mutationFn: notifSvc.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
const markAll = useMutation({ mutationFn: notifSvc.markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
if (isLoading) return <PageLoading />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
const items = data ?? [];
return (
<div className="space-y-3">
<div className="flex justify-end">
{items.some((n) => !n.read) && (
<Button tone="outline" onClick={() => markAll.mutate()} loading={markAll.isPending}
>{t('common.markAllRead')}</Button>
)}
</div>
{items.length === 0 ? (
<EmptyState title={t('notifications.empty')} subtitle={t('notifications.emptyHint')} />
) : (
items.map((n) => (
<button key={n.id} onClick={() => !n.read && markRead.mutate(n.id)}
className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm ${n.read ? 'border-gray-200' : 'border-farmer'}`}>
<div className="flex items-center justify-between gap-2">
<span className="font-medium">{n.title}</span>
<Badge tone={TYPE_TONE[n.type] ?? 'gray'}>{t(`notifType.${n.type}`)}</Badge>
</div>
<p className="mt-1 text-sm text-gray-600">{n.body}</p>
<p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
</button>
))
)}
</div>
);
}
