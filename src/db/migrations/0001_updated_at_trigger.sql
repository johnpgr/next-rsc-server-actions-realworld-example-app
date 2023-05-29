CREATE TRIGGER IF NOT EXISTS update_timestamp AFTER UPDATE ON `article`
FOR EACH ROW
BEGIN
    UPDATE `article` SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
--> statement-breakpoint

CREATE TRIGGER IF NOT EXISTS update_timestamp AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
    UPDATE `user` SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
--> statement-breakpoint
