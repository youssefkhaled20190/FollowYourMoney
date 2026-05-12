using BLL.JWT;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Shared.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace BLL.Services
{
    public class AuthService : IAuthRepository
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly JwtAuthOption _jwtOptions;
        private readonly ITokenBlacklistService _blacklist;
        private readonly IUserRepository _userRepository;
        private readonly ILogsRepository _logs;
        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, RoleManager<IdentityRole> roleManager, IOptions<JwtAuthOption> jwtOptions, ITokenBlacklistService blacklist, IUserRepository userRepository, ILogsRepository log)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtOptions = jwtOptions.Value;
            _blacklist = blacklist;
            _userRepository = userRepository;
            _logs = log;
        }

        public async Task<(IdentityResult Result, string? Token)> Register(RegisterDto dto)
        {
            var user = new User { UserName = dto.UserName, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, dto.Role);
                var roles = await _userManager.GetRolesAsync(user);
                var token = GenerateJwtToken(user, roles);
                return (result, token);
            }
           
            return (result, null);
        }

        public async Task<(SignInResult Result, string? Token, string? Role, bool? ChangePassword)> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.UserName);
            if (user == null)
            {
                user = await _userManager.FindByNameAsync(dto.UserName);
                if (user == null)
                    return (SignInResult.Failed, null, null, false);
            }

            if (!user.IsActive)
                return (SignInResult.Failed, null, null, false); // User is disabled

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (result.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var token = GenerateJwtToken(user, roles);
                await _logs.AddAsync(new Logs
                {
                    UserId = user.Id,
                    ObjectId = user.Id,
                    ObjectType = "Login",
                    Action = LogActionEnum.LOGIN,
                });
                return (result, token, roles[0], user.NewUser);
            }
        
            return (result, null, null, false);
        }

        public async Task Logout(string token)
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            var jti = jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;

            await _blacklist.RevokeAsync(jti, jwt.ValidTo); // store until token expires
        }

        public Task<bool> RoleExists(string roleName)
        {
            return _roleManager.RoleExistsAsync(roleName);
        }

        public async Task<bool> ChangePassword(string userId, ChangePasswordDto passDto)
        {
            User? user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            var result = await _signInManager.CheckPasswordSignInAsync(user, passDto.CurrrentPassword, false);
            if (!result.Succeeded)
            {
                throw new Exception("Current password is wrong");
            }
            if (passDto.NewPassword != passDto.ComfirmPassword)
            {
                throw new Exception("The password does not match");
            }

            var ok = await _userManager.ChangePasswordAsync(user, passDto.CurrrentPassword, passDto.NewPassword);
            if (!ok.Succeeded)
            {
                throw new Exception(string.Join(", ", ok.Errors.Select(e => e.Description)));
            }
            user.NewUser = false;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                throw new Exception(string.Join(", ", updateResult.Errors.Select(e => e.Description)));
            }
            return true;
        }

        public async Task<bool> ResetPassword(string userId, string password)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("User not found");
            var removeResult = await _userManager.RemovePasswordAsync(user);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to remove old password: {errors}");
            }
            var addResult = await _userManager.AddPasswordAsync(user, password);
            user.NewUser = true;
            await _userManager.UpdateAsync(user);
            return true;
        }

        public async Task<string> ReGenerateToken(string UserId)
        {
            var user = await _userRepository.GetByIdAsync(UserId);
            if (user == null)
                return "";
            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            return token;
        }

        private string GenerateJwtToken(User user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, roles[0]),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SigningKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtOptions.DurationInMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
