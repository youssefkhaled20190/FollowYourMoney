using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class add_table_logs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Logs",
                columns: table => new
                {
                    pkId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fkUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    fldObjectId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldObjectType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fldAction = table.Column<int>(type: "int", nullable: false),
                    fldCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    fldOldStateJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Logs", x => x.pkId);
                    table.ForeignKey(
                        name: "FK_Logs_AspNetUsers_fkUserId",
                        column: x => x.fkUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "pkId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "763dca0f-4d07-4a44-9552-59bf3f73ca8c", "b98ecfe0-fefb-4ec0-a26e-0045d8752247" });

            migrationBuilder.CreateIndex(
                name: "IX_Logs_fkUserId",
                table: "Logs",
                column: "fkUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Logs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "55f3bc74-04ae-46e6-8b06-453eb1eb2c62", "215ad5fe-d73f-47d3-8eb2-213c7b114c90" });
        }
    }
}
