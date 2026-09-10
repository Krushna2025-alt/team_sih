import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createListing } from '../../services/listingService';
import { errorMessage } from '../../services/api';
import { todayISO } from '../../utils/format';
import { Button, Card, Field, Input, PageHeader } from '../../components/common/ui';
import type { VoiceExtractionResult } from '../../types';

type Phase = 'idle' | 'recording' | 'processing' | 'review' | 'publishing' | 'published';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const localExtract = (text: string): VoiceExtractionResult => {
  const lower = text.toLowerCase();
  
  let product = '';
  if (lower.includes('tomato') || lower.includes('tamatar')) product = 'Tomato';
  else if (lower.includes('potato') || lower.includes('aloo') || lower.includes('batata')) product = 'Potato';
  else if (lower.includes('onion') || lower.includes('kanda') || lower.includes('pyaz')) product = 'Onion';
  else if (lower.includes('wheat') || lower.includes('gehun')) product = 'Wheat';
  else if (lower.includes('rice') || lower.includes('chawal') || lower.includes('bhaat')) product = 'Rice';
  
  let quantityKg = 0;
  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kilo|kg|kilogram|kilograms)/);
  if (qtyMatch) quantityKg = parseFloat(qtyMatch[1]);
  else {
    const numMatch = lower.match(/\b(\d{2,4})\b/);
    if (numMatch) quantityKg = parseFloat(numMatch[1]);
  }
  
  let pricePerKg = 0;
  const priceMatch = lower.match(/(?:rs|rupees|inr|₹)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:rs|rupees|inr|₹)/);
  if (priceMatch) pricePerKg = parseFloat(priceMatch[1] || priceMatch[2]);
  
  return {
    product,
    quantityKg,
    pricePerKg,
    unit: 'kg',
    location: '', 
    availableFrom: todayISO(),
    transcript: text
  };
};

export default function FarmerListingVoice() {
const { t, i18n } = useTranslation();
const nav = useNavigate();
const [phase, setPhase] = useState<Phase>('idle');
const [seconds, setSeconds] = useState(0);
const [result, setResult] = useState<VoiceExtractionResult | null>(null);
const [error, setError] = useState('');
const recRef = useRef<any>(null);
const timerRef = useRef<number | undefined>(undefined);
const [interimText, setInterimText] = useState('');
const finalTranscriptRef = useRef('');
const [form, setForm] = useState({ product: '', quantityKg: '', pricePerKg: '', location: '', 
availableFrom: todayISO() });
const startRecording = async () => {
setError('');
setInterimText('');
finalTranscriptRef.current = '';

if (!SpeechRecognition) {
  setError("Speech recognition is not supported in your browser. Please type your listing manually.");
  return;
}

try {
  const recognition = new SpeechRecognition();
  recognition.lang = i18n.language === 'hi' ? 'hi-IN' : (i18n.language === 'mr' ? 'mr-IN' : 'en-IN');
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscriptRef.current += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    setInterimText(interim);
  };

  recognition.onerror = (event: any) => {
    if (event.error !== 'aborted') {
      setError(`Microphone error: ${event.error}`);
    }
    stopRecording();
  };

  recognition.onend = () => {
    const fullText = (finalTranscriptRef.current + ' ' + interimText).trim();
    if (fullText) {
      setPhase('processing');
      const r = localExtract(fullText);
      setResult(r);
      setForm({
        product: r.product, 
        quantityKg: r.quantityKg ? String(r.quantityKg) : '', 
        pricePerKg: r.pricePerKg ? String(r.pricePerKg) : '', 
        location: r.location, 
        availableFrom: r.availableFrom
      });
      setPhase('review');
    } else {
      setPhase('idle');
    }
  };

  recognition.start();
  recRef.current = recognition;
  setPhase('recording');
  setSeconds(0);
  timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
} catch (err: any) {
  setError(t('voice.micDenied') + ' ' + err.message);
}
};
const stopRecording = () => {
recRef.current?.stop();
if (timerRef.current) window.clearInterval(timerRef.current);
};
const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
setForm((f) => ({ ...f, [k]: e.target.value }));
const publish = async () => {
setPhase('publishing'); setError('');
try {
await createListing({
product: form.product, quantityKg: Number(form.quantityKg), pricePerKg: 
Number(form.pricePerKg),
quality: 'B', availableFrom: form.availableFrom, delivery: 'pickup',
});
setPhase('published');
setTimeout(() => nav('/farmer/listings'), 900);
} catch (err) {
setError(errorMessage(err));
setPhase('review');
}
};
return (
<div className="mx-auto max-w-lg space-y-4">
<PageHeader title={t('voice.title')} subtitle={t('voice.hint')} />
{error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
 <Card className="flex flex-col items-center gap-3 py-8"> 
 {phase === 'idle' && ( 
 <> 
 <button onClick={startRecording} aria-label={t('voice.start')} 
 className="touch flex h-28 w-28 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-orange-600"> 
 <Mic size={48} /> 
 </button> 
 <p className="font-medium">{t('voice.start')}</p> 
 </> 
 )} 
 {phase === 'recording' && ( 
 <> 
 <button onClick={stopRecording} aria-label={t('voice.stop')} 
 className="touch flex h-28 w-28 animate-pulse items-center justify-center rounded-full bg-red-600 text-white shadow-lg"> 
 <Square size={44} /> 
 </button> 
 <p className="flex items-center gap-2 font-medium text-red-600"> 
 <span className="h-3 w-3 animate-pulse rounded-full bg-red-600" /> 
 {t('voice.recording')} {seconds}s 
 </p> 
 {interimText && <p className="mt-2 text-sm text-gray-500 italic max-w-xs text-center">"{interimText}"</p>}
 </> 
 )} 
 {phase === 'processing' && <p className="animate-pulse font-medium text-accent">{t('voice.processing')}</p>} 
 {phase === 'publishing' && <p className="animate-pulse font-medium">{t('common.loading')}</p>} 
 {phase === 'published' && <p className="font-semibold text-farmer-dark">{t('voice.published')}</p>} 
 </Card>
 {['review', 'publishing'].includes(phase) && result && ( 
 <> 
 {result.transcript && ( 
 <Card> 
 <p className="text-sm font-medium text-gray-500">{t('voice.transcript')}</p> 
 <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm italic">"{result.transcript}"</p> 
 {result.unit && <p className="mt-2 text-xs text-gray-400">unit: {result.unit} (kg)</p>} 
 </Card> 
 )} 
 <Card className="space-y-4"> 
 <p className="text-sm font-semibold">{t('voice.extracted')}</p> 
 <p className="text-xs text-gray-500">{t('voice.editHint')}</p> 
 <Field label={t('listings.productName')} required><Input value={form.product} onChange={set('product')} /></Field> 
 <div className="grid grid-cols-2 gap-3"> 
 <Field label={`${t('common.quantity')} (kg)`} required><Input type="number" value={form.quantityKg} onChange={set('quantityKg')} /></Field> 
 <Field label={t('listings.expectedPrice')} required><Input type="number" value={form.pricePerKg} onChange={set('pricePerKg')} /></Field> 
 </div> 
 <Field label={t('profile.location')}><Input value={form.location} onChange={set('location')} /></Field> 
 <Field label={t('listings.availableFrom')} required><Input type="date" value={form.availableFrom} onChange={set('availableFrom')} /></Field> 
 <div className="flex flex-wrap gap-2"> 
 <Button onClick={publish} loading={phase === 'publishing'}>{t('voice.confirmPublish')}</Button> 
 <Button tone="accent" onClick={() => { setResult(null); setPhase('idle'); }}>{t('voice.reRecord')}</Button> 
 <Button tone="outline" onClick={() => setResult({ ...result, transcript: '' })}>{t('voice.editManually')}</Button> 
 </div> 
 </Card> 
 </> 
 )} 
</div> 
);
}
