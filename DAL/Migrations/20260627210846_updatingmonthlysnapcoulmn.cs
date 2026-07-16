using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class updatingmonthlysnapcoulmn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "fldTotalCashThisMonth",
                table: "MonthlySnapshots",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "522aa340-f39c-4da0-ab26-912b16064993", "ec0717b7-ed32-4094-8ae8-f837eff7cf68" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fldTotalCashThisMonth",
                table: "MonthlySnapshots");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "6e6418b7-cfda-4cf1-9457-35ba34aca9a4", "1957b133-6aa3-4bfc-be97-ba3edf23564e" });
        }
    }
}
