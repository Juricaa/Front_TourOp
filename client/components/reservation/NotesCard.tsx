// components/reservations/NotesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface NotesCardProps {
  notes: string;
}

export const NotesCard: React.FC<NotesCardProps> = ({ notes }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {notes}
        </p>
      </CardContent>
    </Card>
  );
};