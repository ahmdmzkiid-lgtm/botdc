import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { Layout } from './components/Layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { GuildSelect } from './pages/GuildSelect';
import { Dashboard } from './pages/Dashboard';
import { WelcomePage } from './pages/Welcome';
import { LevelingPage } from './pages/Leveling';
import { ReactionRolesPage } from './pages/ReactionRoles';
import { AutoModPage } from './pages/AutoMod';
import { CommandsPage } from './pages/Commands';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/select-guild" element={<GuildSelect />} />
            <Route path="/guild/:guildId" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="welcome" element={<WelcomePage />} />
              <Route path="leveling" element={<LevelingPage />} />
              <Route path="reaction-roles" element={<ReactionRolesPage />} />
              <Route path="automod" element={<AutoModPage />} />
              <Route path="commands" element={<CommandsPage />} />
            </Route>
          </Routes>
          <ToastContainer />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
