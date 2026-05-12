
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Model
{
    public class Logs
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string ObjectId { get; set; } = string.Empty;
        public string ObjectType { get; set; } = string.Empty;
        public LogActionEnum Action { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? OldStateJson { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
