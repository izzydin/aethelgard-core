import { useState } from 'react';
import { SuperSelect } from './components/shared/SuperSelect';

const OptionsList = [
  { id: '1', name: 'Albedo' },
  { id: '2', name: 'Bedivere' },
  { id: '3', name: 'Lancelot' },
  { id: '4', name: 'Gawain' },
];

function App() {
  const [selected, setSelected] = useState('');

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-card to-brand-dark py-20 flex flex-col items-center">
      <h1 className="text-4xl font-semibold mb-10 tracking-tight">Component Lab</h1>
      
      <div className="w-full max-w-md p-8 rounded-2xl glassmorphism">
        <h2 className="text-xl mb-6 font-mono text-slate-300">SuperSelect Module</h2>
        <SuperSelect value={selected} onChange={setSelected}>
          <SuperSelect.Input placeholder="Select Knight..." />
          <SuperSelect.List>
            {OptionsList.map((opt) => (
              <SuperSelect.Option key={opt.id} value={opt.id} label={opt.name}>
                {({ active, selected }) => (
                  <div className="flex items-center justify-between w-full">
                    <span className={active ? 'font-medium' : ''}>{opt.name}</span>
                    {selected && <span className="text-brand-gold-base text-xs uppercase tracking-widest font-mono">Selected</span>}
                  </div>
                )}
              </SuperSelect.Option>
            ))}
          </SuperSelect.List>
        </SuperSelect>
      </div>
    </main>
  );
}

export default App;
