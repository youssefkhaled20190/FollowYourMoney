using Microsoft.AspNetCore.Identity;
using Shared.DTO;
namespace BLL.Services
{
    public interface IUserService
    {
        Task<UserDto?> CreateAsync(NewUserDto dto, string createdBy); // CreateUser Dto
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string id);
        Task<UserDto?> UpdateAsync(EditUserDto dto, string updatedBy);   // UpdateUser Dto 
        Task<bool> UpdateStatusUserAsync(string id, bool isAvailable,string updatedBy);
        Task<bool> DeleteAsync(string id, string deletedBy);
        public Task<List<RoleDto>> GetAllRoleAsync();
    }
}
