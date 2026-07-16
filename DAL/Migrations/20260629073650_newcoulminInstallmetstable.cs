using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class newcoulminInstallmetstable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "fldEndDate",
                table: "Installments",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "86772632-e68b-4751-94da-342805b7b8d9", "277e05e6-3b6a-4f56-a850-f57f4434fd56" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fldEndDate",
                table: "Installments");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "pkId",
                keyValue: "b7e10136-59d9-4908-8546-264213377dd9",
                columns: new[] { "fldConcurrencyStamp", "fldSecurityStamp" },
                values: new object[] { "522aa340-f39c-4da0-ab26-912b16064993", "ec0717b7-ed32-4094-8ae8-f837eff7cf68" });
        }
    }
}
