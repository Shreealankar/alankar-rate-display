import React from 'react';
import { useDiwaliTheme } from '@/contexts/DiwaliThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

export const DiwaliThemeToggle: React.FC = () => {
  const { isDiwaliTheme, toggleDiwaliTheme, themeIntensity, setThemeIntensity } = useDiwaliTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Diwali Festival Theme
        </CardTitle>
        <CardDescription>
          Enable special Diwali theme with festive decorations and animations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="diwali-toggle" className="font-semibold">
              Enable Diwali Theme
            </Label>
            <p className="text-xs text-muted-foreground">
              Turn on festive decorations, colors, and animations
            </p>
          </div>
          <Switch
            id="diwali-toggle"
            checked={isDiwaliTheme}
            onCheckedChange={toggleDiwaliTheme}
          />
        </div>

        {isDiwaliTheme && (
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="intensity-select">Theme Intensity</Label>
            <Select value={themeIntensity} onValueChange={(value: any) => setThemeIntensity(value)}>
              <SelectTrigger id="intensity-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subtle">Subtle - Minimal decorations</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced festive look</SelectItem>
                <SelectItem value="full">Full - Maximum celebration!</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isDiwaliTheme && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              🪔 Diwali theme is active! Your customers will see festive decorations, diya lamps, and special Diwali greetings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
