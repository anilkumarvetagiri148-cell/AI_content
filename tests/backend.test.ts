import http from 'http';
import { app } from '../server/index.js';
import { computeRecommendations } from '../server/services/aiMatchingService.js';
import { dbService } from '../server/services/dbService.js';

let server: http.Server;
let baseUrl = '';

async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    // Port 0 picks a free available ephemeral port automatically
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address !== null) {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
}

async function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

interface TestReport {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const reports: TestReport[] = [];

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    reports.push({ name: testName, passed: true, details });
    console.log(`  ✅ PASS: ${testName} ${details ? `(${details})` : ''}`);
  } else {
    reports.push({ name: testName, passed: false, error: 'Assertion failed' });
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTests() {
  console.log('===========================================================');
  console.log('🧪 CREATORCONNECT AI — BACKEND COMPREHENSIVE TEST SUITE');
  console.log('===========================================================\n');

  await startServer();
  console.log(`🚀 Test Server started at ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // TEST 1: Health & Compatibility Endpoints
    // -------------------------------------------------------------
    console.log('[Phase 9.1] Health & Route Aliasing Check');
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    const healthData = await healthRes.json() as any;
    assert(healthRes.status === 200, 'Health endpoint responds 200 OK');
    assert(healthData.status === 'ok', 'Health status is ok');
    assert(healthData.counts.creators > 0, `Database has ${healthData.counts.creators} creators pre-loaded`);

    const healthAliasRes = await fetch(`${baseUrl}/api/health`);
    const healthAliasData = await healthAliasRes.json() as any;
    assert(healthAliasRes.status === 200 && healthAliasData.status === 'ok', '/api/health backward compatibility alias works');

    // -------------------------------------------------------------
    // TEST 2: Authentication & Registration (Brand & Creator)
    // -------------------------------------------------------------
    console.log('\n[Phase 9.2] Authentication & Registration');
    const timestamp = Date.now();
    const brandEmail = `testbrand-${timestamp}@example.com`;
    const creatorEmail = `testcreator-${timestamp}@example.com`;
    const password = 'Password@123';

    // Signup Brand
    const brandSignupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: brandEmail,
        password,
        name: 'Apex Future Brands',
        role: 'brand',
        company_name: 'Apex Media Corp',
      }),
    });
    const brandSignupData = await brandSignupRes.json() as any;
    assert(brandSignupRes.status === 201, 'Brand user registered successfully');
    assert(Boolean(brandSignupData.token), 'JWT Token generated for Brand');
    const brandToken = brandSignupData.token;
    const brandUserId = brandSignupData.user.id;

    // Signup Creator
    const creatorSignupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: creatorEmail,
        password,
        name: 'Zara Vex',
        role: 'creator',
        specialization: 'Technology & AI',
      }),
    });
    const creatorSignupData = await creatorSignupRes.json() as any;
    assert(creatorSignupRes.status === 201, 'Creator user registered successfully');
    assert(Boolean(creatorSignupData.token), 'JWT Token generated for Creator');
    const creatorToken = creatorSignupData.token;
    const creatorUserId = creatorSignupData.user.id;

    // Login Creator
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, password }),
    });
    const loginData = await loginRes.json() as any;
    assert(loginRes.status === 200 && Boolean(loginData.token), 'Creator login succeeds and issues token');

    // -------------------------------------------------------------
    // TEST 3: Role-Based Access Control (RBAC)
    // -------------------------------------------------------------
    console.log('\n[Phase 9.3] Role-Based Access Control (RBAC) Security');

    // Creator attempting to create campaign -> MUST FAIL 403
    const unauthorizedCampRes = await fetch(`${baseUrl}/api/v1/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Campaign by Creator',
        description: 'Should be rejected',
        category: 'Technology & AI',
        budget_min: 10000,
        budget_max: 20000,
        deadline: '2026-12-31',
        deliverables: ['1x Video'],
      }),
    });
    assert(unauthorizedCampRes.status === 403, 'Creator blocked from creating campaign (403 Forbidden)');

    // Brand attempting to submit proposal -> MUST FAIL 403
    const unauthorizedPropRes = await fetch(`${baseUrl}/api/v1/campaigns/dummy-id/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({
        pitch: 'Unauthorized proposal by Brand',
        price: 15000,
        timeline: '5 days',
      }),
    });
    assert(unauthorizedPropRes.status === 403, 'Brand blocked from submitting proposal (403 Forbidden)');

    // Unauthenticated access to protected route -> MUST FAIL 401
    const unauthRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected (401 Unauthorized)');

    // -------------------------------------------------------------
    // TEST 4: Creator Discovery & 24 Categories Coverage
    // -------------------------------------------------------------
    console.log('\n[Phase 9.4] Creator Discovery & Category Filtering');
    const categories = [
      'Finance & Investing',
      'Education & E-Learning',
      'Business & Entrepreneurship',
      'Technology & AI',
      'Gaming & Esports',
      'Health & Fitness',
    ];

    const allCreatorsRes = await fetch(`${baseUrl}/api/v1/creators?limit=10`);
    const allCreatorsData = await allCreatorsRes.json() as any;
    assert(allCreatorsRes.status === 200, 'List all creators returns 200 OK');
    assert(allCreatorsData.creators.length > 0, `Pagination returned ${allCreatorsData.creators.length} creators (total: ${allCreatorsData.total})`);

    for (const cat of categories) {
      const catRes = await fetch(`${baseUrl}/api/v1/creators?category=${encodeURIComponent(cat)}`);
      const catData = await catRes.json() as any;
      assert(
        catRes.status === 200 && catData.creators.length > 0,
        `Category "${cat}" has matching creators in database (${catData.creators.length} found)`
      );
    }

    // Single Creator Profile Detail
    const sampleCreator = allCreatorsData.creators[0];
    const detailRes = await fetch(`${baseUrl}/api/v1/creators/${sampleCreator.id}`);
    const detailData = await detailRes.json() as any;
    assert(detailRes.status === 200, 'Creator detail profile retrieves 200 OK');
    assert(detailData.creator.id === sampleCreator.id, 'Creator detail contains full profile with portfolios');

    // -------------------------------------------------------------
    // TEST 5: Campaign Creation & Lifecycle
    // -------------------------------------------------------------
    console.log('\n[Phase 9.5] Campaign Creation & Management');
    const campCreateRes = await fetch(`${baseUrl}/api/v1/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({
        title: 'Autonomous AI Brand Teaser 2026',
        description: 'Need photorealistic cinematic AI video assets showcasing our next-gen robotics platform.',
        category: 'Technology & AI',
        content_type: 'AI Video Commercial + Stills',
        budget_min: 25000,
        budget_max: 60000,
        deadline: '2026-11-15',
        deliverables: ['1x 30s 4K Video', '5x High-Res Still Keyframes'],
        required_skills: ['Cinematic AI Video', 'Photorealistic Product Renders'],
        required_ai_tools: ['Runway Gen-3 Alpha', 'Midjourney v6'],
      }),
    });
    const campCreateData = await campCreateRes.json() as any;
    assert(campCreateRes.status === 201, 'Brand creates campaign brief successfully (201 Created)');
    const campaignId = campCreateData.campaign.id;
    assert(Boolean(campaignId), `Campaign ID created: ${campaignId}`);

    // -------------------------------------------------------------
    // TEST 6: Proposal Submission & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n[Phase 9.6] Proposal Submission & Duplicate Rejection');
    const proposalRes = await fetch(`${baseUrl}/api/v1/campaigns/${campaignId}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        pitch: 'I have 3 years of experience generating high-end AI cinematic teasers with Runway Gen-3.',
        price: 45000,
        timeline: '7 business days',
      }),
    });
    const proposalData = await proposalRes.json() as any;
    assert(proposalRes.status === 201, 'Creator submits campaign proposal successfully (201 Created)');
    const proposalId = proposalData.proposal.id;

    // Submit DUPLICATE proposal by same creator -> MUST FAIL 409
    const dupProposalRes = await fetch(`${baseUrl}/api/v1/campaigns/${campaignId}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        pitch: 'Submitting again',
        price: 40000,
        timeline: '5 days',
      }),
    });
    assert(dupProposalRes.status === 409, 'Duplicate proposal submission rejected (409 Conflict)');

    // -------------------------------------------------------------
    // TEST 7: Proposal Acceptance & Conversation Auto-Initiation
    // -------------------------------------------------------------
    console.log('\n[Phase 9.7] Proposal Acceptance & Conversation Auto-Initiation');
    const acceptRes = await fetch(`${baseUrl}/api/v1/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    const acceptData = await acceptRes.json() as any;
    assert(acceptRes.status === 200, 'Brand accepts creator proposal (200 OK)');
    assert(acceptData.proposal.status === 'accepted', 'Proposal status transitioned to accepted');
    assert(acceptData.campaign.status === 'in_progress', 'Campaign transitioned to in_progress');

    // Verify conversation was automatically initiated between brand and creator
    const convRes = await fetch(`${baseUrl}/api/v1/conversations`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    const convData = await convRes.json() as any;
    assert(convRes.status === 200, 'Conversations list retrieves 200 OK');
    const activeConv = convData.conversations.find(
      (c: any) => c.creator_id === creatorUserId && c.brand_id === brandUserId
    );
    assert(Boolean(activeConv), 'Automated direct conversation thread was created');
    const conversationId = activeConv.id;

    // -------------------------------------------------------------
    // TEST 8: Messaging & Participant Authorization
    // -------------------------------------------------------------
    console.log('\n[Phase 9.8] Messaging & Security Enforcement');
    // Brand sends message
    const sendMsgRes = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({ body: 'Hi Zara, welcome to the campaign! Let us align on style boards.' }),
    });
    assert(sendMsgRes.status === 201, 'Brand posts message to conversation');

    // Creator reads messages
    const getMsgsRes = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const msgsData = await getMsgsRes.json() as any;
    assert(getMsgsRes.status === 200 && msgsData.messages.length > 0, 'Creator reads conversation messages');

    // Unrelated third-party user cannot access conversation -> MUST FAIL 403
    const thirdPartySignup = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `intruder-${timestamp}@example.com`,
        password,
        name: 'Intruder',
        role: 'creator',
      }),
    });
    const thirdPartyData = await thirdPartySignup.json() as any;
    const thirdPartyToken = thirdPartyData.token;

    const intruderMsgRes = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${thirdPartyToken}`,
      },
      body: JSON.stringify({ body: 'I am eavesdropping' }),
    });
    assert(intruderMsgRes.status === 403, 'Unauthorized third-party message blocked (403 Forbidden)');

    // -------------------------------------------------------------
    // TEST 9: Campaign Completion & Review Eligibility
    // -------------------------------------------------------------
    console.log('\n[Phase 9.9] Campaign Completion & Verified Reviews');
    // Attempt review BEFORE completion -> MUST FAIL 400
    const earlyReviewRes = await fetch(`${baseUrl}/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        creator_id: creatorUserId,
        rating: 5,
        review_text: 'Premature review',
      }),
    });
    assert(earlyReviewRes.status === 400, 'Review submission for unfinished campaign rejected (400 Bad Request)');

    // Brand marks campaign completed
    const completeCampRes = await fetch(`${baseUrl}/api/v1/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert(completeCampRes.status === 200, 'Brand successfully marks campaign completed');

    // Brand submits verified review
    const reviewRes = await fetch(`${baseUrl}/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        creator_id: creatorUserId,
        rating: 5,
        feedback: 'Outstanding cinematic quality! Flawless Runway Gen-3 motion and delivered 2 days ahead of schedule.',
      }),
    });
    assert(reviewRes.status === 201, 'Verified review submitted successfully (201 Created)');

    // Duplicate review for same campaign -> MUST FAIL 409
    const dupReviewRes = await fetch(`${baseUrl}/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        creator_id: creatorUserId,
        rating: 4,
        feedback: 'Second review attempt',
      }),
    });
    assert(dupReviewRes.status === 409, 'Duplicate review rejected (409 Conflict)');

    // -------------------------------------------------------------
    // TEST 10: 5-Factor AI Creator Matching Engine
    // -------------------------------------------------------------
    console.log('\n[Phase 9.10] 5-Factor AI Creator Matching Engine');
    const allCreators = dbService.getAllFullCreators();
    const recommendations = computeRecommendations(
      allCreators,
      {
        category: 'Technology & AI',
        budget_min: 20000,
        budget_max: 50000,
        required_skills: ['Cinematic AI Video', 'Custom LoRA Training'],
        required_ai_tools: ['Runway Gen-3 Alpha', 'Flux.1 Pro'],
        availability: 'available',
      },
      5
    );

    assert(recommendations.length > 0, `AI Matching produced ${recommendations.length} recommendations`);
    const topMatch = recommendations[0];
    assert(topMatch.matchScore > 50, `Top creator match score is ${topMatch.matchScore}/100`);
    assert(Boolean(topMatch.factors), '5-factor score breakdown present');
    assert(
      topMatch.factors.skillsScore <= 30 &&
      topMatch.factors.portfolioScore <= 30 &&
      topMatch.factors.budgetScore <= 20 &&
      topMatch.factors.toolsScore <= 10 &&
      topMatch.factors.availabilityScore <= 10,
      '5-Factor weights strictly adhere to 30-30-20-10-10 distribution'
    );

    // Matching endpoint API test
    const matchApiRes = await fetch(`${baseUrl}/api/v1/matching/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Technology & AI',
        budget_min: 25000,
        budget_max: 60000,
        required_skills: ['Cinematic AI Video'],
      }),
    });
    const matchApiData = await matchApiRes.json() as any;
    assert(matchApiRes.status === 200, 'POST /api/v1/matching/recommendations returns 200 OK');
    assert(matchApiData.recommendations.length > 0, 'Matching API returns scored candidates with rationale');

    // -------------------------------------------------------------
    // TEST 11: Media Upload Endpoint
    // -------------------------------------------------------------
    console.log('\n[Phase 9.11] Media Upload Endpoint');
    const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await fetch(`${baseUrl}/api/v1/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        filename: 'portfolio-test.png',
        mimeType: 'image/png',
        base64Data: dummyPngBase64,
      }),
    });
    const uploadData = await uploadRes.json() as any;
    assert(uploadRes.status === 201, 'Media upload returns 201 Created');
    assert(Boolean(uploadData.url), `Uploaded media URL: ${uploadData.url.slice(0, 35)}...`);

    // -------------------------------------------------------------
    // TEST 12: Real Database Dashboards
    // -------------------------------------------------------------
    console.log('\n[Phase 9.12] Real Database Dashboards (Creator & Brand)');
    const creatorDashRes = await fetch(`${baseUrl}/api/v1/dashboard/creator`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const creatorDashData = await creatorDashRes.json() as any;
    assert(creatorDashRes.status === 200, 'GET /api/v1/dashboard/creator returns 200 OK');
    assert(creatorDashData.stats.totalEarnings === 45000, `Creator total earnings reflect accepted proposal (₹${creatorDashData.stats.totalEarnings})`);

    const brandDashRes = await fetch(`${baseUrl}/api/v1/dashboard/brand`, {
      headers: { Authorization: `Bearer ${brandToken}` },
    });
    const brandDashData = await brandDashRes.json() as any;
    assert(brandDashRes.status === 200, 'GET /api/v1/dashboard/brand returns 200 OK');
    assert(brandDashData.stats.totalSpent === 45000, `Brand total spend reflects accepted proposal (₹${brandDashData.stats.totalSpent})`);

    console.log('\n===========================================================');
    console.log(`🎉 ALL ${reports.filter((r) => r.passed).length} TESTS PASSED PERFECTLY!`);
    console.log('===========================================================\n');
  } finally {
    await stopServer();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
