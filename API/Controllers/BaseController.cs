using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class BaseController : ControllerBase
    {
        protected string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        protected string CurrentUserName => User.Identity?.Name ?? "Guest";
        protected string CurrentUserRole => User.FindFirstValue(ClaimTypes.Role) ?? "Guest";
        protected int CurrentUserDepartmentId => int.TryParse(User.FindFirstValue("Department"), out var d) ? d : -1;
        protected bool IsManger => bool.TryParse(User.FindFirstValue("IsManger"), out var d) ? d : false;
    }
}
