import React, { useEffect } from 'react';
import { useAppSelector } from './store';
import { selectTheme } from './features/machines/machineSelectors';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardPage />
      </main>
    </div>
  );
};

export default App;
