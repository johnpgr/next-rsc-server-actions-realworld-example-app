CREATE TABLE IF NOT EXISTS `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `article` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`body` text NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `comment` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`article_id` text NOT NULL,
	`body` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`),
	FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `favorite` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`article_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `follow` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`article_id` text NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer,
	`bio` text,
	`image` text,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `posts__user_id__idx` ON `article` (`author_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `comments__user_id__idx` ON `comment` (`author_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `comments__article_id__idx` ON `comment` (`article_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `favorites__user_id__idx` ON `favorite` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `favorites__article_id__idx` ON `favorite` (`article_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `follows__follower_id__idx` ON `follow` (`follower_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `follows__following_id__idx` ON `follow` (`following_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tags__article_id__idx` ON `tag` (`article_id`);
--> statement-breakpoint
