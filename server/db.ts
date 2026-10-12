import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSchema, getInitialSeedData, SEED_VERSION } from './seedData.js';
import { FullCreator, Profile } from '../src/types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const SECRET_KEY = process.env.JWT_SECRET || 'creatorconnect-ai-super-secret-jwt-key-2026';

export function hashPassword(password: string): string {
  const salt = 'cc_ai_salt_v1';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

export function signToken(payload: { userId: string; role: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return { userId: decoded.userId, role: decoded.role, email: decoded.email };
  } catch {
    return null;
  }
}

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.version !== SEED_VERSION || (parsed.creator_profiles?.length || 0) < 100) {
          this.data = getInitialSeedData(hashPassword);
          this.save();
        } else {
          this.data = parsed;
        }
      } catch {
        this.data = getInitialSeedData(hashPassword);
        this.save();
      }
    } else {
      this.data = getInitialSeedData(hashPassword);
      this.save();
    }
  }

  public getState(): DatabaseSchema {
    return this.data;
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public resetToSeed(): void {
    this.data = getInitialSeedData(hashPassword);
    this.save();
  }

  public getFullCreator(creatorId: string): FullCreator | null {
    const profile = this.data.profiles.find((p) => p.id === creatorId && p.role === 'creator');
    if (!profile) return null;
    const creatorProfile = this.data.creator_profiles.find((cp) => cp.creator_id === creatorId);
    if (!creatorProfile) return null;
    const portfolio = this.data.portfolio_projects
      .filter((proj) => proj.creator_id === creatorId)
      .map((proj) => ({
        ...proj,
        creator_name: profile.name,
        creator_avatar: profile.avatar_url,
      }));
    const reviews = this.data.reviews
      .filter((rev) => rev.creator_id === creatorId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...profile,
      creator_profile: creatorProfile,
      portfolio,
      reviews,
    };
  }

  public getAllFullCreators(): FullCreator[] {
    // Fast lookup maps for 138+ creators and 414+ portfolio items
    const cpMap = new Map(this.data.creator_profiles.map((cp) => [cp.creator_id, cp]));
    const portMap = new Map<string, typeof this.data.portfolio_projects>();
    for (const proj of this.data.portfolio_projects) {
      const list = portMap.get(proj.creator_id) || [];
      list.push(proj);
      portMap.set(proj.creator_id, list);
    }
    const revMap = new Map<string, typeof this.data.reviews>();
    for (const rev of this.data.reviews) {
      const list = revMap.get(rev.creator_id) || [];
      list.push(rev);
      revMap.set(rev.creator_id, list);
    }

    const result: FullCreator[] = [];
    for (const profile of this.data.profiles) {
      if (profile.role !== 'creator') continue;
      const cp = cpMap.get(profile.id);
      if (!cp) continue;
      const portfolio = (portMap.get(profile.id) || []).map((p) => ({
        ...p,
        creator_name: profile.name,
        creator_avatar: profile.avatar_url,
      }));
      const reviews = revMap.get(profile.id) || [];
      result.push({
        ...profile,
        creator_profile: cp,
        portfolio,
        reviews,
      });
    }
    return result;
  }

  public getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }
}

export const db = new PersistentDatabase();
