import React from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { Card } from '@/components/ui/card';

export const Settings: React.FC = () => {
  const { blinkRate, setBlinkRate } = useBlockStore();

  return (
    <div className="flex h-full w-full flex-col bg-background p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your TimeBlocks experience</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Running Mode</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure how the current time bubble appears in Running mode
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Blink Rate</div>
                  <div className="text-xs text-muted-foreground">
                    Speed of the pulsing animation for the current time bubble
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                    {blinkRate.toFixed(1)}s
                  </span>
                </div>
              </label>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={blinkRate}
                  onChange={(e) => setBlinkRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fast (0.5s)</span>
                  <span>Slow (5s)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <strong>Preview:</strong> The bubble will pulse with a ring animation at this rate when Running mode is active.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">About</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>TimeBlocks</strong> - Visual time management in 10-minute intervals</p>
              <p className="text-xs">Plan your day with bubble-based time blocks</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
