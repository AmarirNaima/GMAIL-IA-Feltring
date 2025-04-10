"use client";

import { useState } from "react";
import { Email } from "@/lib/types";
import {
  archiveEmail,
  deleteEmail,
  markAsRead,
  updateEmailPriority,
} from "@/app/api/email-actions";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  AlertCircle,
  Clock,
  Archive,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmailDetails from "@/components/email-details";

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function EmailList({
  emails,
  isLoading,
  onRefresh,
}: EmailListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      selectedPriority === "all" || email.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "important":
        return <Star className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Clock className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map((email) => email.id));
    }
  };

  const handleBulkAction = async (action: "archive" | "delete") => {
    try {
      const promises = selectedEmails.map((id) =>
        action === "archive" ? archiveEmail(id) : deleteEmail(id)
      );
      await Promise.all(promises);
      toast({
        title: `Emails ${action === "archive" ? "archived" : "deleted"}`,
        description: `${selectedEmails.length} email(s) processed.`,
      });
      setSelectedEmails([]);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} selected emails.`,
        variant: "destructive",
      });
    }
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    if (!email.read) {
      try {
        await markAsRead(email.id);
        onRefresh();
      } catch (error) {
        console.error("Error marking email as read:", error);
      }
    }
  };

  const handleChangePriority = async (emailId: string, priority: string) => {
    try {
      await updateEmailPriority(emailId, priority);
      toast({
        title: "Priority updated",
        description: `Email marked as ${priority}`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email priority.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-2 p-2">
                <Skeleton className="h-4 w-4 mt-1.5" />
                <Skeleton className="h-8 w-8 rounded-full mt-1" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEmails.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={
                  selectedEmails.length === filteredEmails.length &&
                  filteredEmails.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedEmails.length > 0
                  ? `${selectedEmails.length} selected`
                  : "Select all"}
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("archive")}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No emails found</div>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`flex items-start gap-2 p-2 rounded-md hover:bg-muted cursor-pointer ${
                    !email.read ? "bg-muted/50 font-medium" : ""
                  }`}
                  onClick={() => handleEmailClick(email)}
                >
                  <Checkbox
                    className="mt-1.5"
                    checked={selectedEmails.includes(email.id)}
                    onCheckedChange={() => handleSelectEmail(email.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage
                      src={`/placeholder.svg?text=${email.sender[0]}`}
                      alt={email.sender}
                    />
                    <AvatarFallback>{email.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{email.sender}</div>
                      <div className="text-xs text-muted-foreground">{email.date}</div>
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newPriority =
                            email.priority === "important" ? "low" : "important";
                          handleChangePriority(email.id, newPriority);
                        }}
                      >
                        {getPriorityIcon(email.priority)}
                      </div>
                      <Badge className="ml-auto" variant="outline">
                        {email.category}
                      </Badge>
                    </div>
                    <div className="font-medium truncate">{email.subject}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {email.preview}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailDetails
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </>
  );
}
