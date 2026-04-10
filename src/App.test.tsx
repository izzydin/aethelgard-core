import { render } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  it('renders successfully', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
