import React, { useState } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AiCopilotDrawer } from './components/layout/AiCopilotDrawer';
import { ExportCenterModal } from './components/modals/ExportCenterModal';
import { GoogleAccountsModal } from './components/modals/GoogleAccountsModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PromptStudioView } from './components/views/PromptStudioView';
import { ImageEditorView } from './components/views/ImageEditorView';
import { AiEnhanceView } from './components/views/AiEnhanceView';
import { ExpandView } from './components/views/ExpandView';
import { GenerativeEditView } from './components/views/GenerativeEditView';
import { ImageToPromptView } from './components/views/ImageToPromptView';
import { DesignDecomposerView } from './components/views/DesignDecomposerView';
import { CollageStudioView } from './components/views/CollageStudioView';
import { BackgroundStudioView } from './components/views/BackgroundStudioView';
import { TextOcrView } from './components/views/TextOcrView';
import { FontsView } from './components/views/FontsView';
import { ColorsView } from './components/views/ColorsView';
import { PrintPrepView } from './components/views/PrintPrepView';
import { LaserPrepView } from './components/views/LaserPrepView';
import { AssetLibraryView } from './components/views/AssetLibraryView';
import { ProjectsView } from './components/views/ProjectsView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';

const StudioMain: React.FC = () => {
  const { currentView } = useStudio();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'create':
      case 'prompt-to-image':
        return <PromptStudioView initialMode="generate" />;
      case 'prompt-library':
        return <PromptStudioView initialMode="library" />;
      case 'image-editor':
        return <ImageEditorView />;
      case 'ai-enhance':
        return <AiEnhanceView />;
      case 'expand':
        return <ExpandView />;
      case 'generative-edit':
        return <GenerativeEditView />;
      case 'image-to-prompt':
        return <ImageToPromptView />;
      case 'design-decomposer':
        return <DesignDecomposerView />;
      case 'collage-studio':
        return <CollageStudioView />;
      case 'background-cutout':
        return <BackgroundStudioView />;
      case 'text-ocr':
        return <TextOcrView />;
      case 'fonts':
        return <FontsView />;
      case 'colors':
        return <ColorsView />;
      case 'print-prep':
        return <PrintPrepView />;
      case 'laser-prep':
        return <LaserPrepView />;
      case 'asset-library':
        return <AssetLibraryView />;
      case 'projects':
        return <ProjectsView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100 select-none">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Studio Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{renderCurrentView()}</main>
      </div>

      {/* Context-aware AI Copilot Drawer */}
      <AiCopilotDrawer />

      {/* Export Center Modal */}
      <ExportCenterModal />

      {/* Google Accounts & Free Quota Manager Modal */}
      <GoogleAccountsModal />
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <StudioMain />
    </StudioProvider>
  );
}
