using DAL.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage;

namespace DAL.Interfaces
{
    public interface IUserRepository
    {
        public Task<User?> CreateAsync(User user, string password, string roleName);
        public Task<User?> GetByIdAsync(string id);
        public Task<User?> GetByUserNameAsync(string username);
        public Task<string?> GetRoleAsync(User user);
        public Task<IEnumerable<User>> GetAllAsync();
        public Task<User?> UpdateAsync(User user, string roleName, string password = "");
        public Task<bool> UpdateStatusUserAsync(User user, bool isAvailable);
        // Role management
        public Task<IdentityResult> AddToRoleAsync(User user, string roleName);
        public Task<IdentityResult> RemoveFromRoleAsync(User user, string roleName);
        public Task<string?> ResolveRoleNameByIdAsync(string roleId);
        public Task<string?> ResolveRoleIdByNameAsync(string roleName);
        public Task<bool> IsUserNameTakenAsync(string username, string? excludeUserId = null);
        public Task<bool> DeleteAsync(string UserId, string DeletedById);
        public Task<List<IdentityRole>> GetAllRoleAsync();
        public Task<IDbContextTransaction> GenerateTransaction();
    }
}
