
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BulkMessageSender = () => {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Bulk Messaging Disabled</CardTitle>
        <CardDescription>
          This feature has been disabled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Bulk message sending is currently unavailable.
        </p>
      </CardContent>
    </Card>
  );
};

export default BulkMessageSender;
