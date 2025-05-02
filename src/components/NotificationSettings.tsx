
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdditionalNumbers, saveAdditionalNumbers } from '@/utils/notificationUtils';

export const NotificationSettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [additionalNumbers, setAdditionalNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing additional numbers when component mounts
  useEffect(() => {
    const loadNumbers = async () => {
      setIsLoading(true);
      try {
        const numbers = await getAdditionalNumbers();
        setAdditionalNumbers(numbers);
      } catch (error) {
        console.error('Error loading additional numbers:', error);
        toast({
          title: "Error",
          description: "Failed to load notification settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNumbers();
  }, [toast]);

  const handleAddNumber = () => {
    // Basic validation
    if (!newNumber || newNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicates
    if (additionalNumbers.includes(newNumber)) {
      toast({
        title: "Duplicate Number",
        description: "This number is already in your notification list",
        variant: "destructive",
      });
      return;
    }
    
    // Add to the list
    setAdditionalNumbers([...additionalNumbers, newNumber]);
    setNewNumber(''); // Clear the input
  };

  const handleRemoveNumber = (numberToRemove: string) => {
    setAdditionalNumbers(additionalNumbers.filter(num => num !== numberToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveAdditionalNumbers(additionalNumbers);
      
      if (success) {
        toast({
          title: "Success",
          description: "Notification settings saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save notification settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving additional numbers:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.notificationSettings') || 'Notification Settings'}</CardTitle>
          <CardDescription>
            {t('dashboard.notificationDescription') || 'Add additional mobile numbers to receive rate update notifications'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="newNumber" className="text-sm font-medium">
                  {t('dashboard.addNumber') || 'Add Mobile Number'}
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="newNumber"
                    placeholder="Enter 10-digit mobile number"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    maxLength={10}
                    type="tel"
                    pattern="[0-9]{10}"
                  />
                  <Button onClick={handleAddNumber} type="button">
                    Add
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t('dashboard.numberList') || 'Notification Recipients'}
                </h3>
                {additionalNumbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.noNumbers') || 'No additional numbers added yet'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {additionalNumbers.map((number, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{number}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNumber(number)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : t('dashboard.saveSettings') || 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
