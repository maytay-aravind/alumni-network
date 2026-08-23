"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostCard } from "@/components/shared/PostCard";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Post } from "@/types";

export default function AlumniPostsPage() {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("general");
  const [posting, setPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);

      const { data: myData } = await supabase
        .from("posts")
        .select("*")
        .eq("author_role", "alumni")
        .order("created_at", { ascending: false });

      const { data: communityData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setMyPosts(myData || []);
      setCommunityPosts(communityData || []);
    } catch (error) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setPosting(true);

    try {
      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update({ content: newPostContent })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Post updated");
      } else {
        const { error } = await supabase.from("posts").insert({
          content: newPostContent,
          post_type: newPostType,
          author_role: "alumni",
        });

        if (error) throw error;
        toast.success("Post created");
      }

      setShowCreateModal(false);
      setNewPostContent("");
      setNewPostType("general");
      setEditingPost(null);
      fetchPosts();
    } catch {
      toast.error("Failed to save post");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      setMyPosts(myPosts.filter((p) => p.id !== postId));
      setCommunityPosts(communityPosts.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Share updates and engage with the community
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold">Community Feed</h2>
          {communityPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">My Posts ({myPosts.length})</h2>
          {myPosts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t posted yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {post.post_type}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingPost(post);
                            setNewPostContent(post.content);
                            setShowCreateModal(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Create Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingPost && (
              <div>
                <label className="text-sm font-medium">Post Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newPostType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPostType(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="job">Job</option>
                  <option value="event">Event</option>
                  <option value="achievement">Achievement</option>
                  <option value="question">Question</option>
                </select>
              </div>
            )}
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPost(null);
                  setNewPostContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={posting || !newPostContent.trim()}
              >
                {posting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingPost ? "Update" : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
