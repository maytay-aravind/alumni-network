"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Trash2,
  Flag,
  Check,
  X,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Post } from "@/types";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [reportedPosts, setReportedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      setReportedPosts([]);
    } catch (error) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  const handleRemovePost = async (id: string) => {
    if (!confirm("Remove this post?")) return;
    setProcessing(id);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setPosts(posts.filter((p) => p.id !== id));
      setReportedPosts(reportedPosts.filter((p) => p.id !== id));
      setSelectedPost(null);
      toast.success("Post removed");
    } catch (error) {
      toast.error("Failed to remove post");
    } finally {
      setProcessing(null);
    }
  };

  const postTypeColors: Record<string, string> = {
    general: "bg-gray-100 text-gray-600",
    job: "bg-blue-100 text-blue-600",
    event: "bg-purple-100 text-purple-600",
    achievement: "bg-amber-100 text-amber-600",
    question: "bg-green-100 text-green-600",
  };

  const columns: Column<Post>[] = [
    {
      key: "content",
      label: "Content",
      render: (post) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="secondary"
              className={`text-xs capitalize ${
                postTypeColors[post.post_type] || ""
              }`}
            >
              {post.post_type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "likes_count",
      label: "Engagement",
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {post.comments_count}
          </span>
        </div>
      ),
    },
    {
      key: "author_role",
      label: "Author Role",
      render: (post) => (
        <Badge variant="outline" className="capitalize">
          {post.author_role}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Content Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate posts across the platform
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="reported">
            Reported ({reportedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={posts}
                  searchPlaceholder="Search posts..."
                  pageSize={10}
                  emptyMessage="No posts found"
                  onRowClick={(post) => setSelectedPost(post)}
                  actions={(post) => (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedPost(post)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemovePost(post.id)}
                        disabled={processing === post.id}
                      >
                        {processing === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reported" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {reportedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No reported posts
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={reportedPosts}
                  searchPlaceholder="Search reported posts..."
                  pageSize={10}
                  emptyMessage="No reported posts"
                  onRowClick={(post) => setSelectedPost(post)}
                  actions={(post) => (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-500"
                        onClick={() => {
                          setReportedPosts(
                            reportedPosts.filter((p) => p.id !== post.id)
                          );
                          toast.success("Report dismissed");
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemovePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedPost}
        onOpenChange={() => {
          setSelectedPost(null);
          setRejectReason("");
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {"AU"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {selectedPost.author_id}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${
                        postTypeColors[selectedPost.post_type] || ""
                      }`}
                    >
                      {selectedPost.post_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(selectedPost.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{selectedPost.likes_count} likes</span>
                <span>{selectedPost.comments_count} comments</span>
                <span>{selectedPost.shares_count} shares</span>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Reason for removal (optional)
                </label>
                <Textarea
                  placeholder="Enter reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPost(null);
                    setRejectReason("");
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRemovePost(selectedPost.id)}
                  disabled={processing === selectedPost.id}
                >
                  {processing === selectedPost.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Remove Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
