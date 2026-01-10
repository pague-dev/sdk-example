import type { Customer } from '@pague-dev/sdk-node';
import type { SelectorColor } from '../ui/types';
import { radioColors } from '../ui/theme';
import { Spinner } from '../ui/Spinner';
import { ToggleGroup } from '../ui/ToggleGroup';

interface CustomerSelectorProps {
  customers: Customer[];
  loading: boolean;
  name: string;
  color: SelectorColor;
  useExisting: boolean;
  onToggle: (useExisting: boolean) => void;
  toggleLabels?: { manual: string; existing: string };
}

export function CustomerSelector({
  customers,
  loading,
  name,
  color,
  useExisting,
  onToggle,
  toggleLabels = { manual: 'Informar manualmente', existing: 'Cliente existente' },
}: CustomerSelectorProps) {
  return (
    <>
      <ToggleGroup
        options={[
          { value: 'manual', label: toggleLabels.manual },
          { value: 'existing', label: toggleLabels.existing },
        ]}
        value={useExisting ? 'existing' : 'manual'}
        onChange={(v) => onToggle(v === 'existing')}
        color={color}
      />

      {useExisting && (
        loading ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <Spinner />
            Carregando clientes...
          </div>
        ) : customers.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {customers.map((customer) => (
              <label
                key={customer.id}
                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                <input type="radio" name={name} value={customer.id} className={`w-4 h-4 ${radioColors[color]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{customer.name}</p>
                  <p className="text-zinc-500 text-xs">{customer.document}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Nenhum cliente cadastrado. Crie um na aba Clientes.</p>
        )
      )}
    </>
  );
}
