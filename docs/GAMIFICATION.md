# 🎮 PoseLab: Gamification & Creator Economy Spec

> **Status:** Draft / Planning  
> **Target Version:** v2.0  
> **Context:** Architecting the "next layer" of PoseLab to transition from a standalone tool to a user-centric creator platform.

---

## 1. 🌌 Vision: The Creator Economy

PoseLab (Reaction Forge) is evolving into a platform where creativity is rewarded. By implementing a user account system and a tokenized economy, we aim to:
1.  **Incentivize Usage**: Encourage daily interaction through gamified challenges.
2.  **Reward Mastery**: Give users tangible status and currency for learning advanced tools (Mocap, Timeline).
3.  **Sustain Development**: Create a revenue stream via credit purchases for power users.
4.  **Build Community**: Allow users to showcase their work on public profiles.

---

## 2. 👤 User System (Identity Layer)

Before we can track credits, we need persistent identity.

### 2.1 Authentication
- **Methods**: Email/Password (Magic Link preferred), Google, Wallet Connect (for crypto native users).
- **Provider**: Supabase Auth or Firebase (TBD).

### 2.2 Profile Structure
Each user has a public profile (`poselab.studio/u/username`) displaying:
- **Avatar**: Their current active VRM thumbnail.
- **Level & Title**: e.g., "Lvl 5 - Reality Weaver".
- **Stats**: Total Creations, Challenges Completed, Streak Days.
- **Gallery**: A grid of public saved Poses and Reactions (optional privacy settings).

---

## 3. 💎 The Credit System (Economy Layer)

Credits (internal currency, potentially bridged to on-chain tokens later) are the fuel of the platform.

### 3.1 Currency: "Flux" (Placeholder Name)
- **Soft Currency**: Earned via gameplay/challenges. Cap on wallet size?
- **Hard Currency**: Purchased via fiat/crypto.

### 3.2 Earning Credits (Inflow)
Users earn credits by engaging with the tool:
1.  **Daily Login Bonus**: Small amount for opening the app (requires streak).
2.  **Daily Challenges**: 3 randomized tasks per day (see Section 4).
3.  **Milestones**: One-time rewards for achievements (e.g., "First Mocap Recording").
4.  **Referrals**: Invite creators to the platform.

### 3.3 Buying Credits (Inflow)
- **Fiat Railway**: Stripe integration for credit packs ($5 for 500 Credits).
- **Crypto Railway**: Smart contract integration for purchasing credits with ETH/Stablecoins.

### 3.4 Spending Credits (Outflow)
How credits are utilized within PoseLab:
- **AI Generation**: High-quality text-to-pose requests (cost per prompt).
- **Premium Exports**: 4K resolution, 60fps WebM, or transparent ProRes video.
- **Cloud Storage**: Save unlimited poses/animations to the cloud (vs local storage).
- **Asset Unlock**: Purchase exclusive background packs or props.

---

## 4. 🎲 Gamification Mechanics

### 4.1 Daily Challenges (The Loop)
The system generates 3 daily quests to encourage feature exploration.
*Examples:*
- 🟢 **"Green Screen Guru"**: Record a 10s clip using Green Screen mode.
- 🎭 **"Emotional Range"**: Create a reaction with "Joy" set to 1.0.
- 🎥 **"Director's Cut"**: Export a video in 9:16 aspect ratio.
- 🧙‍♂️ **"Prompt Engineer"**: Generate a pose using the AI tool.

### 4.2 Progression System
- **XP**: Every credit earned also grants XP.
- **Levels**: Leveling up unlocks:
    - New Titles (e.g., *Novice* -> *Adept* -> *Architect*).
    - Profile customization (banners, borders).
    - Higher daily credit caps.

### 4.3 Streaks
- Consecutive days of completing at least 1 daily challenge.
- Multiplier bonus on credit earnings for maintaining streaks (e.g., 1.5x after 7 days).

---

## 5. 🖥️ UI/UX Implementation Plan

### 5.1 New "Profile" Tab
A new main tab in the Control Panel (or a persistent top-right overlay).
- **Header**: User Avatar, Level Bar, Credit Balance.
- **Daily Quests Card**: List of 3 tasks with progress bars and "Claim" buttons.
- **Wallet Section**: "Buy Credits" / "Transaction History".
- **Library**: Cloud-saved Poses and Animations.

### 5.2 Notification System
- **Toasts**: "Challenge Complete: +50 Credits!"
- **Confetti**: Visual feedback for leveling up or claiming rewards.

---

## 6. 🏗️ Technical Architecture (Draft)

### 6.1 Database Schema (SQL/Supabase)
```sql
users (
  id: uuid,
  email: string,
  username: string,
  credits_balance: int,
  xp: int,
  created_at: timestamp
)

daily_challenges (
  id: uuid,
  user_id: uuid,
  task_type: enum, -- 'EXPORT_VIDEO', 'USE_AI', etc.
  target_count: int,
  current_count: int,
  is_claimed: boolean,
  date: date
)

transactions (
  id: uuid,
  user_id: uuid,
  amount: int,
  type: enum, -- 'EARN', 'SPEND', 'PURCHASE'
  source: string
)

assets (
  id: uuid,
  user_id: uuid,
  type: enum, -- 'POSE', 'ANIMATION'
  data: jsonb, -- The pose definition
  public: boolean
)
```

### 6.2 Backend Services
- **Challenge Engine**: A cron job or serverless function that resets challenges at 00:00 UTC.
- **Event Bus**: The frontend `SceneManager` and `ReactionStore` need to emit events (e.g., `ON_EXPORT_COMPLETE`) that the Challenge Engine listens to for tracking progress.

---

## 7. 🗓️ Roadmap

### Phase 1: Foundation 🧱
- [ ] Set up Authentication (Login/Signup).
- [ ] Create Database schema.
- [ ] Implement Basic Profile UI (View only).

### Phase 2: The Loop 🔄
- [ ] Implement "Event Bus" to track user actions.
- [ ] Build Challenge Engine (Daily quest generation).
- [ ] Add "Claim Reward" UI.

### Phase 3: Economy 💰
- [ ] Implement Credit System (Database logic).
- [ ] Add "Cost" to AI generation.
- [ ] Integrate Stripe/Payment provider.

### Phase 4: Expansion 🚀
- [ ] Leaderboards.
- [ ] Public Profile Gallery.
- [ ] NFT/On-chain integration (Optional).
