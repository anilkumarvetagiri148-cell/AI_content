import { db } from '../db.js';
import {
  Campaign,
  CampaignProposal,
  Conversation,
  FullCreator,
  Message,
  NotificationItem,
  PortfolioProject,
  Profile,
  Review,
} from '../../src/types/index.js';

export class DatabaseService {
  // 1. Profiles
  getProfileById(id: string): Profile | null {
    return db.getProfileById(id) || null;
  }

  getProfileByEmail(email: string): Profile | null {
    const state = db.getState();
    return state.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const state = db.getState();
    const profile = state.profiles.find((p) => p.id === id);
    if (!profile) return null;
    Object.assign(profile, updates);
    db.save();
    return profile;
  }

  // 2. Creator Profiles & Full Creators
  getFullCreator(id: string): FullCreator | null {
    return db.getFullCreator(id);
  }

  getAllFullCreators(): FullCreator[] {
    return db.getAllFullCreators();
  }

  updateCreatorProfile(creatorId: string, updates: any) {
    const state = db.getState();
    const cp = state.creator_profiles.find((c) => c.creator_id === creatorId);
    if (!cp) return null;
    Object.assign(cp, updates);
    db.save();
    return cp;
  }

  // 3. Portfolio Projects
  addPortfolioProject(project: PortfolioProject) {
    const state = db.getState();
    state.portfolio_projects.unshift(project);
    db.save();
    return project;
  }

  deletePortfolioProject(id: string, creatorId: string, isAdmin = false): boolean {
    const state = db.getState();
    const idx = state.portfolio_projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    if (!isAdmin && state.portfolio_projects[idx].creator_id !== creatorId) {
      throw new Error('Unauthorized to delete this project');
    }
    state.portfolio_projects.splice(idx, 1);
    db.save();
    return true;
  }

  // 4. Campaigns
  getCampaigns(filter?: { brandId?: string; status?: string; search?: string }): Campaign[] {
    const state = db.getState();
    let list = [...state.campaigns];
    if (filter?.brandId) {
      list = list.filter((c) => c.brand_id === filter.brandId);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((c) => `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q));
    }
    return list;
  }

  getCampaignById(id: string): Campaign | null {
    const state = db.getState();
    return state.campaigns.find((c) => c.id === id) || null;
  }

  createCampaign(campaign: Campaign): Campaign {
    const state = db.getState();
    state.campaigns.unshift(campaign);
    db.save();
    return campaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
    const state = db.getState();
    const campaign = state.campaigns.find((c) => c.id === id);
    if (!campaign) return null;
    Object.assign(campaign, updates);
    db.save();
    return campaign;
  }

  // 5. Proposals
  createProposal(proposal: CampaignProposal): CampaignProposal {
    const state = db.getState();
    state.campaign_proposals.unshift(proposal);
    db.save();
    return proposal;
  }

  getProposals(filter?: { campaignId?: string; creatorId?: string }): CampaignProposal[] {
    const state = db.getState();
    let list = [...state.campaign_proposals];
    if (filter?.campaignId) {
      list = list.filter((p) => p.campaign_id === filter.campaignId);
    }
    if (filter?.creatorId) {
      list = list.filter((p) => p.creator_id === filter.creatorId);
    }
    return list;
  }

  updateProposalStatus(id: string, status: 'accepted' | 'rejected'): CampaignProposal | null {
    const state = db.getState();
    const proposal = state.campaign_proposals.find((p) => p.id === id);
    if (!proposal) return null;
    proposal.status = status;
    db.save();
    return proposal;
  }

  // 6. Saved Creators
  getSavedCreatorIds(brandId: string): string[] {
    const state = db.getState();
    return state.saved_creators.filter((s) => s.brand_id === brandId).map((s) => s.creator_id);
  }

  toggleSavedCreator(brandId: string, creatorId: string): boolean {
    const state = db.getState();
    const idx = state.saved_creators.findIndex((s) => s.brand_id === brandId && s.creator_id === creatorId);
    if (idx !== -1) {
      state.saved_creators.splice(idx, 1);
      db.save();
      return false;
    }
    state.saved_creators.push({
      id: `fav-${Math.random().toString(36).slice(2, 9)}`,
      brand_id: brandId,
      creator_id: creatorId,
      created_at: new Date().toISOString(),
    });
    db.save();
    return true;
  }

  // 7. Conversations, Participants & Messages
  getConversationsForUser(userId: string): Conversation[] {
    const state = db.getState();
    return state.conversations
      .filter((c) => c.brand_id === userId || c.creator_id === userId)
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  }

  getConversationById(id: string): Conversation | null {
    const state = db.getState();
    return state.conversations.find((c) => c.id === id) || null;
  }

  createConversation(conv: Conversation): Conversation {
    const state = db.getState();
    state.conversations.unshift(conv);
    db.save();
    return conv;
  }

  getMessages(conversationId: string): Message[] {
    const state = db.getState();
    return state.messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addMessage(msg: Message): Message {
    const state = db.getState();
    state.messages.push(msg);
    const conv = state.conversations.find((c) => c.id === msg.conversation_id);
    if (conv) {
      conv.last_message = msg.body;
      conv.last_message_at = msg.created_at;
    }
    db.save();
    return msg;
  }

  // 8. Reviews
  createReview(review: Review): Review {
    const state = db.getState();
    state.reviews.unshift(review);

    // Recalculate average rating
    const creatorReviews = state.reviews.filter((r) => r.creator_id === review.creator_id);
    const cp = state.creator_profiles.find((c) => c.creator_id === review.creator_id);
    if (cp && creatorReviews.length > 0) {
      const sum = creatorReviews.reduce((acc, r) => acc + r.rating, 0);
      cp.rating = Number((sum / creatorReviews.length).toFixed(2));
      cp.review_count = creatorReviews.length;
    }

    db.save();
    return review;
  }

  // 9. Notifications
  createNotification(notif: NotificationItem): NotificationItem {
    const state = db.getState();
    state.notifications.unshift(notif);
    db.save();
    return notif;
  }

  getNotifications(userId: string): NotificationItem[] {
    const state = db.getState();
    return state.notifications.filter((n) => n.recipient_id === userId);
  }

  markAllNotificationsRead(userId: string) {
    const state = db.getState();
    state.notifications.forEach((n) => {
      if (n.recipient_id === userId) n.read_status = true;
    });
    db.save();
  }

  markNotificationRead(userId: string, notificationId: string): boolean {
    const state = db.getState();
    const notif = state.notifications.find((n) => n.id === notificationId && n.recipient_id === userId);
    if (!notif) return false;
    notif.read_status = true;
    db.save();
    return true;
  }

  // 10. Dashboard & Aggregation Helpers
  getCreatorProfileByUserId(userId: string) {
    const state = db.getState();
    return state.creator_profiles.find((c) => c.creator_id === userId) || null;
  }

  getPortfolioProjectsByUserId(userId: string): PortfolioProject[] {
    const state = db.getState();
    return state.portfolio_projects.filter((p) => p.creator_id === userId);
  }

  getProposalsByCreator(creatorId: string): CampaignProposal[] {
    const state = db.getState();
    return state.campaign_proposals.filter((p) => p.creator_id === creatorId);
  }

  listCampaigns(filter?: { brandId?: string; status?: string; search?: string }): Campaign[] {
    return this.getCampaigns(filter);
  }

  getProposalsForBrand(brandId: string): CampaignProposal[] {
    const state = db.getState();
    const brandCampaignIds = new Set(
      state.campaigns.filter((c) => c.brand_id === brandId).map((c) => c.id)
    );
    return state.campaign_proposals.filter((p) => brandCampaignIds.has(p.campaign_id));
  }

  listCreators(options?: { category?: string; search?: string; limit?: number; offset?: number }) {
    let all = this.getAllFullCreators();
    if (options?.category && options.category !== 'All' && options.category !== 'All Creators') {
      all = all.filter(
        (c) =>
          c.creator_profile.industry_category.toLowerCase() === options.category!.toLowerCase() ||
          c.creator_profile.secondary_categories?.some((sc) => sc.toLowerCase() === options.category!.toLowerCase())
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.creator_profile.title.toLowerCase().includes(q) ||
          c.creator_profile.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.creator_profile.ai_tools.some((t) => t.toLowerCase().includes(q))
      );
    }
    const total = all.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 24;
    return {
      creators: all.slice(offset, offset + limit),
      total,
      hasMore: offset + limit < total,
    };
  }

  // 11. Admin Helpers
  getAdminStats() {
    const state = db.getState();
    const acceptedProposals = state.campaign_proposals.filter((p) => p.status === 'accepted');
    const totalVolume = acceptedProposals.reduce((sum, p) => sum + (p.price || 0), 0);

    return {
      totalUsers: state.profiles.length,
      usersByRole: {
        creator: state.profiles.filter((p) => p.role === 'creator').length,
        brand: state.profiles.filter((p) => p.role === 'brand').length,
        admin: state.profiles.filter((p) => p.role === 'admin').length,
      },
      totalCampaigns: state.campaigns.length,
      campaignsByStatus: {
        open: state.campaigns.filter((c) => c.status === 'open').length,
        in_progress: state.campaigns.filter((c) => c.status === 'in_progress').length,
        completed: state.campaigns.filter((c) => c.status === 'completed').length,
        draft: state.campaigns.filter((c) => c.status === 'draft').length,
      },
      totalProposals: state.campaign_proposals.length,
      proposalsByStatus: {
        pending: state.campaign_proposals.filter((p) => p.status === 'pending').length,
        accepted: state.campaign_proposals.filter((p) => p.status === 'accepted').length,
        rejected: state.campaign_proposals.filter((p) => p.status === 'rejected').length,
      },
      totalTransactionVolumeINR: totalVolume,
      totalPortfolios: state.portfolio_projects.length,
      totalReviews: state.reviews.length,
      totalConversations: state.conversations.length,
      totalMessages: state.messages.length,
    };
  }

  setUserVerification(userId: string, verified: boolean): Profile | null {
    const state = db.getState();
    const profile = state.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    profile.verified = verified;
    db.save();
    return profile;
  }

  getReports() {
    const state = (db.getState() as any);
    return state.reports || [];
  }

  updateReportStatus(id: string, status: string, notes?: string) {
    const state = (db.getState() as any);
    if (!state.reports) state.reports = [];
    const report = state.reports.find((r: any) => r.id === id);
    if (!report) return null;
    report.status = status;
    if (notes) report.resolution_notes = notes;
    report.updated_at = new Date().toISOString();
    db.save();
    return report;
  }
}

export const dbService = new DatabaseService();
