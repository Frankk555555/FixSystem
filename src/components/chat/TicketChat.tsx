"use client";

import { useEffect, useState, useRef } from "react";
import { Send, ImagePlus, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TicketMessage = Tables<"ticket_messages">;
type Profile = Tables<"profiles">;

interface MessageWithProfile extends TicketMessage {
  profiles?: { full_name: string } | null;
}

export function TicketChat({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!user || !ticketId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Extract unique sender IDs
      const senderIds = Array.from(new Set(messagesData.map((m) => m.sender_id)));

      // Fetch profiles for these senders
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", senderIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

      const combinedMessages = messagesData.map((msg) => ({
        ...msg,
        profiles: profilesMap.get(msg.sender_id) || { full_name: "ผู้ใช้งาน" },
      }));

      setMessages(combinedMessages as MessageWithProfile[]);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`ticket_messages_${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          const newMessage = payload.new as TicketMessage;
          
          // Fetch sender profile to append full_name
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMessage.sender_id)
            .maybeSingle();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, profiles: profileData },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !ticketId) return;

    setSending(true);
    const { error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message: inputText.trim(),
      });

    setSending(false);
    if (error) {
      toast.error(`ส่งข้อความไม่สำเร็จ: ${error.message}`);
    } else {
      setInputText("");
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          กำลังโหลดประวัติการสนทนา...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-border/80 flex flex-col h-[500px]">
      <CardHeader className="border-b bg-muted/20 py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          แชทสนทนากับช่างซ่อม
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 pt-12">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Send className="h-5 w-5 opacity-50" />
              </div>
              <p>ยังไม่มีข้อความ</p>
              <p className="text-xs">พิมพ์ข้อความเพื่อเริ่มการสนทนา</p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const senderName = msg.profiles?.full_name || "ผู้ใช้งาน";
                const time = new Date(msg.created_at).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                        {isMe ? "ME" : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div
                      className={cn(
                        "flex flex-col max-w-[75%]",
                        isMe ? "items-end" : "items-start"
                      )}
                    >
                      <div className="flex items-baseline gap-2 mb-1 px-1">
                        <span className="text-xs font-medium text-foreground/80">
                          {isMe ? "ฉัน" : senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-3 bg-muted/10">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความที่นี่..."
            className="flex-1 bg-background"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim() || sending}
            className="shrink-0 shadow-soft"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
