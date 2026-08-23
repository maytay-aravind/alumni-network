"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Briefcase,
  Calendar,
  Award,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeTime } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onSave?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const postTypeConfig: Record<
  string,
  { label: string; icon: typeof Briefcase; color: string }
> = {
  general: { label: "General", icon: FileText, color: "bg-gray-100 text-gray-600" },
  job: { label: "Job", icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  event: { label: "Event", icon: Calendar, color: "bg-purple-100 text-purple-600" },
  achievement: { label: "Achievement", icon: Award, color: "bg-amber-100 text-amber-600" },
  question: { label: "Question", icon: HelpCircle, color: "bg-green-100 text-green-600" },
};

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onSave,
  onDelete,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [saved, setSaved] = useState(post.is_saved || false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    author?: { first_name: string; last_name: string; avatar_url?: string };
    created_at: string;
  }>>([]);

  const typeConfig = postTypeConfig[post.post_type] || postTypeConfig.general;
  const TypeIcon = typeConfig.icon;

  const authorName = post.author
    ? `${(post.author as any).first_name} ${(post.author as any).last_name}`
    : "Unknown User";

  const authorInitials = post.author
    ? `${(post.author as any).first_name?.[0] || ""}${(post.author as any).last_name?.[0] || ""}`
    : "?";

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike?.(post.id);
  };

  const handleSave = async () => {
    setSaved(!saved);
    onSave?.(post.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment?.(post.id, commentText);
    setCommentText("");
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author?.avatar_url || ""} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{authorName}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className={cn("text-xs", typeConfig.color)}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {typeConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>
            </div>
          </div>
          {currentUserId === post.author_id && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(post.id)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm whitespace-pre-wrap mb-4">{post.content}</p>

        <div className="flex items-center gap-1 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5",
              liked && "text-red-500 hover:text-red-600"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span className="text-xs">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments_count}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="text-xs">{post.shares_count}</span>
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              saved && "text-primary"
            )}
            onClick={handleSave}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
            {comments.length > 0 && (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.author?.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {comment.author
                          ? `${comment.author.first_name[0]}${comment.author.last_name[0]}`
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg p-2">
                      <p className="font-medium text-xs">
                        {comment.author
                          ? `${comment.author.first_name} ${comment.author.last_name}`
                          : "Unknown"}
                      </p>
                      <p className="text-xs mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
