export const formatCurrency = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const formatKg = (n: number) => `${Number(n || 0).toLocaleString('en-IN')} kg`;
export const formatDate = (iso?: string) =>
iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 
'-';
export const formatDateTime = (iso?: string) =>
iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
export const todayISO = () => new Date().toISOString().slice(0, 10);
