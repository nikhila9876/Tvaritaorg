import { prisma } from '../config/db.js';
import { AppError } from '../utils/helpers.js';

// Initial authentic seed posts representing Tvarita's living cultural community
const SEED_POSTS = [
  {
    id: 'post-madhubani-kohbar',
    authorId: 'artist-ramesh-jha',
    authorName: 'Ramesh Kumar Jha',
    authorEmail: 'ramesh.jha@tvaritacollective.org',
    authorRole: 'artist',
    authorAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    title: 'Sacred Kohbar Nuptial Motif on Handmade Sun-Dried Paper',
    content: 'Completed this sacred Kohbar wedding mural this week in Jitwarpur using fine bamboo nibs (kalam) and soot ink mixed with organic cow dung wash. The central lotus represents maternal prosperity, surrounded by the sun and moon bearing witness to cyclical harmony. 12 women artisans from our village guild contributed to the parallel hatching.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    ],
    artForm: 'Madhubani Painting',
    category: 'artwork',
    location: 'Jitwarpur, Madhubani, Bihar',
    likeCount: 42,
    commentCount: 5,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    comments: [
      {
        id: 'c-1',
        postId: 'post-madhubani-kohbar',
        authorId: 'user-priya-sharma',
        authorName: 'Priya Sharma',
        authorEmail: 'priya@techorg.com',
        authorRole: 'corporate',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        content: 'The precision of the Kacchni line work is breathtaking, Guruji! Our team framed the piece from our workshop in Bengaluru.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      },
      {
        id: 'c-2',
        postId: 'post-madhubani-kohbar',
        authorId: 'artist-sunita-devi',
        authorName: 'Sunita Devi',
        authorEmail: 'sunita.warli@tvaritacollective.org',
        authorRole: 'artist',
        authorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
        content: 'Beautiful sacred motifs Ramesh ji. The harmony between nature and living spirits shines through.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      }
    ],
    likedBy: new Set(['user-priya-sharma', 'artist-sunita-devi'])
  },
  {
    id: 'post-warli-tarpa',
    authorId: 'artist-sunita-devi',
    authorName: 'Sunita Devi',
    authorEmail: 'sunita.warli@tvaritacollective.org',
    authorRole: 'artist',
    authorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    title: 'Circle of Life: Tarpa Community Dance Workshop',
    content: 'Teaching 35 corporate team members how our Warli ancestors created rhythm without words. In Warli philosophy, the circle has no beginning and no end; nobody stands first and nobody stands last. We prepared rice paste using traditional grinding stones before beginning our shared canvas.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'
    ],
    artForm: 'Warli Art',
    category: 'workshop',
    location: 'Palghar, Maharashtra',
    likeCount: 38,
    commentCount: 3,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    comments: [
      {
        id: 'c-3',
        postId: 'post-warli-tarpa',
        authorId: 'user-arun-nair',
        authorName: 'Arun Nair',
        authorEmail: 'arun@heritage.org',
        authorRole: 'participant',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        content: 'Such a grounding experience. Learning why the triangle represents both mountain and human body changed how I view tribal design.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      }
    ],
    likedBy: new Set(['artist-ramesh-jha'])
  },
  {
    id: 'post-baul-philosophy',
    authorId: 'artist-sadhan-baul',
    authorName: 'Sadhan Das Baul',
    authorEmail: 'sadhan.baul@tvaritacollective.org',
    authorRole: 'artist',
    authorAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    title: 'The Resonance of the Ektara: Moner Manush',
    content: 'Singing Lalon Fakir under the ancient Banyan grove in Kenduli. The single string of the Ektara reminds us that despite all external differences of status, creed, or border, the inner soul (Moner Manush) pulses with one identical breath. Looking forward to our upcoming cultural fireside performance in Mumbai next week.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'
    ],
    artForm: 'Baul Music & Philosophy',
    category: 'story',
    location: 'Kenduli, Birbhum, West Bengal',
    likeCount: 56,
    commentCount: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
    comments: [],
    likedBy: new Set(['user-priya-sharma', 'user-arun-nair', 'artist-sunita-devi'])
  },
  {
    id: 'post-kalamkari-dyes',
    authorId: 'artist-radhakrishna',
    authorName: 'Radhakrishna Reddy',
    authorEmail: 'radhakrishna.kalamkari@tvaritacollective.org',
    authorRole: 'artist',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    title: 'Extracting Kasimi Black Ink and Madder Red for Ramayana Scroll',
    content: 'A glimpse into our workshop along the Swarnamukhi river in Srikalahasti. We ferment rusted iron horseshoes with palm jaggery for 21 days to produce our deep black kasimi outlines. True Kalamkari demands patience—nature cannot be hurried.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'
    ],
    artForm: 'Kalamkari',
    category: 'tradition',
    location: 'Srikalahasti, Andhra Pradesh',
    likeCount: 47,
    commentCount: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    comments: [],
    likedBy: new Set(['artist-ramesh-jha', 'user-priya-sharma'])
  }
];

// Memory store fallback with seeded data
let localPosts = [...SEED_POSTS];
let localReports = [];

export const communityService = {
  /**
   * List community posts with filtering, search, and pagination
   */
  async listPosts({ category, artForm, q, page = 1, limit = 20, status = 'active', currentUserId, isAdmin = false }) {
    // Try Prisma DB first
    try {
      if (prisma && prisma.communityPost) {
        const where = {};
        if (!isAdmin) {
          where.status = 'active';
        } else if (status) {
          where.status = status;
        }

        if (category && category !== 'all') {
          where.category = category;
        }
        if (artForm && artForm !== 'all') {
          where.artForm = { contains: artForm, mode: 'insensitive' };
        }
        if (q) {
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { authorName: { contains: q, mode: 'insensitive' } },
            { artForm: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [posts, total] = await Promise.all([
          prisma.communityPost.findMany({
            where,
            include: {
              comments: {
                orderBy: { createdAt: 'asc' },
                take: 5,
              },
              likes: currentUserId ? { where: { userId: currentUserId } } : false,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
          }),
          prisma.communityPost.count({ where }),
        ]);

        if (posts && posts.length > 0) {
          const formatted = posts.map((p) => ({
            ...p,
            isLiked: Array.isArray(p.likes) && p.likes.length > 0,
            likes: undefined,
          }));
          return {
            posts: formatted,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          };
        }
      }
    } catch {
      // Fall through to memory store
    }

    // Memory Store Implementation
    let filtered = [...localPosts];

    if (!isAdmin) {
      filtered = filtered.filter((p) => p.status === 'active');
    } else if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (artForm && artForm !== 'all') {
      const afLower = artForm.toLowerCase();
      filtered = filtered.filter((p) => (p.artForm || '').toLowerCase().includes(afLower));
    }

    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(qLower) ||
          (p.content || '').toLowerCase().includes(qLower) ||
          (p.authorName || '').toLowerCase().includes(qLower) ||
          (p.artForm || '').toLowerCase().includes(qLower) ||
          (p.location || '').toLowerCase().includes(qLower),
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(skip, skip + Number(limit)).map((p) => ({
      ...p,
      isLiked: currentUserId ? p.likedBy?.has(currentUserId) || false : false,
    }));

    return {
      posts: paginated,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  },

  /**
   * Get single post by ID
   */
  async getPostById(id, currentUserId) {
    // Try Prisma DB
    try {
      if (prisma && prisma.communityPost) {
        const post = await prisma.communityPost.findUnique({
          where: { id },
          include: {
            comments: { orderBy: { createdAt: 'asc' } },
            likes: currentUserId ? { where: { userId: currentUserId } } : false,
          },
        });
        if (post) {
          return {
            ...post,
            isLiked: Array.isArray(post.likes) && post.likes.length > 0,
            likes: undefined,
          };
        }
      }
    } catch {
      // Fallback to memory
    }

    const found = localPosts.find((p) => p.id === id);
    if (!found) throw new AppError('Post not found', 404);

    return {
      ...found,
      isLiked: currentUserId ? found.likedBy?.has(currentUserId) || false : false,
    };
  },

  /**
   * Create a new community post
   */
  async createPost({ authorId, authorName, authorEmail, authorRole, authorAvatar, title, content, mediaUrls, artForm, category, location }) {
    if (!content || !content.trim()) {
      throw new AppError('Post content is required', 400);
    }

    const postPayload = {
      authorId: authorId || 'user-anonymous',
      authorName: authorName || 'Tvarita Community Member',
      authorEmail: authorEmail || null,
      authorRole: authorRole || 'participant',
      authorAvatar: authorAvatar || null,
      title: title?.trim() || null,
      content: content.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls.filter(Boolean) : [],
      artForm: artForm?.trim() || null,
      category: category || 'experience',
      location: location?.trim() || null,
      likeCount: 0,
      commentCount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try Prisma DB
    try {
      if (prisma && prisma.communityPost) {
        const created = await prisma.communityPost.create({
          data: postPayload,
          include: { comments: true },
        });
        return created;
      }
    } catch {
      // Memory fallback
    }

    const newPost = {
      ...postPayload,
      id: `post-${Date.now()}`,
      comments: [],
      likedBy: new Set(),
    };

    localPosts.unshift(newPost);
    return newPost;
  },

  /**
   * Delete a post (by author or admin)
   */
  async deletePost(id, user) {
    const isAdmin = user?.role === 'admin';
    const userId = user?.sub || user?.id;

    // Try Prisma DB
    try {
      if (prisma && prisma.communityPost) {
        const existing = await prisma.communityPost.findUnique({ where: { id } });
        if (!existing) throw new AppError('Post not found', 404);
        if (!isAdmin && existing.authorId !== userId) {
          throw new AppError('Not authorized to delete this post', 403);
        }
        await prisma.comment.deleteMany({ where: { postId: id } });
        await prisma.postLike.deleteMany({ where: { postId: id } });
        await prisma.report.deleteMany({ where: { postId: id } });
        await prisma.communityPost.delete({ where: { id } });
        return { success: true };
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
    }

    const idx = localPosts.findIndex((p) => p.id === id);
    if (idx === -1) throw new AppError('Post not found', 404);

    const post = localPosts[idx];
    if (!isAdmin && post.authorId !== userId) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    localPosts.splice(idx, 1);
    return { success: true };
  },

  /**
   * Toggle like on a post
   */
  async toggleLike(postId, userId) {
    if (!userId) {
      throw new AppError('User ID is required to like a post', 400);
    }

    // Try Prisma DB
    try {
      if (prisma && prisma.postLike && prisma.communityPost) {
        const existingLike = await prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId } },
        });

        if (existingLike) {
          await prisma.postLike.delete({ where: { id: existingLike.id } });
          const updated = await prisma.communityPost.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
            select: { likeCount: true },
          });
          return { liked: false, likeCount: Math.max(0, updated.likeCount) };
        } else {
          await prisma.postLike.create({ data: { postId, userId } });
          const updated = await prisma.communityPost.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } },
            select: { likeCount: true },
          });
          return { liked: true, likeCount: updated.likeCount };
        }
      }
    } catch {
      // Memory fallback
    }

    const post = localPosts.find((p) => p.id === postId);
    if (!post) throw new AppError('Post not found', 404);

    if (!post.likedBy) post.likedBy = new Set();

    let liked;
    if (post.likedBy.has(userId)) {
      post.likedBy.delete(userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
      liked = false;
    } else {
      post.likedBy.add(userId);
      post.likeCount += 1;
      liked = true;
    }

    return { liked, likeCount: post.likeCount };
  },

  /**
   * Add comment to post
   */
  async addComment(postId, { authorId, authorName, authorEmail, authorRole, authorAvatar, content }) {
    if (!content || !content.trim()) {
      throw new AppError('Comment content is required', 400);
    }

    const commentPayload = {
      authorId: authorId || 'user-anonymous',
      authorName: authorName || 'Cultural Contributor',
      authorEmail: authorEmail || null,
      authorRole: authorRole || 'participant',
      authorAvatar: authorAvatar || null,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try Prisma DB
    try {
      if (prisma && prisma.comment && prisma.communityPost) {
        const comment = await prisma.comment.create({
          data: {
            ...commentPayload,
            postId,
          },
        });
        await prisma.communityPost.update({
          where: { id: postId },
          data: { commentCount: { increment: 1 } },
        });
        return comment;
      }
    } catch {
      // Memory fallback
    }

    const post = localPosts.find((p) => p.id === postId);
    if (!post) throw new AppError('Post not found', 404);

    const newComment = {
      ...commentPayload,
      id: `comment-${Date.now()}`,
      postId,
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    post.commentCount = post.comments.length;

    return newComment;
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId, user) {
    const isAdmin = user?.role === 'admin';
    const userId = user?.sub || user?.id;

    // Try Prisma DB
    try {
      if (prisma && prisma.comment) {
        const existing = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!existing) throw new AppError('Comment not found', 404);
        if (!isAdmin && existing.authorId !== userId) {
          throw new AppError('Not authorized to delete this comment', 403);
        }
        await prisma.comment.delete({ where: { id: commentId } });
        await prisma.communityPost.update({
          where: { id: existing.postId },
          data: { commentCount: { decrement: 1 } },
        });
        return { success: true };
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
    }

    for (const post of localPosts) {
      if (post.comments) {
        const cIdx = post.comments.findIndex((c) => c.id === commentId);
        if (cIdx !== -1) {
          const comment = post.comments[cIdx];
          if (!isAdmin && comment.authorId !== userId) {
            throw new AppError('Not authorized to delete this comment', 403);
          }
          post.comments.splice(cIdx, 1);
          post.commentCount = Math.max(0, post.commentCount - 1);
          return { success: true };
        }
      }
    }

    throw new AppError('Comment not found', 404);
  },

  /**
   * Report inappropriate or violating post
   */
  async reportPost(postId, { reporterId, reporterEmail, reason, details }) {
    if (!reason) {
      throw new AppError('Report reason is required', 400);
    }

    const reportPayload = {
      postId,
      reporterId: reporterId || null,
      reporterEmail: reporterEmail || null,
      reason: reason.trim(),
      details: details?.trim() || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try Prisma DB
    try {
      if (prisma && prisma.report) {
        const report = await prisma.report.create({ data: reportPayload });
        return report;
      }
    } catch {
      // Memory fallback
    }

    const post = localPosts.find((p) => p.id === postId);
    if (!post) throw new AppError('Post not found', 404);

    const newReport = {
      ...reportPayload,
      id: `report-${Date.now()}`,
      postSummary: {
        id: post.id,
        title: post.title,
        content: post.content.slice(0, 100),
        authorName: post.authorName,
      },
    };

    localReports.push(newReport);
    return newReport;
  },

  /**
   * List reports for NGO/Admin moderation
   */
  async listReports({ status = 'pending' } = {}) {
    // Try Prisma DB
    try {
      if (prisma && prisma.report) {
        const where = status && status !== 'all' ? { status } : {};
        const reports = await prisma.report.findMany({
          where,
          include: { post: true },
          orderBy: { createdAt: 'desc' },
        });
        if (reports) return reports;
      }
    } catch {
      // Memory fallback
    }

    let filtered = [...localReports];
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered;
  },

  /**
   * Moderate report (hide post, dismiss, delete)
   */
  async updateReport(reportId, { status, action, adminNotes }) {
    // Try Prisma DB
    try {
      if (prisma && prisma.report) {
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) throw new AppError('Report not found', 404);

        if (action === 'hide_post') {
          await prisma.communityPost.update({
            where: { id: report.postId },
            data: { status: 'hidden' },
          });
        } else if (action === 'restore_post') {
          await prisma.communityPost.update({
            where: { id: report.postId },
            data: { status: 'active' },
          });
        } else if (action === 'delete_post') {
          await prisma.communityPost.delete({ where: { id: report.postId } });
        }

        const updated = await prisma.report.update({
          where: { id: reportId },
          data: {
            status: status || 'reviewed',
            details: adminNotes ? `${report.details || ''}\n[Admin Notes]: ${adminNotes}` : report.details,
          },
        });
        return updated;
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
    }

    const report = localReports.find((r) => r.id === reportId);
    if (!report) throw new AppError('Report not found', 404);

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    const post = localPosts.find((p) => p.id === report.postId);
    if (post) {
      if (action === 'hide_post') post.status = 'hidden';
      if (action === 'restore_post') post.status = 'active';
      if (action === 'delete_post') {
        const idx = localPosts.findIndex((p) => p.id === report.postId);
        if (idx !== -1) localPosts.splice(idx, 1);
      }
    }

    return report;
  }
};
