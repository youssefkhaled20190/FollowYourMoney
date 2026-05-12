using System.ComponentModel.DataAnnotations;

namespace Shared.DTO
{
    public class NewUserDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [RegularExpression(@"^[^@\s]+@egyptair\.com$", ErrorMessage = "Email must be on the domain."), EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public int DepartmentId { get; set; } = -1;
        public int PositionId { get; set; } = -1;
        public bool IsActive { get; set; } = true;
        public bool IsManger { get; set; } = false;
        public bool NewUser { get; set; } = true;
        public string RoleId { get; set; } = string.Empty;
    }
}
