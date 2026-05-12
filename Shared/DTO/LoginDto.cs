using System.ComponentModel.DataAnnotations;

namespace Shared.DTO
{
    public class LoginDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required, DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
        [Display(Name = "Remember Me?")]
        public bool RememberMe { get; set; } = false;
    }
}
