CREATE TABLE `PointType` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PointReference` (
	`pk` integer PRIMARY KEY NOT NULL,
	`id` integer,
	`contract` integer,
	`name` text,
	`device` integer NOT NULL,
	`applicator` integer NOT NULL,
	`point_type` integer,
	`client` integer,
	`city` integer,
	`subregions` integer,
	`marker` text,
	`from_txt` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real NOT NULL,
	`accuracy` real NOT NULL,
	`volume_bti` integer,
	`observation` text,
	`distance` integer,
	`created_ondevice_at` text,
	`transmission` text,
	`image` text,
	`kml_file` text,
	`situation` text,
	`is_active` integer NOT NULL,
	`is_new` integer NOT NULL,
	`edit_location` integer DEFAULT false NOT NULL,
	`edit_name` integer DEFAULT false NOT NULL,
	`edit_status` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Application` (
	`id` integer PRIMARY KEY NOT NULL,
	`point_reference` integer,
	`device` integer NOT NULL,
	`applicator` integer NOT NULL,
	`marker` text,
	`from_txt` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real NOT NULL,
	`accuracy` real NOT NULL,
	`volume_bti` integer NOT NULL,
	`container` integer NOT NULL,
	`card` integer NOT NULL,
	`plate` integer NOT NULL,
	`observation` text,
	`status` text NOT NULL,
	`image` text NOT NULL,
	`created_ondevice_at` text,
	`transmission` text,
	`contract` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `AdultCollection` (
	`id` integer PRIMARY KEY NOT NULL,
	`point_reference` integer,
	`device` integer NOT NULL,
	`applicator` integer NOT NULL,
	`marker` text NOT NULL,
	`from_txt` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real NOT NULL,
	`accuracy` real NOT NULL,
	`wind` text NOT NULL,
	`climate` text NOT NULL,
	`temperature` text NOT NULL,
	`humidity` real NOT NULL,
	`insects_number` integer NOT NULL,
	`observation` text,
	`image` text NOT NULL,
	`contract` integer NOT NULL,
	`transmission` text,
	`created_ondevice_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`is_staff` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Applicator` (
	`id` integer PRIMARY KEY NOT NULL,
	`contract` integer,
	`name` text,
	`cpf` text,
	`status` integer NOT NULL,
	`new_marker` integer NOT NULL,
	`edit_marker` integer NOT NULL,
	`is_leader` integer NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Device` (
	`id` integer PRIMARY KEY NOT NULL,
	`factory_id` text NOT NULL,
	`name` text NOT NULL,
	`authorized` integer NOT NULL,
	`applicator` integer,
	`last_sync` text,
	`color_line` text,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ConfigApp` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data_type` text NOT NULL,
	`data_config` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Tracking` (
	`id` integer PRIMARY KEY NOT NULL,
	`device` integer,
	`applicator` integer,
	`created_ondevice_at` text,
	`transmission` text,
	`latitude` real,
	`longitude` real,
	`altitude` real,
	`accuracy` real,
	`local_timestamp` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Logs` (
	`id` integer PRIMARY KEY NOT NULL,
	`error` text,
	`payload` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PointType_id_unique` ON `PointType` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `PointReference_id_unique` ON `PointReference` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Application_id_unique` ON `Application` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `AdultCollection_id_unique` ON `AdultCollection` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_id_unique` ON `User` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Applicator_id_unique` ON `Applicator` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Device_id_unique` ON `Device` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ConfigApp_id_unique` ON `ConfigApp` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tracking_id_unique` ON `Tracking` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Logs_id_unique` ON `Logs` (`id`);