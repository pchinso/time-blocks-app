import React from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { templates, loadTemplate, deleteTemplate } = useBlockStore();

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

  return (
    <div className="flex h-full w-full flex-col bg-background p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your saved grid templates</p>
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
