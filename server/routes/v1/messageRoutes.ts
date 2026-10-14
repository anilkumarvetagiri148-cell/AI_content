import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { createConversationSchema, sendMessageSchema } from '../../validation/schemas.js';
import { Message, Conversation } from '../../../src/types/index.js';

const router = Router();

// GET /api/v1/conversations
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const conversations = dbService.getConversationsForUser(req.user!.userId);
  const state = db.getState();

  const enriched = conversations.map((c) => {
    const unread = state.messages.filter(
      (m) => m.conversation_id === c.id && m.sender_id !== req.user!.userId && !m.read_status
    ).length;
    return { ...c, unread_count: unread };
  });

  res.json({ conversations: enriched });
});

// POST /api/v1/conversations
router.post('/', requireAuth, validateBody(createConversationSchema), (req: AuthRequest, res: Response) => {
  const { participant_id, campaign_id, message } = req.body;
  const state = db.getState();

  const currentUser = dbService.getProfileById(req.user!.userId);
  const targetUser = dbService.getProfileById(participant_id);

  if (!currentUser || !targetUser) {
    res.status(404).json({ error: 'Recipient user not found.' });
    return;
  }

  const brandUser = currentUser.role === 'brand' ? currentUser : targetUser;
  const creatorUser = currentUser.role === 'creator' ? currentUser : targetUser;

  let conv = state.conversations.find(
    (c) => c.brand_id === brandUser.id && c.creator_id === creatorUser.id
  );

  if (!conv) {
    const camp = campaign_id ? state.campaigns.find((c) => c.id === campaign_id) : undefined;
    conv = {
      id: `conv-${crypto.randomUUID().slice(0, 8)}`,
      brand_id: brandUser.id,
      brand_name: brandUser.company_name || brandUser.name,
      brand_avatar: brandUser.avatar_url,
      creator_id: creatorUser.id,
      creator_name: creatorUser.name,
      creator_avatar: creatorUser.avatar_url,
      campaign_id: camp?.id,
      campaign_title: camp?.title,
      last_message: message || 'Conversation started',
      last_message_at: new Date().toISOString(),
      unread_count: message ? 1 : 0,
      created_at: new Date().toISOString(),
    };
    state.conversations.unshift(conv);
  }

  if (message) {
    const msg: Message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      conversation_id: conv.id,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_avatar: currentUser.avatar_url,
      body: message,
      read_status: false,
      created_at: new Date().toISOString(),
    };
    state.messages.push(msg);
    conv.last_message = message;
    conv.last_message_at = msg.created_at;

    dbService.createNotification({
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      recipient_id: targetUser.id,
      type: 'message',
      title: `New Message from ${currentUser.name}`,
      message: message.slice(0, 90),
      link: '/messages',
      read_status: false,
      created_at: new Date().toISOString(),
    });
  }

  db.save();
  res.status(201).json({ conversation: conv });
});

// GET /api/v1/conversations/:id/messages
router.get('/:id/messages', requireAuth, (req: AuthRequest, res: Response) => {
  const conv = dbService.getConversationById(String(req.params.id));
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  if (conv.brand_id !== req.user!.userId && conv.creator_id !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. You are not a participant in this conversation.' });
    return;
  }

  // Mark incoming messages as read
  const state = db.getState();
  let updated = false;
  state.messages.forEach((m) => {
    if (m.conversation_id === conv.id && m.sender_id !== req.user!.userId && !m.read_status) {
      m.read_status = true;
      updated = true;
    }
  });
  if (updated) db.save();

  const messages = dbService.getMessages(conv.id);
  res.json({ conversation: conv, messages });
});

// POST /api/v1/conversations/:id/messages
router.post('/:id/messages', requireAuth, validateBody(sendMessageSchema), (req: AuthRequest, res: Response) => {
  const conv = dbService.getConversationById(String(req.params.id));
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  if (conv.brand_id !== req.user!.userId && conv.creator_id !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. You are not a participant in this conversation.' });
    return;
  }

  const sender = dbService.getProfileById(req.user!.userId)!;
  const newMsg: Message = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    conversation_id: conv.id,
    sender_id: sender.id,
    sender_name: sender.name,
    sender_avatar: sender.avatar_url,
    body: req.body.body,
    read_status: false,
    created_at: new Date().toISOString(),
  };

  dbService.addMessage(newMsg);

  const recipientId = conv.brand_id === sender.id ? conv.creator_id : conv.brand_id;
  dbService.createNotification({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: recipientId,
    type: 'message',
    title: `New Message from ${sender.name}`,
    message: newMsg.body.slice(0, 90),
    link: '/messages',
    read_status: false,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ message: newMsg });
});

export default router;
