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
        [Authorize(Roles = "Admin")]
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
            if (loginResult.ChangePassword == true)
            {
                return Ok(new { Token = loginResult.Token, DefaultPage = "Auth/ChangePassword" });
            }
            string defaultPage = "";
            if (User.IsInRole("Admin"))
            {
                defaultPage = "";
            }
            return Ok(new { Token = loginResult.Token, DefaultPage = defaultPage });
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
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "Already loged in" });
        }

        [HttpPost("Logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await this.blockToken();
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
            return Ok(new { Result = true, Token = Token });
        }

        private async Task blockToken()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            await _authService.Logout(token);
        }

    }
}
