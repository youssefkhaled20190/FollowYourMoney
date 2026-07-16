using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class makeIsAchivedandIsCriticalfalse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "5e79ca04-ed9c-42d6-875c-19ff941c2500", "aac6d0b5-ed9c-4699-a1dc-5f8947b3bbe2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "7c0d5de4-dc93-48a3-ab22-03b699993896", "5810deb7-6900-4df8-89e0-7c311c04ec24" });
        }
    }
}
