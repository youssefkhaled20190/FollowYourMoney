using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTO;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : BaseController
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GetUserById(string userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not add user" });
            }
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "User loaded successfully", Data = user });
        }
        [HttpPost("Add")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateUser([FromBody] NewUserDto newUser)
        {
            var createdUser = await _userService.CreateAsync(newUser, User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (createdUser == null) {
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not add user" });
            }
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "User added successfully", Data = createdUser });
        }
        [HttpPost("Update")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Update([FromBody] EditUserDto user)
        {
            var updatedUser = await _userService.UpdateAsync(user, User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (updatedUser == null)
            {
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not update user" });
            }
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "User updated successfully", Data = updatedUser });
        }
        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(string userId)
        {
            var result = await _userService.DeleteAsync(userId, User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (!result)
            {
                return StatusCode(200, new GeneralResponseDto { Result = false, Message = "Could not delete user" });
            }
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "User deleted successfully" });
        }

        [HttpGet("ListAll")]
        [Authorize]
        public async Task<ActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllAsync();
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "Users listed successfully", Data = users });
        }

        [HttpGet("ListAllRoles")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GetAllRoles()
        {
            var users = await _userService.GetAllRoleAsync();
            return StatusCode(200, new GeneralResponseDto { Result = true, Message = "Roles listed successfully", Data = users });
        }
    }
}
