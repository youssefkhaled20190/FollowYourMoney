namespace Shared.DTO
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime UpdateAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UpdatedByUserId { get; set; } = string.Empty;

        public UserDto? UpdatedByUser { get; set; }
    }
}
