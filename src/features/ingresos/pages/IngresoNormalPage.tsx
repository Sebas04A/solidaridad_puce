
import { useIngresoNormal } from '../hooks/useIngresoNormal';
import { IngresoHeader } from '../components/IngresoHeader';
import { DonationDetailsSection } from '../components/DonationDetailsSection';
import { AddItemSection } from '../components/AddItemSection';
import { ItemsTable } from '../components/ItemsTable';
import { Button } from '@/components/ui/Button';

export default function IngresoNormalPage({ onBack }: { onBack?: () => void }) {
  const {
    donorType,
    setDonorType,
    selectedDonor,
    setSelectedDonor,
    newDonorName,
    setNewDonorName,
    items,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    isSubmitting
  } = useIngresoNormal();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-sm min-h-screen">
      <IngresoHeader onClose={onBack} />
      
      <div className="mt-6 space-y-8">
        <DonationDetailsSection
          donorType={donorType}
          onTypeChange={setDonorType}
          selectedDonor={selectedDonor}
          onDonorSelect={(d) => {
             setSelectedDonor(d);
             if (d) setNewDonorName('');
          }}
          newDonorName={newDonorName}
          onNewDonorNameChange={(n) => {
            setNewDonorName(n);
            if (n) setSelectedDonor(null);
          }}
        />

        <AddItemSection onAddItem={handleAddItem} />

        <ItemsTable items={items} onRemove={handleRemoveItem} />
        
        <div className="pt-8 border-t border-gray-100 flex justify-end">
          <Button 
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Ingreso a Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
