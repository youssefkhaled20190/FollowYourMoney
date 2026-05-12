using DAL.Context;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DAL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly string _adminUserId = "b7e10136-59d9-4908-8546-264213377dd9";
        private readonly Context.ApplicationDbContext _context;

        public UserRepository(UserManager<User> userManager, RoleManager<IdentityRole> roleManager, Context.ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<User?> CreateAsync(User user, string password, string roleName)
        {
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                throw new ArgumentException(errors);
            }
            if (!string.IsNullOrWhiteSpace(roleName))
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                    throw new ArgumentException("Role not existed");

                await _userManager.AddToRoleAsync(user, roleName);
            }

            return user;
        }

        public async Task<User?> GetByIdAsync(string id) =>
            await _userManager.FindByIdAsync(id);

        public async Task<User?> GetByUserNameAsync(string username) =>
            await _userManager.FindByNameAsync(username);

        public async Task<string?> GetRoleAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return roles.FirstOrDefault();
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            var itAdminUsers = await _userManager.GetUsersInRoleAsync("IT ADMIN");
            var itAdminUserIds = itAdminUsers.Select(u => u.Id).ToList();

            var excludedUserIds = new List<string>(itAdminUserIds);
            excludedUserIds.Add(this._adminUserId);
            var users = await _userManager.Users.Where(u => !excludedUserIds.Contains(u.Id)).ToListAsync();

            var userIds = users.Select(u => u.Id).ToList();
            var userRoles = await
            (
                from ur in _context.UserRoles
                join r in _context.Roles on ur.RoleId equals r.Id
                where userIds.Contains(ur.UserId)
                select new
                {
                    ur.UserId,
                    RoleId = r.Id,
                    RoleName = r.Name!
                }
            ).ToListAsync();
            foreach (var user in users)
            {
                var Roles = new List<Role>();
                Roles = userRoles
                    .Where(ur => ur.UserId == user.Id)
                    .Select(ur => new Role
                    {
                        RoleId = ur.RoleId,
                        RoleName = ur.RoleName
                    })
                    .ToList();
                user.Roles = Roles;
            }
            return users;
        }

        public async Task<User?> UpdateAsync(User user, string roleName, string password = "")
        {
            var existingUser = await _userManager.FindByIdAsync(user.Id);
            if (existingUser == null)
                return null;

            // update fields
            existingUser.UserName = user.UserName;
            existingUser.Email = user.Email;
            existingUser.FullName = user.FullName;
            existingUser.IsActive = user.IsActive;
        
            if (!string.IsNullOrEmpty(password) && password != "")
            {
                existingUser.NewUser = true;
            }
            var result = await _userManager.UpdateAsync(existingUser);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                throw new ArgumentException(errors);
            }

            // update role
            var currentRoles = await _userManager.GetRolesAsync(existingUser);
            await _userManager.RemoveFromRolesAsync(existingUser, currentRoles);
            await _userManager.AddToRoleAsync(existingUser, roleName);

            if (!string.IsNullOrEmpty(password) && password != "")
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(existingUser);
                var passwordResult = await _userManager.ResetPasswordAsync(existingUser, token, password);
                if (!passwordResult.Succeeded)
                {
                    var errors = string.Join(" ", passwordResult.Errors.Select(e => e.Description));
                    throw new ArgumentException(errors);
                }
            }
            return existingUser;
        }

        public async Task<bool> UpdateStatusUserAsync(User user, bool isAvailable)
        {
            var existingUser = await _userManager.FindByIdAsync(user.Id);
            if (existingUser == null)
                return false;
            //existingUser.Available = isAvailable;
            var result = await _userManager.UpdateAsync(existingUser);
            return result.Succeeded;
        }

        public async Task<IdentityResult> AddToRoleAsync(User user, string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
                throw new ArgumentException($"This Role doesn't exist");

            return await _userManager.AddToRoleAsync(user, roleName);
        }

        public async Task<IdentityResult> RemoveFromRoleAsync(User user, string roleName)
        {
            return await _userManager.RemoveFromRoleAsync(user, roleName);
        }

        public async Task<string?> ResolveRoleNameByIdAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            return role?.Name;
        }

        public async Task<string?> ResolveRoleIdByNameAsync(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            return role?.Id;
        }

        public async Task<bool> IsUserNameTakenAsync(string username, string? excludeUserId = null)
        {
            return await _userManager.Users
         .AnyAsync(u => u.UserName == username && u.Id != excludeUserId);
        }

        public async Task<bool> DeleteAsync(string userId, string DeletedById)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;
            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        public async Task<List<IdentityRole>> GetAllRoleAsync()
        {
            var roles = await _roleManager.Roles.Where(I => I.NormalizedName != "IT ADMIN").ToListAsync();
            return roles;
        }
        public async Task<IDbContextTransaction> GenerateTransaction()
        {
            if (_context.Database.CurrentTransaction != null)
            {
                return _context.Database.CurrentTransaction;
            }

            return await _context.Database.BeginTransactionAsync();
        }
    }
}