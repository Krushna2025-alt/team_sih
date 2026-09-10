import { useTranslation } from 'react-i18next';
import { Badge, Card, PageHeader } from '../components/common/ui';
import ProfileForm from '../components/common/ProfileForm';
import { useAuth } from '../context/AuthContext';
export default function ProfilePage() {
const { t } = useTranslation();
const { user } = useAuth();
return (
<div className="space-y-4">
<PageHeader
title={t('profile.title')}
action={user?.verified ? <Badge tone="green">{t('ratings.verified')} </Badge> : <Badge 
tone="orange">{t('admin.unverified')}</Badge>}
/>
<ProfileForm />
{user?.rating != null && (
<Card className="max-w-md">
<p className="text-sm text-gray-500">{t('ratings.reliability')}</p>
<p className="text-xl font-bold">{user.reliability ?? '—'}% &middot; ⭐ {user.rating}</p>
</Card>
)}
</div>
);
}
