-- ==============================================================================
-- BIOSCORE DB - BASELINE SCRIPT
-- Architecture: Modular Monolith Database
-- Description: Complete schema, constraints, views and seed data.
-- Engine: SQL Server
-- ==============================================================================

USE master;
GO

-- 1. DATABASE CREATION
-- ============================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'BioScoreDb')
BEGIN
    CREATE DATABASE BioScoreDb COLLATE Latin1_General_CI_AI;
END
GO

USE BioScoreDb;
GO

-- 2. CLEANUP (Idempotency - Drop in reverse dependency order)
-- ============================================================
IF OBJECT_ID('dbo.vw_DailyLogDetailed', 'V') IS NOT NULL DROP VIEW dbo.vw_DailyLogDetailed;
IF OBJECT_ID('dbo.vw_DailyPointsHistory', 'V') IS NOT NULL DROP VIEW dbo.vw_DailyPointsHistory;
IF OBJECT_ID('dbo.vw_ExamsByUser', 'V') IS NOT NULL DROP VIEW dbo.vw_ExamsByUser;

IF OBJECT_ID('dbo.ExamRequestItem', 'U') IS NOT NULL DROP TABLE dbo.ExamRequestItem;
IF OBJECT_ID('dbo.ExamRequest',     'U') IS NOT NULL DROP TABLE dbo.ExamRequest;
IF OBJECT_ID('dbo.Exam',            'U') IS NOT NULL DROP TABLE dbo.Exam;
IF OBJECT_ID('dbo.ExamCategory',    'U') IS NOT NULL DROP TABLE dbo.ExamCategory;
IF OBJECT_ID('dbo.DailyLogItem',    'U') IS NOT NULL DROP TABLE dbo.DailyLogItem;
IF OBJECT_ID('dbo.DailyLog',        'U') IS NOT NULL DROP TABLE dbo.DailyLog;
IF OBJECT_ID('dbo.FoodItem',        'U') IS NOT NULL DROP TABLE dbo.FoodItem;
IF OBJECT_ID('dbo.FoodCategory',    'U') IS NOT NULL DROP TABLE dbo.FoodCategory;
IF OBJECT_ID('dbo.Users',           'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- 3. DDL - TABLES CREATION
-- ============================================================
CREATE TABLE dbo.Users (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    FullName        NVARCHAR(150)    NOT NULL,
    Email           NVARCHAR(150)    NOT NULL,
    PhoneNumber     NVARCHAR(20)     NULL,
    BirthDate       DATE             NULL,
    Gender          NVARCHAR(10)     NOT NULL,   -- 'Male' | 'Female' | 'Other'
    Username        NVARCHAR(80)     NOT NULL,
    PasswordHash    NVARCHAR(256)    NOT NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NULL,

    CONSTRAINT PK_Users              PRIMARY KEY (Id),
    CONSTRAINT UQ_Users_Email        UNIQUE (Email),
    CONSTRAINT UQ_Users_Username     UNIQUE (Username)
);

CREATE TABLE dbo.FoodCategory (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Name                NVARCHAR(100)    NOT NULL,
    Description         NVARCHAR(300)    NULL,
    DefaultQuotaPoints  SMALLINT         NULL,
    ServingUnit         NVARCHAR(100)    NULL,
    SortOrder           TINYINT          NOT NULL DEFAULT 0,
    IsActive            BIT              NOT NULL DEFAULT 1,

    CONSTRAINT PK_FoodCategory PRIMARY KEY (Id)
);

CREATE TABLE dbo.FoodItem (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    FoodCategoryId  UNIQUEIDENTIFIER NOT NULL,
    Name            NVARCHAR(150)    NOT NULL,
    ServingSize     NVARCHAR(100)    NULL,
    Points          SMALLINT         NOT NULL DEFAULT 0,
    Notes           NVARCHAR(300)    NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,

    CONSTRAINT PK_FoodItem              PRIMARY KEY (Id),
    CONSTRAINT FK_FoodItem_Category     FOREIGN KEY (FoodCategoryId) REFERENCES dbo.FoodCategory (Id)
);

CREATE TABLE dbo.DailyLog (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    UserId      UNIQUEIDENTIFIER NOT NULL,
    LogDate     DATE             NOT NULL,
    TotalPoints SMALLINT         NOT NULL DEFAULT 0,
    Notes       NVARCHAR(500)    NULL,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NULL,

    CONSTRAINT PK_DailyLog              PRIMARY KEY (Id),
    CONSTRAINT FK_DailyLog_User         FOREIGN KEY (UserId) REFERENCES dbo.Users (Id),
    CONSTRAINT UQ_DailyLog_UserDate     UNIQUE (UserId, LogDate)
);

CREATE TABLE dbo.DailyLogItem (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    DailyLogId      UNIQUEIDENTIFIER NOT NULL,
    FoodItemId      UNIQUEIDENTIFIER NOT NULL,
    Quantity        DECIMAL(5,2)     NOT NULL DEFAULT 1,
    PointsComputed  SMALLINT         NOT NULL DEFAULT 0,
    MealTime        TIME             NULL,
    Notes           NVARCHAR(200)    NULL,

    CONSTRAINT PK_DailyLogItem              PRIMARY KEY (Id),
    CONSTRAINT FK_DailyLogItem_DailyLog     FOREIGN KEY (DailyLogId) REFERENCES dbo.DailyLog (Id),
    CONSTRAINT FK_DailyLogItem_FoodItem     FOREIGN KEY (FoodItemId) REFERENCES dbo.FoodItem (Id)
);

CREATE TABLE dbo.ExamCategory (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Name        NVARCHAR(100)    NOT NULL,
    SortOrder   TINYINT          NOT NULL DEFAULT 0,
    IsActive    BIT              NOT NULL DEFAULT 1,

    CONSTRAINT PK_ExamCategory PRIMARY KEY (Id)
);

CREATE TABLE dbo.Exam (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ExamCategoryId  UNIQUEIDENTIFIER NOT NULL,
    Name            NVARCHAR(150)    NOT NULL,
    Abbreviation    NVARCHAR(50)     NULL,
    Description     NVARCHAR(300)    NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,

    CONSTRAINT PK_Exam              PRIMARY KEY (Id),
    CONSTRAINT FK_Exam_Category     FOREIGN KEY (ExamCategoryId) REFERENCES dbo.ExamCategory (Id)
);

CREATE TABLE dbo.ExamRequest (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    UserId          UNIQUEIDENTIFIER NOT NULL,
    RequestDate     DATE             NOT NULL DEFAULT CAST(GETUTCDATE() AS DATE),
    DoctorName      NVARCHAR(150)    NULL,
    Notes           NVARCHAR(500)    NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NULL,

    CONSTRAINT PK_ExamRequest           PRIMARY KEY (Id),
    CONSTRAINT FK_ExamRequest_User      FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
);

CREATE TABLE dbo.ExamRequestItem (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ExamRequestId   UNIQUEIDENTIFIER NOT NULL,
    ExamId          UNIQUEIDENTIFIER NOT NULL,
    IsCompleted     BIT              NOT NULL DEFAULT 0,
    CompletedDate   DATE             NULL,
    Result          NVARCHAR(500)    NULL,
    Laboratory      NVARCHAR(150)    NULL,
    Notes           NVARCHAR(300)    NULL,

    CONSTRAINT PK_ExamRequestItem               PRIMARY KEY (Id),
    CONSTRAINT FK_ExamRequestItem_ExamRequest   FOREIGN KEY (ExamRequestId) REFERENCES dbo.ExamRequest (Id),
    CONSTRAINT FK_ExamRequestItem_Exam          FOREIGN KEY (ExamId) REFERENCES dbo.Exam (Id),
    CONSTRAINT UQ_ExamRequestItem               UNIQUE (ExamRequestId, ExamId)
);
GO

-- 4. INDEXES
-- ============================================================
CREATE INDEX IX_FoodItem_Category          ON dbo.FoodItem (FoodCategoryId);
CREATE INDEX IX_DailyLog_User              ON dbo.DailyLog (UserId);
CREATE INDEX IX_DailyLog_Date              ON dbo.DailyLog (LogDate);
CREATE INDEX IX_DailyLogItem_DailyLog      ON dbo.DailyLogItem (DailyLogId);
CREATE INDEX IX_Exam_Category              ON dbo.Exam (ExamCategoryId);
CREATE INDEX IX_ExamRequest_User           ON dbo.ExamRequest (UserId);
CREATE INDEX IX_ExamRequestItem_Request    ON dbo.ExamRequestItem (ExamRequestId);
GO

-- 5. SEED DATA - FOOD MODULE
-- ============================================================
SET NOCOUNT ON;

INSERT INTO dbo.FoodCategory (Id, Name, Description, DefaultQuotaPoints, ServingUnit, SortOrder) VALUES
(NEWID(), 'Vegetables',          'Free consumption — no points counted',                          0,    'Unlimited',         1),
(NEWID(), 'Legumes',             'Cooked or raw legumes',                                         10,   '2 full tablespoons',2),
(NEWID(), 'Meats',               'Meats, poultry, fish and seafood',                              25,   '1 serving quota',   3),
(NEWID(), 'Cheeses',             'All types of cheese',                                           25,   '1 serving quota',   4),
(NEWID(), 'Grains and Starches', 'Rice, bread, pasta, flours and cereals',                        20,   '1 serving quota',   5),
(NEWID(), 'Fruits',              'Fresh and dried fruits',                                        15,   '1 serving quota',   6),
(NEWID(), 'Fast Food / Snacks',  'Snacks and fast food — points per individual serving',          NULL, 'Serving',           7),
(NEWID(), 'Fat-Free Sweets',     'Desserts and sweets with low fat content',                      NULL, 'Serving',           8),
(NEWID(), 'High-Fat Sweets',     'Desserts and sweets with fat — consume in moderation',          NULL, 'Serving',           9),
(NEWID(), 'Condiments',          'Seasonings and condiments',                                     NULL, 'Serving',           10),
(NEWID(), 'Others',              'Food items that do not fit other categories',                   NULL, 'Serving',           11),
(NEWID(), 'Beverages',           'Alcoholic and non-alcoholic beverages',                         NULL, 'Serving',           12),
(NEWID(), 'Soups',               'Soups and broths',                                              NULL, 'Serving / Ladle',   13);

-- Vegetables
INSERT INTO dbo.FoodItem (FoodCategoryId, Name, ServingSize, Points)
SELECT c.Id, v.Name, v.ServingSize, v.Points FROM dbo.FoodCategory c CROSS JOIN (VALUES
    ('Swiss Chard', 'Unlimited', 0), ('Watercress', 'Unlimited', 0), ('Lettuce', 'Unlimited', 0), ('Tomato', 'Unlimited', 0), ('Broccoli', 'Unlimited', 0)
) v(Name, ServingSize, Points) WHERE c.Name = 'Vegetables';

-- Legumes
INSERT INTO dbo.FoodItem (FoodCategoryId, Name, ServingSize, Points)
SELECT c.Id, v.Name, v.ServingSize, v.Points FROM dbo.FoodCategory c CROSS JOIN (VALUES
    ('Zucchini', '2 tablespoons', 10), ('Carrot', '2 tablespoons', 10), ('Green Beans', '2 tablespoons', 10)
) v(Name, ServingSize, Points) WHERE c.Name = 'Legumes';

-- Meats
INSERT INTO dbo.FoodItem (FoodCategoryId, Name, ServingSize, Points)
SELECT c.Id, v.Name, v.ServingSize, v.Points FROM dbo.FoodCategory c CROSS JOIN (VALUES
    ('Lean Steak (no fat/skin)', '1 tea-saucer', 25), ('Chicken', '1 small unit', 25), ('Salmon', '1 tea-saucer', 25)
) v(Name, ServingSize, Points) WHERE c.Name = 'Meats';

-- Grains
INSERT INTO dbo.FoodItem (FoodCategoryId, Name, ServingSize, Points)
SELECT c.Id, v.Name, v.ServingSize, v.Points FROM dbo.FoodCategory c CROSS JOIN (VALUES
    ('Cooked White Rice', '2 tablespoons', 20), ('Cooked Black Beans', '4 tablespoons', 20), ('Whole Grain Bread', '1 slice', 20)
) v(Name, ServingSize, Points) WHERE c.Name = 'Grains and Starches';

-- Fruits
INSERT INTO dbo.FoodItem (FoodCategoryId, Name, ServingSize, Points)
SELECT c.Id, v.Name, v.ServingSize, v.Points FROM dbo.FoodCategory c CROSS JOIN (VALUES
    ('Apple', '1 unit', 15), ('Banana', '1 unit', 15), ('Orange', '1 unit', 15)
) v(Name, ServingSize, Points) WHERE c.Name = 'Fruits';

-- 6. SEED DATA - EXAMS MODULE
-- ============================================================
INSERT INTO dbo.ExamCategory (Id, Name, SortOrder, IsActive) VALUES
(NEWID(), 'Biochemistry (Blood)',       1,  1),
(NEWID(), 'Immunology',                 2,  1),
(NEWID(), 'Hematology',                 3,  1),
(NEWID(), 'Hormones',                   4,  1),
(NEWID(), 'Thyroid',                    5,  1);

-- Biochemistry
INSERT INTO dbo.Exam (ExamCategoryId, Name, Abbreviation, Description)
SELECT c.Id, v.Name, v.Abbreviation, v.Description FROM dbo.ExamCategory c CROSS JOIN (VALUES
    ('Fasting Glucose', NULL, 'Blood glucose — fasting'), ('Glycated Hemoglobin', 'HbA1c', '2-3 month glycemic control'), ('Total Cholesterol and Fractions', NULL, 'LDL, HDL, VLDL'), ('Triglycerides', NULL, NULL), ('Creatinine', NULL, NULL), ('AST', 'AST', 'Aspartate aminotransferase (TGO)'), ('ALT', 'ALT', 'Alanine aminotransferase (TGP)')
) v(Name, Abbreviation, Description) WHERE c.Name = 'Biochemistry (Blood)';

-- Hematology
INSERT INTO dbo.Exam (ExamCategoryId, Name, Abbreviation, Description)
SELECT c.Id, v.Name, v.Abbreviation, v.Description FROM dbo.ExamCategory c CROSS JOIN (VALUES
    ('Complete Blood Count', 'CBC', 'Red cells, white cells and platelets')
) v(Name, Abbreviation, Description) WHERE c.Name = 'Hematology';

-- Hormones & Thyroid
INSERT INTO dbo.Exam (ExamCategoryId, Name, Abbreviation, Description)
SELECT c.Id, v.Name, v.Abbreviation, v.Description FROM dbo.ExamCategory c CROSS JOIN (VALUES
    ('Insulin', NULL, NULL), ('TSH', 'TSH', 'Thyroid-stimulating hormone'), ('Free T4', 'fT4', 'Free thyroxine')
) v(Name, Abbreviation, Description) WHERE c.Name IN ('Hormones', 'Thyroid');

-- 7. SEED DATA - IDENTITY & TRANSACTIONS
-- ============================================================
INSERT INTO dbo.Users (Id, FullName, Email, PhoneNumber, BirthDate, Gender, Username, PasswordHash) VALUES
('A1B2C3D4-E5F6-7A8B-9C0D-1E2F3A4B5C6D', 'Ana Paula Souza',      'ana.souza@email.com',     '11999990001', '1990-03-15', 'Female', 'ana.souza',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('B2C3D4E5-F6A7-8B9C-0D1E-2F3A4B5C6D7E', 'Carlos Henrique Lima', 'carlos.lima@email.com',   '21988880002', '1985-07-22', 'Male',   'carlos.lima', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Ana's Daily Log
DECLARE @anaId UNIQUEIDENTIFIER = 'A1B2C3D4-E5F6-7A8B-9C0D-1E2F3A4B5C6D';
DECLARE @logId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.DailyLog (Id, UserId, LogDate, TotalPoints, Notes)
VALUES (@logId, @anaId, CAST(GETUTCDATE() AS DATE), 0, 'First sample log entry');

INSERT INTO dbo.DailyLogItem (Id, DailyLogId, FoodItemId, Quantity, PointsComputed, MealTime)
SELECT NEWID(), @logId, Id, 1, Points, '12:30' FROM dbo.FoodItem WHERE Name = 'Cooked White Rice';

INSERT INTO dbo.DailyLogItem (Id, DailyLogId, FoodItemId, Quantity, PointsComputed, MealTime)
SELECT NEWID(), @logId, Id, 1, Points, '12:30' FROM dbo.FoodItem WHERE Name = 'Lean Steak (no fat/skin)';

UPDATE dbo.DailyLog SET TotalPoints = (SELECT ISNULL(SUM(CAST(PointsComputed AS INT) * CAST(Quantity AS INT)), 0) FROM dbo.DailyLogItem WHERE DailyLogId = @logId) WHERE Id = @logId;

-- Carlos' Exam Request
DECLARE @carlosId UNIQUEIDENTIFIER = 'B2C3D4E5-F6A7-8B9C-0D1E-2F3A4B5C6D7E';
DECLARE @reqId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.ExamRequest (Id, UserId, RequestDate, DoctorName, Notes)
VALUES (@reqId, @carlosId, CAST(GETUTCDATE() AS DATE), 'Dr. Sinval', 'Routine endocrinology checkup');

INSERT INTO dbo.ExamRequestItem (Id, ExamRequestId, ExamId)
SELECT NEWID(), @reqId, Id FROM dbo.Exam WHERE Name IN ('Fasting Glucose', 'Total Cholesterol and Fractions', 'TSH', 'Complete Blood Count');
GO

-- 8. VIEWS
-- ============================================================
CREATE VIEW dbo.vw_DailyLogDetailed AS
SELECT
    u.Id                AS UserId,
    u.FullName,
    dl.LogDate,
    dl.TotalPoints,
    fc.Name             AS FoodCategory,
    fi.Name             AS FoodItem,
    fi.ServingSize,
    dli.Quantity,
    dli.PointsComputed,
    dli.MealTime
FROM   dbo.DailyLog      dl
JOIN   dbo.Users         u   ON u.Id  = dl.UserId
JOIN   dbo.DailyLogItem  dli ON dli.DailyLogId  = dl.Id
JOIN   dbo.FoodItem      fi  ON fi.Id = dli.FoodItemId
JOIN   dbo.FoodCategory  fc  ON fc.Id = fi.FoodCategoryId;
GO

CREATE VIEW dbo.vw_DailyPointsHistory AS
SELECT
    u.Id                AS UserId,
    u.FullName,
    dl.LogDate,
    dl.TotalPoints,
    COUNT(dli.Id)       AS FoodItemCount
FROM   dbo.DailyLog      dl
JOIN   dbo.Users         u   ON u.Id = dl.UserId
LEFT   JOIN dbo.DailyLogItem dli ON dli.DailyLogId = dl.Id
GROUP  BY u.Id, u.FullName, dl.LogDate, dl.TotalPoints;
GO

CREATE VIEW dbo.vw_ExamsByUser AS
SELECT
    u.Id                AS UserId,
    u.FullName,
    er.RequestDate,
    er.DoctorName,
    ec.Name             AS ExamCategory,
    e.Name              AS ExamName,
    e.Abbreviation,
    eri.IsCompleted,
    eri.CompletedDate,
    eri.Result,
    eri.Laboratory
FROM   dbo.ExamRequest      er
JOIN   dbo.Users            u   ON u.Id   = er.UserId
JOIN   dbo.ExamRequestItem  eri ON eri.ExamRequestId = er.Id
JOIN   dbo.Exam             e   ON e.Id   = eri.ExamId
JOIN   dbo.ExamCategory     ec  ON ec.Id  = e.ExamCategoryId;
GO

PRINT 'BioScoreDb configured successfully.';
GO