// lib/api/email-actions.ts

export const archiveEmail = async (id: string) => {
    await fetch("/api/gmail/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: id }),
    });
  };
  
  export const deleteEmail = async (id: string) => {
    await fetch("/api/gmail/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: id }),
    });
  };
  
  export const markAsRead = async (id: string) => {
    await fetch("/api/gmail/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: id }),
    });
  };
  
  export const updateEmailPriority = async (id: string, priority: string) => {
    await fetch("/api/gmail/priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: id, priority }),
    });
  };
  