CREATE TABLE `Logs` (
	`id` integer PRIMARY KEY NOT NULL,
	`error` text,
	`payload` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Logs_id_unique` ON `Logs` (`id`);