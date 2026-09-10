import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common/ui';
export default function NotFound() {
return (
<div className="flex min-h-screen items-center justify-center p-4">
<Card className="max-w-sm text-center">
<p className="text-4xl">🌾</p>
<h1 className="mt-2 text-lg font-bold">404</h1>
<p className="text-sm text-gray-500">This page does not exist.</p>
<Link to="/" className="mt-4 inline-block"><Button tone="outline">🏠 KrishiLink</Button></Link>
</Card>
</div>
);
}
