// src/pages/CaseManagement/CaseActions.jsx

import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Paperclip } from "lucide-react";

// Sample timeline data (replace with real data later)
const caseActions = [
  {
    id: 1,
    type: "Status Update",
    actor: "System",
    timestamp: "2025-08-07 10:15 AM",
    details: "Case status changed to 'Under Review'",
    comment: "",
    attachment: null,
  },
  {
    id: 2,
    type: "Comment",
    actor: "Analyst John Doe",
    timestamp: "2025-08-07 11:00 AM",
    details: "",
    comment: "Investigating customer source of funds. No immediate red flags.",
    attachment: null,
  },
  {
    id: 3,
    type: "File Upload",
    actor: "Analyst Jane Smith",
    timestamp: "2025-08-07 12:45 PM",
    details: "Uploaded supporting document.",
    comment: "",
    attachment: {
      name: "kyc_verification.pdf",
      url: "#",
    },
  },
];

const CaseActions = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Case Actions Timeline</h2>
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {caseActions.map((action) => (
            <Card key={action.id}>
              <CardContent className="p-4 flex gap-4">
                <Avatar>
                  <AvatarFallback>{action.actor[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{action.actor}</h3>
                    <span className="text-sm text-muted-foreground">
                      {action.timestamp}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{action.type}</p>
                  {action.details && (
                    <p className="text-sm text-muted-foreground mt-1">{action.details}</p>
                  )}
                  {action.comment && (
                    <div className="bg-muted p-2 rounded mt-2 text-sm">
                      {action.comment}
                    </div>
                  )}
                  {action.attachment && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:underline cursor-pointer">
                      <Paperclip size={14} />
                      <a href={action.attachment.url}>{action.attachment.name}</a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CaseActions;
