using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class addingnewcoulmningamayastableII : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "fldEndDate",
                table: "Gameyas",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "6e6418b7-cfda-4cf1-9457-35ba34aca9a4", "1957b133-6aa3-4bfc-be97-ba3edf23564e" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fldEndDate",
                table: "Gameyas");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "0ceb9b20-0459-48aa-b029-5c3b607e6f3d", "0214b3b3-de1e-4dc2-bd93-c20737a0191e" });
        }
    }
}
