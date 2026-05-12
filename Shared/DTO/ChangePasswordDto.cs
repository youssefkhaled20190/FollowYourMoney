using System.ComponentModel.DataAnnotations;

namespace Shared.DTO
{
    public class ChangePasswordDto
    {
        public string CurrrentPassword { get; set; } = string.Empty;
        [Required, MinLength(6), DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;
        public string ComfirmPassword { get; set; } = string.Empty;
    }
}
