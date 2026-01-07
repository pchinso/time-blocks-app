import React, { useRef } from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, PlayCircle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { templates, loadTemplate, deleteTemplate } = useBlockStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoad = (id: string) => {
    const ok = loadTemplate(id);
    if (ok) {
      toast.success('Template loaded');
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'grid' }));
    } else {
      toast.error('Template not found');
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this template?')) return;
    deleteTemplate(id);
    toast.success('Template deleted');
  };

  const handleExport = (tpl: typeof templates[0]) => {
    const json = JSON.stringify(tpl, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tpl.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template exported');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTemplate = JSON.parse(content);
        
        // Validate template structure
        if (!importedTemplate.blocks || !Array.isArray(importedTemplate.blocks) ||
            !importedTemplate.tasks || !Array.isArray(importedTemplate.tasks)) {
          toast.error('Invalid template format');
          return;
        }

        // Generate new ID to avoid conflicts
        const newTemplate = {
          ...importedTemplate,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          name: importedTemplate.name + ' (imported)',
        };

        // Add to templates
        useBlockStore.setState((state) => ({
          templates: [newTemplate, ...state.templates],
        }));

        toast.success('Template imported successfully');
      } catch (error) {
        toast.error('Failed to import template');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-background p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your saved grid templates</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImportClick}
            className="gap-1"
          >
            <Upload className="h-4 w-4" /> Import
          </Button>
          <input 
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        </div>

        {templates.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No templates yet. Go to Grid and click "Save Template" to create one.
          </Card>
        ) : (
          <div className="grid gap-3">
            {templates.map(tpl => (
              <Card key={tpl.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">{tpl.name}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(tpl.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default" onClick={() => handleLoad(tpl.id)} className="gap-1">
                    <PlayCircle className="h-3 w-3" /> Load
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleExport(tpl)} 
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" /> Export
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(tpl.id)} className="gap-1">
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
