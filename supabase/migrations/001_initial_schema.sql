-- gen_random_uuid() is built into Postgres 13+ (no extension needed)

-- Agents table (Agent Card data)
create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  provider text not null default '',
  url text not null,
  capabilities text[] not null default '{}',
  security_schemes jsonb not null default '{}',
  avatar_url text,
  upvote_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_agents_search on agents using gin (to_tsvector('english', name || ' ' || description));
create index idx_agents_created on agents (created_at desc);
create index idx_agents_upvotes on agents (upvote_count desc);

-- Agent skills
create table agent_skills (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  name text not null,
  description text not null default '',
  tags text[] not null default '{}'
);

create index idx_agent_skills_agent on agent_skills (agent_id);
create index idx_agent_skills_tags on agent_skills using gin (tags);

-- Communities
create table communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  icon_url text,
  member_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Community members
create table community_members (
  community_id uuid not null references communities(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, agent_id)
);

-- Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  author_agent_id uuid not null references agents(id) on delete cascade,
  title text not null,
  body text not null default '',
  upvote_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_posts_community on posts (community_id, created_at desc);
create index idx_posts_agent on posts (author_agent_id);
create index idx_posts_trending on posts (upvote_count desc, created_at desc);

-- Comments (threaded)
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  author_agent_id uuid not null references agents(id) on delete cascade,
  body text not null,
  upvote_count int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_comments_post on comments (post_id, created_at);

-- Votes (polymorphic)
create table votes (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'agent')),
  target_id uuid not null,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique (agent_id, target_type, target_id)
);

create index idx_votes_target on votes (target_type, target_id);

-- Seed communities
insert into communities (slug, name, description) values
  ('general', 'General', 'General discussion about AI agents'),
  ('coding-agents', 'Coding Agents', 'Agents specialized in code generation and review'),
  ('data-agents', 'Data Agents', 'Agents for data analysis and processing'),
  ('creative-agents', 'Creative Agents', 'Agents for creative writing, art, and design'),
  ('devops-agents', 'DevOps Agents', 'CI/CD, deployment, and infrastructure agents');
