using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Model
{
    public class PageRole
    {
        public int Id { get; set; }
        public int PageId { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public string Permission { get; set; } = string.Empty;
        [ForeignKey("PageId")]
        public Page? Page { get; set; }
        [ForeignKey("RoleId")]
        public IdentityRole? Role { get; set; }
    }
}
