import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SuperSelect } from './SuperSelect';

const OptionsList = [
  { id: '1', name: 'Albedo' },
  { id: '2', name: 'Bedivere' },
  { id: '3', name: 'Bediveer' }, // Similar to test filtering
  { id: '4', name: 'Cecilia' },
];

const TestComponent = () => {
  const [selected, setSelected] = useState('');

  return (
    <SuperSelect value={selected} onChange={setSelected}>
      <SuperSelect.Input placeholder="Search characters..." />
      <SuperSelect.List>
        {OptionsList.map((opt) => (
          <SuperSelect.Option key={opt.id} value={opt.id} label={opt.name}>
            {({ active, selected }) => (
              <span>
                {opt.name} {selected && '✓'} {active && '*'}
              </span>
            )}
          </SuperSelect.Option>
        ))}
      </SuperSelect.List>
    </SuperSelect>
  );
};

describe('SuperSelect Component', () => {
  it('has proper accessibility roles (listbox/option)', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const input = screen.getByPlaceholderText('Search characters...');
    await user.click(input);
    
    // Ensure roles exist
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
  });

  it('supports keyboard navigation (ArrowDown to focus)', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const input = screen.getByPlaceholderText('Search characters...');
    await user.click(input);
    
    await user.keyboard('{ArrowDown}');
    const firstOption = screen.getByText(/Albedo/);
    expect(firstOption.textContent).toContain('*'); // Visual indicator applied via render prop

    await user.keyboard('{ArrowDown}');
    const secondOption = screen.getByText(/Bedivere/);
    expect(secondOption.textContent).toContain('*');
  });

  it('handles filtering logic correctly', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const input = screen.getByPlaceholderText('Search characters...');
    await user.type(input, 'Bedi');
    
    // Non-matches should not be in the document
    expect(screen.queryByText(/Albedo/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cecilia/)).not.toBeInTheDocument();
    
    // Matches should be present
    expect(screen.getByText(/Bedivere/)).toBeInTheDocument();
    expect(screen.getByText(/Bediveer/)).toBeInTheDocument();
  });
});
