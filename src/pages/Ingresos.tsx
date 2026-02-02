
import { useState } from 'react';
import { IngresosDashboard } from '@/features/ingresos/pages/IngresosDashboard';
import IngresoNormalPage from '@/features/ingresos/pages/IngresoNormalPage';
import IngresoCrisisPage from '@/features/ingresos/pages/IngresoCrisisPage';

type ViewState = 'dashboard' | 'normal' | 'crisis';

export function IngresosPage() {
  const [view, setView] = useState<ViewState>('dashboard');

  if (view === 'normal') {
    return <IngresoNormalPage onBack={() => setView('dashboard')} />;
  }

  if (view === 'crisis') {
    return <IngresoCrisisPage onBack={() => setView('dashboard')} />;
  }

  return (
    <IngresosDashboard onNavigate={setView} />
  );
}
