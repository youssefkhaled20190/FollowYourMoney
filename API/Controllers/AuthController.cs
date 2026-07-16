using BLL.Services;
using Shared.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly IAuthRepository _authService;

        public AuthController(IAuthRepository authService)
        {
            _authService = authService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var registerResult = await _authService.Register(dto);
            if (!registerResult.Result.Succeeded)
                return BadRequest(registerResult.Result.Errors);

            return Ok(new { rslt = true, message = "User added successfully" });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var loginResult = await _authService.Login(dto);
            if (!loginResult.Result.Succeeded)
                return Unauthorized();

            string userName = "";
            string userRole = loginResult.Role ?? "";

            if (!string.IsNullOrEmpty(loginResult.Token))
            {
                Response.Cookies.Append("jwt", loginResult.Token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(7),
                    Path = "/"
                });

                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(loginResult.Token);
                userName = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name" || c.Type == ClaimTypes.Name)?.Value ?? "";
            }

            string defaultPage = "";
            if (userRole == "Admin")
            {
                defaultPage = "";
            }

            if (loginResult.ChangePassword == true)
            {
                return Ok(new { Result = true, UserName = userName, UserRole = userRole, DefaultPage = "Auth/ChangePassword" });
            }

            return Ok(new { Result = true, UserName = userName, UserRole = userRole, DefaultPage = defaultPage });
        }

        [HttpPost("CheckRole")]
        [Authorize]
        public IActionResult CheckRole([FromBody] string Role)
        {
            if (string.IsNullOrEmpty(Role))
            {
                return Ok(new { rslt = false, message = "Role must be given to check" });
            }
            bool HaseRole = User.IsInRole(Role);
            if (!HaseRole)
            {
                return Ok(new { rslt = false, message = "You don't have the required role" });
            }
            return Ok(new { rslt = true, message = "You have the required role" });
        }

        [HttpPost("UpdatePassword")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] ChangePasswordDto formBody)
        {
            if (string.IsNullOrEmpty(formBody.NewPassword) || string.IsNullOrEmpty(formBody.ComfirmPassword))
            {
                return BadRequest(new { rslt = false, message = "Password and password comfirm must be added" });
            }
            if (string.IsNullOrEmpty(formBody.CurrrentPassword))
            {
                return BadRequest(new { rslt = false, message = "Current password must be given to check" });
            }
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var rslt = await _authService.ChangePassword(userId ?? "", formBody);
                await this.blockToken();
                Response.Cookies.Delete("jwt", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/"
                });
                return Ok(new { rslt = rslt, message = "Password changed successfully", DefaultPage = "Auth/Login" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { rslt = false, message = ex.Message });
            }
        }

        [HttpGet("CheckLogins")]
        [Authorize]
        public IActionResult CheckLogins()
        {
            var userName = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name) ?? "";
            var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
            return Ok(new { Result = true, Message = "Already logged in", UserName = userName, UserRole = userRole });
        }

        [HttpPost("Logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            await this.blockToken();
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            return Ok(new { rslt = true, message = "Logged out successfully" });
        }

        [HttpPost("resetPassword/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<bool> ResetPassword([FromBody] ChangePasswordDto dto, string id)
        {
            var isReset = await _authService.ResetPassword(id, dto.NewPassword);
            return isReset;
        }

        [HttpGet("ReAssign")]
        [Authorize]
        public async Task<IActionResult> ReAssign()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new { Result = false, Message = "The User Is not Exists" });
            }
            await this.blockToken();
            var Token = await _authService.ReGenerateToken(userId!);
            if (string.IsNullOrEmpty(Token))
                return Ok(new { Result = false, Message = "An error occurred while log in" });

            Response.Cookies.Append("jwt", Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7),
                Path = "/"
            });

            var userName = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name) ?? "";
            var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

            return Ok(new { Result = true, UserName = userName, UserRole = userRole });
        }

        private async Task blockToken()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if ((string.IsNullOrEmpty(token) || token == "cookie") && Request.Cookies.ContainsKey("jwt"))
            {
                token = Request.Cookies["jwt"];
            }
            if (!string.IsNullOrEmpty(token) && token != "cookie")
            {
                try
                {
                    await _authService.Logout(token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error blocking token: {ex.Message}");
                }
            }
        }
    }
}
