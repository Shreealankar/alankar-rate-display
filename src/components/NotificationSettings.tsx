
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdditionalNumbers, saveAdditionalNumbers } from '@/utils/notificationUtils';

export const NotificationSettings = () => {
  const [numbers, setNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Load saved numbers on component mount
    const savedNumbers = getAdditionalNumbers();
    setNumbers(savedNumbers || []);
  }, []);

  const handleAddNumber = () => {
    if (!newNumber || newNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (numbers.includes(newNumber)) {
      toast({
        title: "Duplicate Number",
        description: "This number is already in the list",
        variant: "destructive",
      });
      return;
    }

    const updatedNumbers = [...numbers, newNumber];
    setNumbers(updatedNumbers);
    saveAdditionalNumbers(updatedNumbers);
    setNewNumber('');
    
    toast({
      title: "Number Added",
      description: "Mobile number has been added to notifications list",
    });
  };

  const handleRemoveNumber = (index: number) => {
    const updatedNumbers = [...numbers];
    updatedNumbers.splice(index, 1);
    setNumbers(updatedNumbers);
    saveAdditionalNumbers(updatedNumbers);
    
    toast({
      title: "Number Removed",
      description: "Mobile number has been removed from notifications list",
    });
  };

  const handleSaveAll = () => {
    setIsLoading(true);
    saveAdditionalNumbers(numbers);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated",
      });
    }, 500);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{t('dashboard.notificationTitle') || 'SMS Notification Settings'}</CardTitle>
        <CardDescription>
          {t('dashboard.notificationDescription') || 'Add mobile numbers to receive rate update notifications'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter 10-digit mobile number"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              maxLength={10}
              type="tel"
              pattern="[0-9]{10}"
            />
            <Button onClick={handleAddNumber}>Add</Button>
          </div>
          
          <div className="space-y-2">
            {numbers && numbers.length > 0 ? (
              <div className="border rounded-md divide-y">
                {numbers.map((number, index) => (
                  <div key={index} className="flex justify-between items-center p-3">
                    <span>{number}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveNumber(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-3">No additional notification numbers added</p>
            )}
          </div>
          
          <Button 
            className="w-full"
            disabled={isLoading} 
            onClick={handleSaveAll}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
