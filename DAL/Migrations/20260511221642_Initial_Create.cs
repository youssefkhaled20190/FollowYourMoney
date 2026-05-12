using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Create : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    pkId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldNormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.pkId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    pkId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldFullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    fldIsActive = table.Column<bool>(type: "bit", nullable: false),
                    fldNewUser = table.Column<bool>(type: "bit", nullable: false),
                    fldUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldNormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldNormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    fldEmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    fldPasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldSecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldPhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    fldTwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    fldLockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    fldLockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    fldAccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.pkId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    pkId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkRoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.pkId);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_fkRoleId",
                        column: x => x.fkRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    pkId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.pkId);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    pkLoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    pkProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.pkLoginProvider, x.pkProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    pkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    pkRoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.pkUserId, x.pkRoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_pkRoleId",
                        column: x => x.pkRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_pkUserId",
                        column: x => x.pkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    pkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    pkLoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    pkName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.pkUserId, x.pkLoginProvider, x.pkName });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_pkUserId",
                        column: x => x.pkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Gameyas",
                columns: table => new
                {
                    pkGameyaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldMonthlyContribution = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldTotalMembers = table.Column<int>(type: "int", nullable: false),
                    fldMyTurn = table.Column<int>(type: "int", nullable: false),
                    fldStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    fldIsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gameyas", x => x.pkGameyaId);
                    table.ForeignKey(
                        name: "FK_Gameyas_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Installments",
                columns: table => new
                {
                    pkInstallmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldMonthlyAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldTotalMonths = table.Column<int>(type: "int", nullable: false),
                    fldPaidMonths = table.Column<int>(type: "int", nullable: false),
                    fldStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    fldIsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Installments", x => x.pkInstallmentId);
                    table.ForeignKey(
                        name: "FK_Installments_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonthlySnapshots",
                columns: table => new
                {
                    fldSnapshotId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldYear = table.Column<int>(type: "int", nullable: false),
                    fldMonth = table.Column<int>(type: "int", nullable: false),
                    fldSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldBonuses = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldCarryOver = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldTotalCommitments = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldFreeCash = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldAllocatedToWishlist = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldWeeklyBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlySnapshots", x => x.fldSnapshotId);
                    table.ForeignKey(
                        name: "FK_MonthlySnapshots_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WishlistItems",
                columns: table => new
                {
                    fldItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldTargetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldSavedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldPriority = table.Column<int>(type: "int", nullable: false),
                    fldIsAchieved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WishlistItems", x => x.fldItemId);
                    table.ForeignKey(
                        name: "FK_WishlistItems_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GameyaPayments",
                columns: table => new
                {
                    fldPaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkGameyaId = table.Column<int>(type: "int", nullable: false),
                    fldMonthNumber = table.Column<int>(type: "int", nullable: false),
                    fldType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldPaidOn = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameyaPayments", x => x.fldPaymentId);
                    table.ForeignKey(
                        name: "FK_GameyaPayments_Gameyas_fkGameyaId",
                        column: x => x.fkGameyaId,
                        principalTable: "Gameyas",
                        principalColumn: "pkGameyaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SnapshotTriggers",
                columns: table => new
                {
                    fldTriggerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkSnapshotId = table.Column<int>(type: "int", nullable: false),
                    fldTriggerType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldCashInHand = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    fldNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fldCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SnapshotTriggers", x => x.fldTriggerId);
                    table.ForeignKey(
                        name: "FK_SnapshotTriggers_MonthlySnapshots_fkSnapshotId",
                        column: x => x.fkSnapshotId,
                        principalTable: "MonthlySnapshots",
                        principalColumn: "fldSnapshotId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyBudgets",
                columns: table => new
                {
                    fldWeekBudgetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkSnapshotId = table.Column<int>(type: "int", nullable: false),
                    fldWeekNumber = table.Column<int>(type: "int", nullable: false),
                    fldBudgetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldWeekStart = table.Column<DateOnly>(type: "date", nullable: false),
                    fldWeekEnd = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyBudgets", x => x.fldWeekBudgetId);
                    table.ForeignKey(
                        name: "FK_WeeklyBudgets_MonthlySnapshots_fkSnapshotId",
                        column: x => x.fkSnapshotId,
                        principalTable: "MonthlySnapshots",
                        principalColumn: "fldSnapshotId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    pkExpenseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fldWeekBudgetId = table.Column<int>(type: "int", nullable: false),
                    fldUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    fldCategory = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldExpenseDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.pkExpenseId);
                    table.ForeignKey(
                        name: "FK_Expenses_WeeklyBudgets_fldWeekBudgetId",
                        column: x => x.fldWeekBudgetId,
                        principalTable: "WeeklyBudgets",
                        principalColumn: "fldWeekBudgetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "pkId", "fldConcurrencyStamp", "fldName", "fldNormalizedName" },
                values: new object[] { "1", null, "Admin", "ADMIN" });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "pkId", "fldAccessFailedCount", "fldConcurrencyStamp", "fldEmail", "fldEmailConfirmed", "fldFullName", "fldIsActive", "fldLockoutEnabled", "fldLockoutEnd", "fldNewUser", "fldNormalizedEmail", "fldNormalizedUserName", "fldPasswordHash", "fldPhoneNumber", "fldPhoneNumberConfirmed", "fldSecurityStamp", "fldTwoFactorEnabled", "fldUserName" },
                values: new object[] { "b7e10136-59d9-4908-8546-264213377dd9", 0, "55f3bc74-04ae-46e6-8b06-453eb1eb2c62", "admin@MoneyFollow.com", false, "Admin", true, false, null, false, "ADMIN@MONEYFOLLOW.COM", "ADMIN", "AQAAAAIAAYagAAAAEPFctG6LS8KiYEVdI0doV499jipmFK/3jNgFVjDcPHTor8FuU9BswnPGKzXHt2gLaA==", null, false, "215ad5fe-d73f-47d3-8eb2-213c7b114c90", false, "admin" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "pkRoleId", "pkUserId" },
                values: new object[] { "1", "b7e10136-59d9-4908-8546-264213377dd9" });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_fkRoleId",
                table: "AspNetRoleClaims",
                column: "fkRoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "fldNormalizedName",
                unique: true,
                filter: "[fldNormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_fkUserId",
                table: "AspNetUserClaims",
                column: "fkUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_fkUserId",
                table: "AspNetUserLogins",
                column: "fkUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_pkRoleId",
                table: "AspNetUserRoles",
                column: "pkRoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "fldNormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "fldNormalizedUserName",
                unique: true,
                filter: "[fldNormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_fldUserId_fldExpenseDate",
                table: "Expenses",
                columns: new[] { "fldUserId", "fldExpenseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_fldWeekBudgetId",
                table: "Expenses",
                column: "fldWeekBudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_GameyaPayments_fkGameyaId",
                table: "GameyaPayments",
                column: "fkGameyaId");

            migrationBuilder.CreateIndex(
                name: "IX_Gameyas_fkUserId",
                table: "Gameyas",
                column: "fkUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Installments_fkUserId",
                table: "Installments",
                column: "fkUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlySnapshots_fkUserId_fldYear_fldMonth",
                table: "MonthlySnapshots",
                columns: new[] { "fkUserId", "fldYear", "fldMonth" });

            migrationBuilder.CreateIndex(
                name: "IX_SnapshotTriggers_fkSnapshotId",
                table: "SnapshotTriggers",
                column: "fkSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyBudgets_fkSnapshotId",
                table: "WeeklyBudgets",
                column: "fkSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_fkUserId_fldPriority",
                table: "WishlistItems",
                columns: new[] { "fkUserId", "fldPriority" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "GameyaPayments");

            migrationBuilder.DropTable(
                name: "Installments");

            migrationBuilder.DropTable(
                name: "SnapshotTriggers");

            migrationBuilder.DropTable(
                name: "WishlistItems");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "WeeklyBudgets");

            migrationBuilder.DropTable(
                name: "Gameyas");

            migrationBuilder.DropTable(
                name: "MonthlySnapshots");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
