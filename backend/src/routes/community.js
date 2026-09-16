import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { communityService } from '../services/communityService.js';
import { verifyToken } from '../utils/jwt.js';

const router = Router();

/**
 * Helper to optionally extract auth user from Bearer header without throwing 401
 */
function optionalUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * GET /api/community/posts
 * Public feed with filters and search
 */
router.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const { category, artForm, q, page, limit, status } = req.query;
    const currentUserId = user?.sub || user?.id || req.query.userId;
    const isAdmin = user?.role === 'admin';

    const result = await communityService.listPosts({
      category,
      artForm,
      q,
      page,
      limit,
      status,
      currentUserId,
      isAdmin,
    });

    res.json(result);
  }),
);

/**
 * POST /api/community/posts
 * Create new cultural post
 */
router.post(
  '/posts',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const {
      title,
      content,
      mediaUrls,
      artForm,
      category,
      location,
      authorName,
      authorRole,
      authorAvatar,
      authorId,
    } = req.body || {};

    const resolvedAuthorId = user?.sub || user?.id || authorId || 'user-community';
    const resolvedAuthorName = user?.name || authorName || 'Cultural Contributor';
    const resolvedAuthorRole = user?.role || authorRole || 'participant';
    const resolvedAuthorEmail = user?.email || req.body?.authorEmail || null;

    const newPost = await communityService.createPost({
      authorId: resolvedAuthorId,
      authorName: resolvedAuthorName,
      authorEmail: resolvedAuthorEmail,
      authorRole: resolvedAuthorRole,
      authorAvatar: authorAvatar || null,
      title,
      content,
      mediaUrls,
      artForm,
      category,
      location,
    });

    res.status(201).json(newPost);
  }),
);

/**
 * GET /api/community/posts/:id
 * Get single post details
 */
router.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const currentUserId = user?.sub || user?.id || req.query.userId;

    const post = await communityService.getPostById(req.params.id, currentUserId);
    res.json(post);
  }),
);

/**
 * DELETE /api/community/posts/:id
 * Delete a post (author or admin)
 */
router.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req) || {
      id: req.headers['x-user-id'] || 'admin',
      role: req.headers['x-user-role'] || 'admin',
    };

    const result = await communityService.deletePost(req.params.id, user);
    res.json(result);
  }),
);

/**
 * POST /api/community/posts/:id/like
 * Toggle like on a post
 */
router.post(
  '/posts/:id/like',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const userId = user?.sub || user?.id || req.body?.userId || 'guest-user';

    const result = await communityService.toggleLike(req.params.id, userId);
    res.json(result);
  }),
);

/**
 * POST /api/community/posts/:id/comments
 * Add comment to post
 */
router.post(
  '/posts/:id/comments',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const { content, authorName, authorRole, authorAvatar, authorId } = req.body || {};

    const resolvedAuthorId = user?.sub || user?.id || authorId || 'user-commenter';
    const resolvedAuthorName = user?.name || authorName || 'Cultural Contributor';
    const resolvedAuthorRole = user?.role || authorRole || 'participant';
    const resolvedAuthorEmail = user?.email || null;

    const comment = await communityService.addComment(req.params.id, {
      authorId: resolvedAuthorId,
      authorName: resolvedAuthorName,
      authorEmail: resolvedAuthorEmail,
      authorRole: resolvedAuthorRole,
      authorAvatar: authorAvatar || null,
      content,
    });

    res.status(201).json(comment);
  }),
);

/**
 * DELETE /api/community/comments/:id
 * Delete a comment
 */
router.delete(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req) || {
      id: req.headers['x-user-id'] || 'admin',
      role: req.headers['x-user-role'] || 'admin',
    };

    const result = await communityService.deleteComment(req.params.id, user);
    res.json(result);
  }),
);

/**
 * POST /api/community/posts/:id/report
 * Report a post for moderation
 */
router.post(
  '/posts/:id/report',
  asyncHandler(async (req, res) => {
    const user = optionalUser(req);
    const { reason, details, reporterEmail, reporterId } = req.body || {};

    const report = await communityService.reportPost(req.params.id, {
      reporterId: user?.sub || user?.id || reporterId || null,
      reporterEmail: user?.email || reporterEmail || null,
      reason,
      details,
    });

    res.status(201).json({
      message: 'Thank you for helping preserve our cultural community. The report has been submitted to NGO moderators.',
      report,
    });
  }),
);

/**
 * GET /api/community/reports
 * NGO/Admin review of moderation reports
 */
router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const reports = await communityService.listReports({ status });
    res.json({ reports, count: reports.length });
  }),
);

/**
 * PATCH /api/community/reports/:id
 * Moderate a report (hide post, restore post, dismiss, or delete)
 */
router.patch(
  '/reports/:id',
  asyncHandler(async (req, res) => {
    const { status, action, adminNotes } = req.body || {};
    const updated = await communityService.updateReport(req.params.id, {
      status,
      action,
      adminNotes,
    });
    res.json(updated);
  }),
);

export default router;
