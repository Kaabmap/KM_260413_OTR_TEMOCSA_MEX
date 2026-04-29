import { useEffect, useLayoutEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MapView } from '@/components/map/MapView';
import { MapToolbar } from '@/components/map/MapToolbar';
import { BaseMapSwitcher } from '@/components/map/BaseMapSwitcher';
import { ToolStatusBar } from '@/components/map/ToolStatusBar';
import { CommentModal } from '@/components/map/CommentModal';
import { PotreeViewer } from '@/components/potree/PotreeViewer';
import { PhotoModal } from '@/components/photos/PhotoModal';
import { DashboardOverlay } from '@/components/dashboard/DashboardOverlay';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useMapStore } from '@/store/mapStore';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribeGeoBIMComments } from '@/services/geobimComments';

function notifyMapResize() {
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('temocsa-map-resize'));
  });
}

export function GeoportalPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const showPotree = useMapStore((s) => s.showPotreeViewer);
  const potreeUiMode = useMapStore((s) => s.potreeUiMode);

  const splitDocked = showPotree && potreeUiMode === 'docked';

  useLayoutEffect(() => {
    notifyMapResize();
  }, [showPotree, potreeUiMode]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeGeoBIMComments((list) => {
      useMapStore.getState().setComments(list);
    });
    return unsub;
  }, []);

  if (showAdmin) {
    return (
      <div className="flex h-full flex-col">
        <Header />
        <AdminPanel onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={
              splitDocked
                ? 'relative flex min-h-0 flex-[1_1_50%] flex-col'
                : 'relative flex min-h-0 flex-1 flex-col'
            }
          >
            <MapView />
            <DashboardOverlay />
            <MapToolbar onOpenAdmin={() => setShowAdmin(true)} />
            <ToolStatusBar />
            <BaseMapSwitcher />
          </div>

          {splitDocked && (
            <div className="flex min-h-[200px] flex-[1_1_50%] flex-col border-t border-temocsa-gray-700 bg-temocsa-gray-950">
              <PotreeViewer />
            </div>
          )}
        </main>

        {showPotree && potreeUiMode === 'floating' && <PotreeViewer />}
      </div>
      <PhotoModal />
      <CommentModal />
    </div>
  );
}
