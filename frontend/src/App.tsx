import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/app/store';
import { AppRouter } from '@/app/router';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'rounded-cards border border-ash bg-canvas-white text-charcoal shadow-ring',
              title: 'text-sm font-medium text-charcoal',
              description: 'text-sm text-steel',
              actionButton: 'bg-deep-sapphire text-canvas-white rounded-buttons',
              cancelButton: 'bg-paper-mist text-charcoal rounded-buttons',
              success: '[&_[data-icon]]:text-vivid-green',
              error: '[&_[data-icon]]:text-tangerine',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
