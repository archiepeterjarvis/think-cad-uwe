"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const chatHistory = [
  {
    id: 1,
    title: "Mounting Bracket Design",
    timestamp: "2 hours ago",
    preview: "Create a rectangular bracket with mounting holes...",
    status: "completed",
  },
  {
    id: 2,
    title: "Custom Enclosure",
    timestamp: "1 day ago",
    preview: "Design a waterproof enclosure for electronics...",
    status: "completed",
  },
  {
    id: 3,
    title: "Gear Assembly",
    timestamp: "2 days ago",
    preview: "Generate a spur gear with 24 teeth...",
    status: "completed",
  },
  {
    id: 4,
    title: "Heat Sink Design",
    timestamp: "3 days ago",
    preview: "Create a heat sink with fins for cooling...",
    status: "completed",
  },
];

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-80"} border-r border-primary/10 bg-background/80 backdrop-blur-sm transition-all duration-300 relative z-10`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Chat History</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <Button className="w-full mb-4 bg-gradient-to-r from-primary to-purple hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}

        {isCollapsed && (
          <Button
            size="sm"
            className="w-full mb-4 bg-gradient-to-r from-primary to-purple hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium truncate">
                        {chat.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {chat.preview}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {chat.timestamp}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-teal/10 text-teal"
                      >
                        {chat.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
