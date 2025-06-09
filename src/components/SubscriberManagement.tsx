
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, X, Edit, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSubscriberDetails, removeSubscriber, updateSubscriber, formatPhoneNumber, getAdditionalNumbers, saveAdditionalNumbers } from '@/utils/notificationUtils';

export const SubscriberManagement = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Array<{id: string, phone_number: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await getSubscriberDetails();
      setSubscribers(data);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newNumber.trim() || newNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(newNumber);
      const currentNumbers = await getAdditionalNumbers();
      
      // Check for duplicates
      if (currentNumbers.includes(formattedNumber)) {
        toast({
          title: "Duplicate Number",
          description: "This number is already in your notification list",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Add the new number
      const updatedNumbers = [...currentNumbers, formattedNumber];
      const success = await saveAdditionalNumbers(updatedNumbers);
      
      if (success) {
        toast({
          title: "Success",
          description: "Subscriber added successfully",
        });
        setNewNumber('');
        loadSubscribers(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: "Failed to add subscriber",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to add subscriber",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscriber = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const success = await removeSubscriber(phoneNumber);
      
      if (success) {
        toast({
          title: "Success",
          description: "Subscriber removed successfully",
        });
        loadSubscribers(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: "Failed to remove subscriber",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (id: string, number: string) => {
    setEditingId(id);
    setEditNumber(number);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNumber('');
  };

  const handleUpdateSubscriber = async (oldPhoneNumber: string) => {
    if (!editNumber.trim() || editNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await updateSubscriber(oldPhoneNumber, editNumber);
      
      if (success) {
        toast({
          title: "Success",
          description: "Subscriber updated successfully",
        });
        setEditingId(null);
        setEditNumber('');
        loadSubscribers(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: "Failed to update subscriber",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Manage Subscribers</CardTitle>
        <CardDescription>
          Add, remove, or edit subscribers for rate update notifications (using localStorage)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Input
            placeholder="Enter mobile number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            disabled={loading}
          />
          <Button
            onClick={handleAddSubscriber}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mobile Number</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      {editingId === subscriber.id ? (
                        <Input
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          disabled={loading}
                          className="w-full"
                        />
                      ) : (
                        subscriber.phone_number
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {editingId === subscriber.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateSubscriber(subscriber.phone_number)}
                              disabled={loading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={cancelEditing}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => startEditing(subscriber.id, subscriber.phone_number)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveSubscriber(subscriber.phone_number)}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriberManagement;
