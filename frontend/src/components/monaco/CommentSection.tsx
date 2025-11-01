import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { codeReviewApi } from '@/services/codeReviewApi';
import type { IssueComment } from '@/types/codeReview';

interface CommentSectionProps {
  issueId: string;
  onCommentAdded?: () => void;
}

/**
 * CommentSection - Displays and manages comments on a code review issue
 * Features: List comments, add new, edit own, delete own
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
  issueId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [issueId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await codeReviewApi.getComments(issueId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitLoading(true);
    try {
      await codeReviewApi.createComment(issueId, { commentText: newComment });
      setNewComment('');
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await codeReviewApi.updateComment(commentId, { commentText: editText });
      setEditingId(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await codeReviewApi.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const startEdit = (comment: IssueComment) => {
    setEditingId(comment.id);
    setEditText(comment.commentText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h5 className="text-xs font-semibold text-slate-300">
          Comments ({comments.length})
        </h5>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-4 text-slate-500 text-xs">
          Loading comments...
        </div>
      ) : (
        <>
          {/* Comment list */}
          {comments.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-800/50 p-2 rounded border border-slate-700"
                >
                  <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      {comment.user.profilePicture ? (
                        <img
                          src={comment.user.profilePicture}
                          alt={comment.user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-purple-600 text-white text-xs flex items-center justify-center w-full h-full">
                          {comment.user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300 truncate">
                          {comment.user.displayName}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {/* Edit mode */}
                      {editingId === comment.id ? (
                        <div className="space-y-1">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-xs min-h-[60px] bg-slate-900 border-slate-600"
                            placeholder="Edit your comment..."
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment.id)}
                              className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-6 px-2 text-xs hover:bg-slate-700"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Comment text */}
                          <p className="text-xs text-slate-400 whitespace-pre-wrap break-words">
                            {comment.commentText}
                          </p>
                          {/* Edited indicator */}
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-slate-600 italic">
                              (edited)
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    {editingId !== comment.id && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(comment)}
                          className="h-6 w-6 p-0 hover:bg-slate-700"
                          title="Edit comment"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 hover:bg-red-900/30 hover:text-red-400"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {comments.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-xs">
              No comments yet. Be the first to comment!
            </div>
          )}

          {/* Add comment form */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="text-xs min-h-[60px] bg-slate-900 border-slate-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddComment();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Tip: Press Ctrl+Enter to post
              </span>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitLoading}
                size="sm"
                className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-3 h-3 mr-1" />
                {submitLoading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
