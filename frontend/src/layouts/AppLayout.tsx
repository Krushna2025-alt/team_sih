import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
export default function AppLayout() {
return (
<div className="flex min-h-screen flex-col">
<Navbar />
<main className="mx-auto w-full max-w-6xl flex-1 p-4"><Outlet /></main>
<footer className="border-t bg-white py-3 text-center text-sm text-gray-500">
&copy; {new Date().getFullYear()} KrishiLink &middot; <Link className="hover:underline" to="/">krishilink</Link>
</footer>
</div>
);
}
