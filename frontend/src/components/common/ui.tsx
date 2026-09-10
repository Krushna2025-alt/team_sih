import { useState, forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type 
SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError, errorCode } from '../../services/api';
const TONES: Record<string, string> = {
farmer: 'bg-farmer hover:bg-farmer-dark text-white',
buyer: 'bg-buyer hover:bg-buyer-dark text-white',
accent: 'bg-accent hover:bg-orange-600 text-white',
neutral: 'bg-gray-800 hover:bg-gray-900 text-white',
outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800',
danger: 'bg-red-600 hover:bg-red-700 text-white',
ghost: 'text-gray-700 hover:bg-gray-100',
};
export function Button({
tone = 'farmer', loading, className = '', children, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof TONES; loading?: 
boolean }) {
return (
<button
{...props}
disabled={props.disabled || loading}
className={`touch inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium transition disabled:opacity-50 ${TONES[tone]} ${className}`}
>
{loading && <Loader2 size={16} className="animate-spin" />}
{children}
</button>
);
}
export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }) {
  return <div onClick={onClick} className={`touch rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 ${className}`}>{children}</div>;
}
export function Badge({ tone = 'gray', children }: { tone?: 'green' | 'blue' | 'orange' | 'red' | 'gray'; 
children: ReactNode }) {
const map = {
green: 'bg-farmer-light text-farmer-dark', blue: 'bg-buyer-light text-buyer-dark',
orange: 'bg-accent-light text-accent', red: 'bg-red-100 text-red-700', gray: 'bg-gray-100 text-gray-700',
};
return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}
>{children}</span>;
}
export const Spinner = ({ className = '' }) => <Loader2 className={`animate-spin text-farmer ${className}`} size={28} />;
export const PageLoading = () => <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
export function StatCard({ label, value, tone = 'farmer' }: { label: string; value: ReactNode; tone?: 
'farmer' | 'buyer' | 'accent' | 'neutral' }) {
const border = { farmer: 'border-l-farmer', buyer: 'border-l-buyer', accent: 'border-l-accent', neutral: 
'border-l-gray-800' };
return (
<div className={`rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${border[tone]}`}
>
<p className="text-sm text-gray-500">{label}</p>
<p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
</div>
);
}
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: 
ReactNode }) {
return (
<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
<div>
<h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
{subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
</div>
{action}
</div>
);
}
export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: 
ReactNode }) {
return (
<Card className="flex flex-col items-center gap-2 py-10 text-center">
<Inbox className="text-gray-300" size={36} />
<p className="font-medium text-gray-700">{title}</p>
{subtitle && <p className="max-w-sm text-sm text-gray-500">{subtitle}</p>}
{action}
</Card>
);
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
const { t } = useTranslation();
const code = errorCode(error);
const detail = !(error instanceof ApiError) && error instanceof Error ? error.message : undefined;
return (
<Card className="flex flex-col items-center gap-2 py-10 text-center">
<AlertTriangle className="text-accent" size={36} />
<p className="font-medium text-gray-700">{t(`errors.${code}`)}</p>
{detail && <p className="max-w-sm text-sm text-gray-500">{detail}</p>}
{onRetry && <Button tone="outline" onClick={onRetry}>{t('common.retry')}</Button>}
</Card>
);
}
export function Field({ label, error, required, children }: { label: string; error?: string; required?: 
boolean; children: ReactNode }) {
return (
<label className="block">
<span className="mb-1 block text-sm font-medium text-gray-700">
{label}
{required && <span className="text-accent"> *</span>}
</span>
{children}
{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
</label>
);
}
const FIELD_CLS = 'touch w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] focus:border-farmer focus:outline-none focus:ring-1 focus:ring-farmer';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} {...props} className={`${FIELD_CLS} ${props.className ?? ''}`} />
));
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select ref={ref} {...props} className={`${FIELD_CLS} ${props.className ?? ''}`} />
));
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} {...props} className={`${FIELD_CLS} ${props.className ?? ''}`} />
));
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: 
string; children: ReactNode }) {
if (!open) return null;
return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" 
onClick={onClose}>
<div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}
>
<div className="mb-3 flex items-center justify-between">
<h3 className="font-semibold">{title}</h3>
<button onClick={onClose} className="touch rounded-lg p-2 hover:bg-gray-100" aria-label="Close"><X size={18} /></button>
</div>
{children}
</div>
</div>
);
}
export function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
return (
<div className="flex gap-1">
{[1, 2, 3, 4, 5].map((n) => (
<button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)}
className={`touch text-2xl leading-none ${n <= value ? 'text-yellow-500' : 'text-gray-300'}`} aria-label={`${n} star`}>
★
</button>
))}
</div>
);
}
export function StatusBadge({ status }: { status: string }) {
const { t } = useTranslation();
const tone = status === 'delivered' || status === 'accepted' || status === 'active' || status === 
'resolved'
? 'green' : status === 'confirmed' || status === 'matched' ? 'blue'
: status === 'pending' || status === 'open' ? 'orange'
: status === 'rejected' || status === 'cancelled' || status === 'inactive' ? 'red' : 'gray';
return <Badge tone={tone as 'green'}>{t(`status.${status}`, status)}</Badge>;
}
export function RatingModal({ open, onClose, title, loading, onSubmit }: {
open: boolean; onClose: () => void; title: string; loading: boolean;
onSubmit: (stars: number, comment: string) => void;
}) {
const { t } = useTranslation();
const [stars, setStars] = useState(5);
const [comment, setComment] = useState('');
return (
<Modal open={open} onClose={onClose} title={title}>
<Stars value={stars} onChange={setStars} />
<Textarea rows={3} className="mt-3" value={comment} onChange={(e) => 
setComment(e.target.value)} placeholder={t('orders.comment')} />
<Button className="mt-3 w-full" loading={loading} onClick={() => onSubmit(stars, comment)}
>{t('common.submit')}</Button>
</Modal>
);
}
