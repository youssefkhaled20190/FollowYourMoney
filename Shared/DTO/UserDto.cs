namespace Shared.DTO
{
    public class UserDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public int DepartmentId { get; set; } = -1;
        public int PositionId { get; set; } = -1;
        public bool IsActive { get; set; } = true;
        public bool NewUser { get; set; } = true;
        public bool IsManger { get; set; } = false;
        public List<RoleDto>? Roles { get; set; }
    }
}
