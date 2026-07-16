using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddWishlistAndBlueprintEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "fldDueDate",
                table: "WishlistItems",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "fldSavePercentage",
                table: "WishlistItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "fldCustomWeeklyBudget",
                table: "MonthlySnapshots",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "fldWishlistPercentage",
                table: "MonthlySnapshots",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "2e2b3281-de12-4389-ba5a-6b1fa75e3686", "90bd7e5b-2266-4527-889b-59215b7bbe07" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fldDueDate",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "fldSavePercentage",
                table: "WishlistItems");

            migrationBuilder.DropColumn(
                name: "fldCustomWeeklyBudget",
                table: "MonthlySnapshots");

            migrationBuilder.DropColumn(
                name: "fldWishlistPercentage",
                table: "MonthlySnapshots");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "c4ca18c9-5f51-4e26-8fcf-67041c17bfa4", "924a0263-cb18-435a-bb7e-d100e1945a67" });
        }
    }
}
