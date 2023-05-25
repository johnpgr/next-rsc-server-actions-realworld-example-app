BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(191),
    "email" varchar(191) NOT NULL,
    "emailVerified" timestamp,
    "image" varchar(191),
    CONSTRAINT "user_id_email" PRIMARY KEY("id", "email")
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "type" varchar(191) NOT NULL,
    "provider" varchar(191) NOT NULL,
    "providerAccountId" varchar(191) NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" varchar(191),
    "scope" varchar(191),
    "id_token" text,
    "session_state" varchar(191),
    CONSTRAINT "account_id_provider_providerAccountId" PRIMARY KEY("id", "provider", "providerAccountId"),
    CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "article" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "author_id" varchar(191) NOT NULL,
    "slug" varchar(191) NOT NULL,
    "title" varchar(191) NOT NULL,
    "description" varchar(191) NOT NULL,
    "body" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comment" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "author_id" uuid NOT NULL,
    "article_id" uuid NOT NULL,
    "body" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "comment_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "favorite" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "article_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "favorite_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "follow" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "follower_id" uuid NOT NULL,
    "following_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "follow_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "follow_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "sessionToken" varchar(191) NOT NULL,
    "userId" uuid NOT NULL,
    "expires" timestamp NOT NULL,
    CONSTRAINT "session_id_sessionToken" PRIMARY KEY("id", "sessionToken"),
    CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "tag" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(191) NOT NULL,
    "article_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tag_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
    "identifier" varchar(191) NOT NULL,
    "token" varchar(191) NOT NULL,
    "expires" timestamp NOT NULL,
    CONSTRAINT "verificationToken_identifier_token" PRIMARY KEY("identifier", "token")
);

COMMIT;

BEGIN;

CREATE INDEX IF NOT EXISTS "posts__user_id__idx" ON "article" ("author_id");

CREATE INDEX IF NOT EXISTS "comments__user_id__idx" ON "comment" ("author_id");

CREATE INDEX IF NOT EXISTS "comments__article_id__idx" ON "comment" ("article_id");

CREATE INDEX IF NOT EXISTS "favorites__user_id__idx" ON "favorite" ("user_id");

CREATE INDEX IF NOT EXISTS "favorites__article_id__idx" ON "favorite" ("article_id");

CREATE INDEX IF NOT EXISTS "follows__follower_id__idx" ON "follow" ("follower_id");

CREATE INDEX IF NOT EXISTS "follows__following_id__idx" ON "follow" ("following_id");

CREATE INDEX IF NOT EXISTS "tags__article_id__idx" ON "tag" ("article_id");

COMMIT;