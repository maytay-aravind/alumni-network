'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { POST_TYPES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  MoreHorizontal,
  FileText,
} from 'lucide-react';

interface Post {
  id: string;
  author_id: string;
  author_role: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    current_company?: string;
    current_role?: string;
  };
  is_liked?: boolean;
  is_saved?: boolean;
}

export default function PostsPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newPost, setNewPost] = React.useState('');
  const [postType, setPostType] = React.useState('general');
  const [activeTab, setActiveTab] = React.useState('all');
  const [expandedComments, setExpandedComments] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState('');

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:user_profiles(*)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) setPosts(data as Post[]);
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      author_role: user.user_metadata?.role || 'student',
      content: newPost,
      post_type: postType,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
    });

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post created!');
      setNewPost('');
      fetchPosts();
    }
  };

  const handleLike = async (postId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.from('posts').update({ likes_count: post.likes_count - 1 }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      await supabase.from('posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
    }

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      author_role: user.user_metadata?.role || 'student',
      content: commentText,
    });

    if (error) {
      toast.error('Failed to add comment');
    } else {
      setCommentText('');
      fetchPosts();
    }
  };

  const handleSave = async (postId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.is_saved) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
    }

    setPosts(posts.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p)));
  };

  const filteredPosts = activeTab === 'all' ? posts : posts.filter((p) => p.post_type === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-muted-foreground">Share updates, ask questions, and connect</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {POST_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={postType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setPostType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" onClick={handleCreatePost} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="question">Questions</TabsTrigger>
          <TabsTrigger value="achievement">Achievements</TabsTrigger>
          <TabsTrigger value="job">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No posts yet"
              description="Be the first to share something with the community"
            />
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(
                            post.author?.first_name || '',
                            post.author?.last_name || ''
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {post.author?.first_name} {post.author?.last_name}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {post.post_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(post.created_at)}
                          </span>
                        </div>
                        {post.author?.current_role && (
                          <p className="text-xs text-muted-foreground">
                            {post.author.current_role}
                            {post.author.current_company && ` at ${post.author.current_company}`}
                          </p>
                        )}
                        <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>

                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={post.is_liked ? 'text-red-500' : ''}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                            {post.likes_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedComments(expandedComments === post.id ? null : post.id)
                            }
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments_count}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            {post.shares_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={post.is_saved ? 'text-primary' : ''}
                            onClick={() => handleSave(post.id)}
                          >
                            {post.is_saved ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {expandedComments === post.id && (
                          <div className="mt-4 space-y-3 border-t pt-3">
                            <div className="flex gap-2">
                              <Input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleComment(post.id);
                                }}
                              />
                              <Button size="sm" onClick={() => handleComment(post.id)}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className || ''}`}
      {...props}
    />
  );
}
