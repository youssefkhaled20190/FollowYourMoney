using System.ComponentModel.DataAnnotations;

namespace Shared.DTO
{
    public class RegisterDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required, RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Please enter a valid email address."), EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(6), DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
        [Required, Display(Name = "Comfirm Password"), MinLength(6), DataType(DataType.Password)]
        public string ConfirmPassword { get; set; } = string.Empty;
        public string Role { get; set; } = "Auditor";
    }
}
