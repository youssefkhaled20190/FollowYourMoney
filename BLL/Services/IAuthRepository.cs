using Shared.DTO;
using Microsoft.AspNetCore.Identity;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace BLL.Services
{
    public interface IAuthRepository
    {
        public Task<(IdentityResult Result, string? Token)> Register(RegisterDto dto);
        public Task<(SignInResult Result, string? Token, string? Role, bool? ChangePassword)> Login(LoginDto dto);
        public Task Logout(string userId);
        public Task<bool> RoleExists(string roleName);
        public Task<bool> ChangePassword(string userId, ChangePasswordDto passDto);
        public Task<bool> ResetPassword(string userId, string password);
        public Task<string> ReGenerateToken(string UserId);
    }
}
