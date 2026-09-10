import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/common/ui';
import NotificationsList from '../components/common/NotificationsList';
export default function NotificationsPage() {
const { t } = useTranslation();
return (
<div>
<PageHeader title={t('nav.notifications')} />
<NotificationsList />
</div>
);
}
