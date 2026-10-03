import { Outlet } from 'react-router'
import { CatalogProvider } from '../data/CatalogContext'
import { AgentsProvider } from '../data/AgentsContext'
import { PropertiesProvider } from '../data/PropertiesContext'
import { SiteSettingsProvider } from '../data/SiteSettingsContext'
import { NeighborhoodsProvider } from '../data/NeighborhoodsContext'

// Nested only inside ProtectedRoute (see App.jsx) so these providers — and
// the Supabase fetches they kick off on mount — never run before a session
// exists. Fetching earlier would silently return public-only data (RLS
// hides draft properties from anon requests) and go stale after login.
export default function AppProviders() {
  return (
    <CatalogProvider>
      <AgentsProvider>
        <PropertiesProvider>
          <SiteSettingsProvider>
            <NeighborhoodsProvider>
              <Outlet />
            </NeighborhoodsProvider>
          </SiteSettingsProvider>
        </PropertiesProvider>
      </AgentsProvider>
    </CatalogProvider>
  )
}
