CREATE TABLE `City` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`poligon` text,
	`from_txt` text,
	`image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PointStatus` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
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
	`device` integer,
	`applicator` integer,
	`pointtype` integer,
	`client` integer,
	`city` integer,
	`subregions` integer,
	`marker` text,
	`from_txt` text,
	`latitude` real,
	`longitude` real,
	`altitude` real,
	`accuracy` real,
	`volumebti` integer,
	`observation` text,
	`distance` integer,
	`created_ondevice_at` text,
	`transmition` text,
	`image` text,
	`kml_file` text,
	`situation` text,
	`is_active` integer,
	`is_new` integer,
	`edit_location` integer,
	`edit_name` integer,
	`edit_status` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Application` (
	`id` integer PRIMARY KEY NOT NULL,
	`pointreference` integer,
	`device` integer,
	`applicator` integer,
	`marker` text,
	`from_txt` text,
	`latitude` real,
	`longitude` real,
	`altitude` real,
	`acuracia` real,
	`volumebti` integer,
	`container` integer,
	`card` integer,
	`plate` integer,
	`observation` text,
	`status` text,
	`image` text,
	`created_ondevice_at` text,
	`transmition` text,
	`contract` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `AdultCollection` (
	`id` integer PRIMARY KEY NOT NULL,
	`pointreference` integer,
	`device` integer,
	`applicator` integer,
	`marker` text,
	`from_txt` text,
	`latitude` real,
	`longitude` real,
	`altitude` real,
	`accuracy` real,
	`wind` text,
	`climate` real,
	`temperature` real,
	`humidity` real,
	`insects_number` integer,
	`observation` text,
	`image` text,
	`contract` integer,
	`transmition` text,
	`created_ondevice_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `FlowRate` (
	`id` integer PRIMARY KEY NOT NULL,
	`pointreference` integer,
	`device` integer,
	`applicator` integer,
	`start_date` text,
	`end_date` text,
	`average_width` real,
	`average_time` real,
	`average_profundity` text,
	`observation` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Customer` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`cnpj` text,
	`address` text,
	`city` text,
	`state` text,
	`phone` text,
	`email` text,
	`logo` text,
	`organization_type` integer,
	`observation` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Contract` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`customer` integer,
	`contract_status` integer,
	`periodicity` text,
	`start_date` text,
	`end_date` text,
	`point_limit` integer,
	`point_overload` integer,
	`volume_bti` real,
	`volume_bti_overload` real,
	`observation` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ContractManager` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` integer,
	`registration` text,
	`role` text,
	`enabled` integer,
	`log_datetime` text,
	`contract` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SystemAdministrator` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` integer,
	`registration` text,
	`role` text,
	`enabled` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`first_name` text,
	`last_name` text,
	`password` text,
	`is_active` integer,
	`is_staff` integer,
	`is_superuser` integer,
	`last_login` text,
	`date_joined` text
);
--> statement-breakpoint
CREATE TABLE `Applicator` (
	`id` integer PRIMARY KEY NOT NULL,
	`contract` integer,
	`name` text,
	`cpf` text,
	`status` integer,
	`new_marker` integer,
	`edit_marker` integer,
	`is_leader` integer,
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
	`name` text,
	`data_type` text,
	`data_config` text,
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
	`transmition` text,
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
CREATE UNIQUE INDEX `City_id_unique` ON `City` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `PointStatus_id_unique` ON `PointStatus` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `PointType_id_unique` ON `PointType` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `PointReference_id_unique` ON `PointReference` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Application_id_unique` ON `Application` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `AdultCollection_id_unique` ON `AdultCollection` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `FlowRate_id_unique` ON `FlowRate` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Customer_id_unique` ON `Customer` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Contract_id_unique` ON `Contract` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ContractManager_id_unique` ON `ContractManager` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `SystemAdministrator_id_unique` ON `SystemAdministrator` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_id_unique` ON `User` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Applicator_id_unique` ON `Applicator` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Device_id_unique` ON `Device` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ConfigApp_id_unique` ON `ConfigApp` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tracking_id_unique` ON `Tracking` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Logs_id_unique` ON `Logs` (`id`);